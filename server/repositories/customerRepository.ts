import { BaseRepository, DatabaseUtils } from '../database';
import { Customer } from '@shared/types';

export class CustomerRepository extends BaseRepository {
  
  async findAll(companyId: string, options: {
    page?: number;
    limit?: number;
    search?: string;
    isActive?: boolean;
  } = {}): Promise<{ customers: Customer[]; total: number }> {
    const { page = 1, limit = 10, search, isActive } = options;
    
    let whereClause = 'WHERE company_id = $1';
    const params: any[] = [companyId];
    let paramIndex = 2;

    if (isActive !== undefined) {
      whereClause += ` AND is_active = $${paramIndex}`;
      params.push(isActive);
      paramIndex++;
    }

    if (search) {
      whereClause += ` AND (name ILIKE $${paramIndex} OR email ILIKE $${paramIndex} OR phone ILIKE $${paramIndex})`;
      params.push(`%${search}%`);
      paramIndex++;
    }

    // Get total count
    const countQuery = `
      SELECT COUNT(*) as total
      FROM customers
      ${whereClause}
    `;
    const countResult = await this.db.query(countQuery, params);
    const total = parseInt(countResult.rows[0].total);

    // Get paginated results
    const dataQuery = `
      SELECT *
      FROM customers
      ${whereClause}
      ORDER BY name ASC
      ${this.buildPagination(page, limit)}
    `;
    
    const result = await this.db.query(dataQuery, params);
    const customers = this.toCamelCase(result.rows).map(customer => ({
      ...customer,
      balance: customer.currentBalance || 0 // Map current_balance to balance for frontend
    })) as Customer[];

    return { customers, total };
  }

  async findById(id: string, companyId: string): Promise<Customer | null> {
    const query = `
      SELECT *
      FROM customers
      WHERE id = $1 AND company_id = $2
    `;

    const result = await this.db.query(query, [id, companyId]);

    if (result.rows.length === 0) {
      return null;
    }

    const customer = this.toCamelCase(result.rows[0]);
    return {
      ...customer,
      balance: customer.currentBalance || 0 // Map current_balance to balance for frontend
    } as Customer;
  }

  async create(customerData: Omit<Customer, 'id' | 'createdAt' | 'updatedAt'>): Promise<Customer> {
    // Map balance to current_balance for database compatibility
    const { balance, ...restData } = customerData;
    const data = this.toSnakeCase({
      id: 'uuid_generate_v4()',
      ...restData,
      currentBalance: balance || 0,
      customerNumber: customerData.customerNumber || await this.generateCustomerNumber(customerData.companyId),
      createdAt: new Date(),
      updatedAt: new Date()
    });

    // Remove id from data and add it as DEFAULT
    delete data.id;

    const { query, values } = DatabaseUtils.buildInsertQuery('customers', data);
    const finalQuery = query.replace('uuid_generate_v4()', 'DEFAULT');
    
    const result = await this.db.query(finalQuery, values);
    const customer = this.toCamelCase(result.rows[0]);
    return {
      ...customer,
      balance: customer.currentBalance || 0 // Map current_balance to balance for frontend
    } as Customer;
  }

  async update(id: string, companyId: string, updateData: Partial<Customer>): Promise<Customer | null> {
    const data = this.toSnakeCase(updateData);
    delete data.id;
    delete data.created_at;
    delete data.updated_at;

    const { query, values } = DatabaseUtils.buildUpdateQuery(
      'customers',
      data,
      { id, company_id: companyId }
    );

    const result = await this.db.query(query, values);

    if (result.rows.length === 0) {
      return null;
    }

    const customer = this.toCamelCase(result.rows[0]);
    return {
      ...customer,
      balance: customer.currentBalance || 0 // Map current_balance to balance for frontend
    } as Customer;
  }

  async delete(id: string, companyId: string): Promise<boolean> {
    const query = `
      DELETE FROM customers
      WHERE id = $1 AND company_id = $2
    `;
    
    const result = await this.db.query(query, [id, companyId]);
    return result.rowCount > 0;
  }

  async updateBalance(customerId: string, amount: number): Promise<void> {
    const query = `
      UPDATE customers
      SET current_balance = current_balance + $1, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
    `;
    
    await this.db.query(query, [amount, customerId]);
  }

  async getOutstandingBalance(customerId: string): Promise<number> {
    const query = `
      SELECT COALESCE(SUM(balance_due), 0) as outstanding
      FROM invoices
      WHERE customer_id = $1 AND status != 'cancelled' AND balance_due > 0
    `;
    
    const result = await this.db.query(query, [customerId]);
    return parseFloat(result.rows[0].outstanding) || 0;
  }

  private async generateCustomerNumber(companyId: string): Promise<string> {
    const query = `
      UPDATE number_sequences
      SET current_number = current_number + 1
      WHERE company_id = $1 AND sequence_type = 'customer'
      RETURNING current_number
    `;
    
    try {
      const result = await this.db.query(query, [companyId]);
      if (result.rows.length > 0) {
        const number = result.rows[0].current_number;
        return `CUST-${String(number).padStart(3, '0')}`;
      }
    } catch (error) {
      // If sequence doesn't exist, create it
      const insertQuery = `
        INSERT INTO number_sequences (company_id, sequence_type, prefix, current_number)
        VALUES ($1, 'customer', 'CUST', 1)
        ON CONFLICT (company_id, sequence_type) DO UPDATE
        SET current_number = number_sequences.current_number + 1
        RETURNING current_number
      `;
      
      const result = await this.db.query(insertQuery, [companyId]);
      const number = result.rows[0].current_number;
      return `CUST-${String(number).padStart(3, '0')}`;
    }

    // Fallback
    return `CUST-${Date.now()}`;
  }
}

export default new CustomerRepository();
