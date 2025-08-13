import { BaseRepository, DatabaseUtils } from '../database';
import { Product } from '@shared/types';

export class ProductRepository extends BaseRepository {
  
  async findAll(companyId: string, options: {
    page?: number;
    limit?: number;
    search?: string;
    categoryId?: string;
    status?: string;
    lowStock?: boolean;
  } = {}): Promise<{ products: Product[]; total: number }> {
    const { page = 1, limit = 10, search, categoryId, status, lowStock } = options;
    
    let whereClause = 'WHERE p.company_id = $1';
    const params: any[] = [companyId];
    let paramIndex = 2;

    if (search) {
      whereClause += ` AND (p.name ILIKE $${paramIndex} OR p.sku ILIKE $${paramIndex} OR p.description ILIKE $${paramIndex})`;
      params.push(`%${search}%`);
      paramIndex++;
    }

    if (categoryId) {
      whereClause += ` AND p.category_id = $${paramIndex}`;
      params.push(categoryId);
      paramIndex++;
    }

    if (status) {
      whereClause += ` AND p.status = $${paramIndex}`;
      params.push(status);
      paramIndex++;
    }

    if (lowStock) {
      whereClause += ` AND p.current_stock <= p.min_stock AND p.track_inventory = TRUE`;
    }

    // Get total count
    const countQuery = `
      SELECT COUNT(*) as total
      FROM products p
      ${whereClause}
    `;
    const countResult = await this.db.query(countQuery, params);
    const total = parseInt(countResult.rows[0].total);

    // Get paginated results with category information
    const dataQuery = `
      SELECT 
        p.*,
        pc.name as category_name,
        s.name as supplier_name
      FROM products p
      LEFT JOIN product_categories pc ON p.category_id = pc.id
      LEFT JOIN suppliers s ON p.supplier_id = s.id
      ${whereClause}
      ORDER BY p.name ASC
      ${this.buildPagination(page, limit)}
    `;
    
    const result = await this.db.query(dataQuery, params);
    const products = this.toCamelCase(result.rows) as Product[];

    return { products, total };
  }

  async findById(id: string, companyId: string): Promise<Product | null> {
    const query = `
      SELECT 
        p.*,
        pc.name as category_name,
        s.name as supplier_name
      FROM products p
      LEFT JOIN product_categories pc ON p.category_id = pc.id
      LEFT JOIN suppliers s ON p.supplier_id = s.id
      WHERE p.id = $1 AND p.company_id = $2
    `;
    
    const result = await this.db.query(query, [id, companyId]);
    
    if (result.rows.length === 0) {
      return null;
    }

    return this.toCamelCase(result.rows[0]) as Product;
  }

  async findBySku(sku: string, companyId: string): Promise<Product | null> {
    const query = `
      SELECT *
      FROM products
      WHERE sku = $1 AND company_id = $2
    `;
    
    const result = await this.db.query(query, [sku, companyId]);
    
    if (result.rows.length === 0) {
      return null;
    }

    return this.toCamelCase(result.rows[0]) as Product;
  }

  async create(productData: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Promise<Product> {
    const data = this.toSnakeCase({
      ...productData,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    const { query, values } = DatabaseUtils.buildInsertQuery('products', data);
    
    const result = await this.db.query(query, values);
    return this.toCamelCase(result.rows[0]) as Product;
  }

  async update(id: string, companyId: string, updateData: Partial<Product>): Promise<Product | null> {
    const data = this.toSnakeCase(updateData);
    delete data.id;
    delete data.created_at;
    delete data.updated_at;

    const { query, values } = DatabaseUtils.buildUpdateQuery(
      'products',
      data,
      { id, company_id: companyId }
    );

    const result = await this.db.query(query, values);
    
    if (result.rows.length === 0) {
      return null;
    }

    return this.toCamelCase(result.rows[0]) as Product;
  }

  async updateStock(id: string, quantity: number, movementType: 'in' | 'out' | 'adjustment'): Promise<void> {
    await this.db.transaction(async (client) => {
      // Get current stock
      const stockQuery = 'SELECT current_stock FROM products WHERE id = $1';
      const stockResult = await client.query(stockQuery, [id]);
      
      if (stockResult.rows.length === 0) {
        throw new Error('Product not found');
      }

      const currentStock = parseFloat(stockResult.rows[0].current_stock);
      let newStock: number;

      switch (movementType) {
        case 'in':
          newStock = currentStock + quantity;
          break;
        case 'out':
          newStock = Math.max(0, currentStock - quantity);
          break;
        case 'adjustment':
          newStock = quantity;
          break;
        default:
          throw new Error('Invalid movement type');
      }

      // Update product stock
      const updateQuery = `
        UPDATE products
        SET current_stock = $1, updated_at = CURRENT_TIMESTAMP
        WHERE id = $2
      `;
      await client.query(updateQuery, [newStock, id]);

      // Create stock movement record
      const movementQuery = `
        INSERT INTO stock_movements (
          company_id, product_id, movement_type, quantity,
          previous_stock, new_stock, reference_type
        )
        SELECT company_id, id, $1, $2, $3, $4, 'adjustment'
        FROM products WHERE id = $5
      `;
      await client.query(movementQuery, [movementType, quantity, currentStock, newStock, id]);
    });
  }

  async getLowStockProducts(companyId: string): Promise<Product[]> {
    const query = `
      SELECT 
        p.*,
        pc.name as category_name,
        (p.min_stock - p.current_stock) as stock_shortage
      FROM products p
      LEFT JOIN product_categories pc ON p.category_id = pc.id
      WHERE p.company_id = $1 
        AND p.current_stock <= p.min_stock 
        AND p.track_inventory = TRUE 
        AND p.is_active = TRUE
      ORDER BY (p.min_stock - p.current_stock) DESC
    `;
    
    const result = await this.db.query(query, [companyId]);
    return this.toCamelCase(result.rows) as Product[];
  }

  async getStockMovements(productId: string, limit: number = 10): Promise<any[]> {
    const query = `
      SELECT 
        sm.*,
        u.first_name || ' ' || u.last_name as created_by_name
      FROM stock_movements sm
      LEFT JOIN users u ON sm.created_by = u.id
      WHERE sm.product_id = $1
      ORDER BY sm.created_at DESC
      LIMIT $2
    `;
    
    const result = await this.db.query(query, [productId, limit]);
    return this.toCamelCase(result.rows);
  }

  async searchProducts(companyId: string, searchTerm: string, limit: number = 10): Promise<Product[]> {
    const query = `
      SELECT 
        p.*,
        pc.name as category_name
      FROM products p
      LEFT JOIN product_categories pc ON p.category_id = pc.id
      WHERE p.company_id = $1 
        AND p.is_active = TRUE
        AND (
          p.name ILIKE $2 OR 
          p.sku ILIKE $2 OR 
          p.barcode ILIKE $2 OR
          p.description ILIKE $2
        )
      ORDER BY 
        CASE 
          WHEN p.name ILIKE $2 THEN 1
          WHEN p.sku ILIKE $2 THEN 2
          WHEN p.barcode ILIKE $2 THEN 3
          ELSE 4
        END,
        p.name ASC
      LIMIT $3
    `;
    
    const searchPattern = `%${searchTerm}%`;
    const result = await this.db.query(query, [companyId, searchPattern, limit]);
    return this.toCamelCase(result.rows) as Product[];
  }

  async getProductVariants(productId: string): Promise<any[]> {
    const query = `
      SELECT *
      FROM product_variants
      WHERE product_id = $1 AND is_active = TRUE
      ORDER BY name ASC
    `;
    
    const result = await this.db.query(query, [productId]);
    return this.toCamelCase(result.rows);
  }

  async delete(id: string, companyId: string): Promise<boolean> {
    const query = `
      UPDATE products
      SET is_active = FALSE, updated_at = CURRENT_TIMESTAMP
      WHERE id = $1 AND company_id = $2
    `;
    
    const result = await this.db.query(query, [id, companyId]);
    return result.rowCount > 0;
  }
}

export default new ProductRepository();
