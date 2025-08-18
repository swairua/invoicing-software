import { BaseRepository, DatabaseUtils } from "../database";
import { Customer } from "@shared/types";

export class CustomerRepository extends BaseRepository {
  async findAll(
    companyId: string,
    options: {
      page?: number;
      limit?: number;
      search?: string;
      isActive?: boolean;
    } = {},
  ): Promise<{ customers: Customer[]; total: number }> {
    const { page = 1, limit = 10, search, isActive } = options;

    let whereClause = "WHERE company_id = ?";
    const params: any[] = [companyId];

    if (isActive !== undefined) {
      whereClause += ` AND is_active = ?`;
      params.push(isActive);
    }

    if (search) {
      whereClause += ` AND (name LIKE ? OR email LIKE ? OR phone LIKE ?)`;
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
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
    const offset = (page - 1) * limit;
    const dataQuery = `
      SELECT *
      FROM customers
      ${whereClause}
      ORDER BY name ASC
      LIMIT ? OFFSET ?
    `;

    const result = await this.db.query(dataQuery, [...params, limit, offset]);

    return {
      customers: this.toCamelCase(result.rows) as Customer[],
      total,
    };
  }

  async findById(id: string, companyId: string): Promise<Customer | null> {
    const query = "SELECT * FROM customers WHERE id = ? AND company_id = ?";
    const result = await this.db.query(query, [id, companyId]);

    if (result.rows.length === 0) {
      return null;
    }

    return this.toCamelCase(result.rows[0]) as Customer;
  }

  async create(
    customerData: Omit<Customer, "id" | "createdAt" | "updatedAt">,
  ): Promise<Customer> {
    const data = this.toSnakeCase(customerData);
    data.id = null; // Let MySQL generate the UUID
    delete data.created_at;
    delete data.updated_at;

    const { query, values } = DatabaseUtils.buildInsertQuery("customers", data);

    const result = await this.db.query(query, values);
    
    // For MySQL, we need to fetch the created record
    const insertedId = result.insertId || data.id;
    return this.findById(insertedId, customerData.companyId) as Promise<Customer>;
  }

  async update(
    id: string,
    companyId: string,
    updateData: Partial<Customer>,
  ): Promise<Customer | null> {
    const data = this.toSnakeCase(updateData);
    delete data.id;
    delete data.created_at;
    delete data.updated_at;

    const { query, values } = DatabaseUtils.buildUpdateQuery(
      "customers",
      data,
      { id, company_id: companyId },
    );

    const result = await this.db.query(query, values);

    if (result.affectedRows === 0) {
      return null;
    }

    return this.findById(id, companyId);
  }

  async delete(id: string, companyId: string): Promise<boolean> {
    const query = `
      UPDATE customers 
      SET is_active = FALSE, updated_at = CURRENT_TIMESTAMP 
      WHERE id = ? AND company_id = ?
    `;

    const result = await this.db.query(query, [id, companyId]);
    return result.affectedRows > 0;
  }

  async getOutstandingBalance(
    customerId: string,
    companyId: string,
  ): Promise<number> {
    const query = `
      SELECT COALESCE(SUM(balance_due), 0) as outstanding_balance
      FROM invoices
      WHERE customer_id = ? AND company_id = ? AND status != 'cancelled'
    `;

    const result = await this.db.query(query, [customerId, companyId]);
    return parseFloat(result.rows[0].outstanding_balance) || 0;
  }

  async updateBalance(
    customerId: string,
    companyId: string,
    amount: number,
    operation: "increase" | "decrease",
  ): Promise<void> {
    const operator = operation === "increase" ? "+" : "-";
    const query = `
      UPDATE customers 
      SET current_balance = current_balance ${operator} ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ? AND company_id = ?
    `;

    await this.db.query(query, [Math.abs(amount), customerId, companyId]);
  }
}

export default new CustomerRepository();
