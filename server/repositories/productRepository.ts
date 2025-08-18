import { BaseRepository, DatabaseUtils } from "../database";
import { Product } from "@shared/types";

export class ProductRepository extends BaseRepository {
  async findAll(
    companyId: string,
    options: {
      page?: number;
      limit?: number;
      search?: string;
      categoryId?: string;
      status?: string;
      lowStock?: boolean;
    } = {},
  ): Promise<{ products: Product[]; total: number }> {
    const {
      page = 1,
      limit = 10,
      search,
      categoryId,
      status,
      lowStock,
    } = options;

    let whereClause = "WHERE p.company_id = ?";
    const params: any[] = [companyId];

    if (search) {
      whereClause += ` AND (p.name LIKE ? OR p.sku LIKE ? OR p.description LIKE ?)`;
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    if (categoryId) {
      whereClause += ` AND p.category_id = ?`;
      params.push(categoryId);
    }

    if (status) {
      whereClause += ` AND p.status = ?`;
      params.push(status);
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

    // Get paginated results
    const offset = (page - 1) * limit;
    const query = `
      SELECT 
        p.*,
        pc.name as category_name,
        s.name as supplier_name
      FROM products p
      LEFT JOIN product_categories pc ON p.category_id = pc.id
      LEFT JOIN suppliers s ON p.supplier_id = s.id
      ${whereClause}
      ORDER BY p.updated_at DESC
      LIMIT ? OFFSET ?
    `;

    // Create the parameters array for the data query
    const dataParams = [...params, String(limit), String(offset)];
    const result = await this.db.query(query, dataParams);

    return {
      products: this.toCamelCase(result.rows) as Product[],
      total,
    };
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
      WHERE p.id = ? AND p.company_id = ?
    `;

    const result = await this.db.query(query, [id, companyId]);

    if (result.rows.length === 0) {
      return null;
    }

    return this.toCamelCase(result.rows[0]) as Product;
  }

  async create(
    productData: Omit<Product, "id" | "createdAt" | "updatedAt">,
  ): Promise<Product> {
    const data = this.toSnakeCase(productData);
    delete data.id; // Let MySQL generate the UUID
    delete data.created_at;
    delete data.updated_at;

    // Add UUID generation explicitly
    const insertQuery = `
      INSERT INTO products (id, ${Object.keys(data).join(", ")})
      VALUES (UUID(), ${Object.keys(data)
        .map(() => "?")
        .join(", ")})
    `;

    const result = await this.db.query(insertQuery, Object.values(data));

    // Get the inserted record by finding the most recent one for this company
    const recentProduct = await this.db.query(
      "SELECT * FROM products WHERE company_id = ? ORDER BY created_at DESC LIMIT 1",
      [productData.companyId],
    );

    return this.toCamelCase(recentProduct.rows[0]) as Product;
  }

  async update(
    id: string,
    companyId: string,
    updateData: Partial<Product>,
  ): Promise<Product | null> {
    const data = this.toSnakeCase(updateData);
    delete data.id;
    delete data.created_at;
    delete data.updated_at;

    const { query, values } = DatabaseUtils.buildUpdateQuery("products", data, {
      id,
      company_id: companyId,
    });

    const result = await this.db.query(query, values);

    if (result.affectedRows === 0) {
      return null;
    }

    return this.findById(id, companyId);
  }

  async updateStock(
    id: string,
    quantity: number,
    movementType: "in" | "out" | "adjustment",
  ): Promise<void> {
    await this.db.transaction(async (connection) => {
      // Get current stock
      const stockQuery = "SELECT current_stock FROM products WHERE id = ?";
      const [stockResult] = await connection.execute(stockQuery, [id]);

      if (!Array.isArray(stockResult) || stockResult.length === 0) {
        throw new Error("Product not found");
      }

      const currentStock = parseFloat((stockResult as any)[0].current_stock);
      let newStock: number;

      switch (movementType) {
        case "in":
          newStock = currentStock + quantity;
          break;
        case "out":
          newStock = Math.max(0, currentStock - quantity);
          break;
        case "adjustment":
          newStock = quantity;
          break;
        default:
          throw new Error("Invalid movement type");
      }

      // Update product stock
      const updateQuery = `
        UPDATE products
        SET current_stock = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `;
      await connection.execute(updateQuery, [newStock, id]);

      // Record stock movement
      const movementQuery = `
        INSERT INTO stock_movements (
          id, product_id, movement_type, quantity, 
          previous_stock, new_stock, created_at
        )
        VALUES (UUID(), ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
      `;
      await connection.execute(movementQuery, [
        id,
        movementType,
        quantity,
        currentStock,
        newStock,
      ]);
    });
  }

  async getLowStockProducts(companyId: string): Promise<Product[]> {
    const query = `
      SELECT 
        p.*,
        pc.name as category_name
      FROM products p
      LEFT JOIN product_categories pc ON p.category_id = pc.id
      WHERE p.company_id = ?
        AND p.current_stock <= p.min_stock 
        AND p.track_inventory = TRUE
        AND p.is_active = TRUE
      ORDER BY (p.min_stock - p.current_stock) DESC
    `;

    const result = await this.db.query(query, [companyId]);
    return this.toCamelCase(result.rows) as Product[];
  }

  async getStockMovements(
    productId: string,
    limit: number = 10,
  ): Promise<any[]> {
    const query = `
      SELECT 
        sm.*,
        CONCAT(u.first_name, ' ', u.last_name) as created_by_name
      FROM stock_movements sm
      LEFT JOIN users u ON sm.created_by = u.id
      WHERE sm.product_id = ?
      ORDER BY sm.created_at DESC
      LIMIT ?
    `;

    const result = await this.db.query(query, [productId, limit]);
    return this.toCamelCase(result.rows);
  }

  async searchProducts(
    companyId: string,
    searchTerm: string,
    limit: number = 10,
  ): Promise<Product[]> {
    const query = `
      SELECT 
        p.*,
        pc.name as category_name
      FROM products p
      LEFT JOIN product_categories pc ON p.category_id = pc.id
      WHERE p.company_id = ? 
        AND p.is_active = TRUE
        AND (
          p.name LIKE ? OR 
          p.sku LIKE ? OR 
          p.barcode LIKE ? OR
          p.description LIKE ?
        )
      ORDER BY 
        CASE 
          WHEN p.name LIKE ? THEN 1
          WHEN p.sku LIKE ? THEN 2
          WHEN p.barcode LIKE ? THEN 3
          ELSE 4
        END,
        p.name ASC
      LIMIT ?
    `;

    const searchPattern = `%${searchTerm}%`;
    const result = await this.db.query(query, [
      companyId,
      searchPattern,
      searchPattern,
      searchPattern,
      searchPattern,
      searchPattern,
      searchPattern,
      searchPattern,
      limit,
    ]);
    return this.toCamelCase(result.rows) as Product[];
  }

  async getProductVariants(productId: string): Promise<any[]> {
    const query = `
      SELECT *
      FROM product_variants
      WHERE product_id = ? AND is_active = TRUE
      ORDER BY name ASC
    `;

    const result = await this.db.query(query, [productId]);
    return this.toCamelCase(result.rows);
  }

  async delete(id: string, companyId: string): Promise<boolean> {
    const query = `
      UPDATE products
      SET is_active = FALSE, updated_at = CURRENT_TIMESTAMP
      WHERE id = ? AND company_id = ?
    `;

    const result = await this.db.query(query, [id, companyId]);
    return result.affectedRows > 0;
  }
}

export default new ProductRepository();
