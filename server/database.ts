import mysql from "mysql2/promise";

// Database configuration - MySQL connection optimized for Aiven
const DATABASE_CONFIG = {
  host:
    process.env.DB_HOST || "mysql-242eb3d7-invoicing-software.c.aivencloud.com",
  port: parseInt(process.env.DB_PORT || "11401"),
  user: process.env.DB_USER || "avnadmin",
  password: process.env.DB_PASSWORD || "AVNS_x9WdjKNy72pMT6Zr90I",
  database: process.env.DB_NAME || "defaultdb",
  connectTimeout: 30000,
  acquireTimeout: 30000,
  timeout: 30000,
  ssl: {
    rejectUnauthorized: false,
  },
  connectionLimit: 3,
  queueLimit: 0,
  reconnect: true,
  charset: "utf8mb4_unicode_ci",
};

// Create connection pool using object configuration
const pool = mysql.createPool({
  ...DATABASE_CONFIG,
  ssl: {
    rejectUnauthorized: false,
  },
});

// Database connection wrapper
export class Database {
  private static instance: Database;

  public static getInstance(): Database {
    if (!Database.instance) {
      Database.instance = new Database();
    }
    return Database.instance;
  }

  // Get a connection from the pool
  async getConnection(): Promise<mysql.PoolConnection> {
    return await pool.getConnection();
  }

  // Execute a query with automatic connection management
  async query(text: string, params?: any[]): Promise<any> {
    const connection = await this.getConnection();
    try {
      const [rows, fields] = await connection.execute(text, params || []);
      return {
        rows: Array.isArray(rows) ? rows : [rows],
        rowCount: Array.isArray(rows) ? rows.length : 1,
        fields,
      };
    } finally {
      connection.release();
    }
  }

  // Execute multiple queries in a transaction
  async transaction(
    callback: (connection: mysql.PoolConnection) => Promise<any>,
  ): Promise<any> {
    const connection = await this.getConnection();
    try {
      await connection.beginTransaction();
      const result = await callback(connection);
      await connection.commit();
      return result;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  // Close all connections
  async close(): Promise<void> {
    await pool.end();
  }

  // Test connection with fallback
  async testConnection(): Promise<boolean> {
    try {
      console.log("⏳ Testing MySQL database connection...");
      console.log(
        `🔌 Connecting to: ${DATABASE_CONFIG.host}:${DATABASE_CONFIG.port}`,
      );
      console.log("🗄️ Using LIVE MYSQL DATABASE - No mock data");

      // Use object configuration for better compatibility
      const simpleConnection = await mysql.createConnection({
        host: DATABASE_CONFIG.host,
        port: DATABASE_CONFIG.port,
        user: DATABASE_CONFIG.user,
        password: DATABASE_CONFIG.password,
        database: DATABASE_CONFIG.database,
        ssl: {
          rejectUnauthorized: false,
        },
        charset: "utf8mb4",
      });

      const [testResult] = await simpleConnection.execute("SELECT 1 as test, VERSION() as version");
      console.log("✅ LIVE MYSQL DATABASE CONNECTION SUCCESSFUL!");
      console.log(`🗄️ MySQL version: ${testResult[0].version}`);

      // Test if we can query tables and check basic schema
      try {
        const [companyResult] = await simpleConnection.execute(
          "SELECT COUNT(*) as count FROM companies",
        );
        console.log(
          `✅ Database schema ready - Found ${companyResult[0].count} companies`,
        );

        // Check and add sample data if needed
        await this.checkAndAddSampleData();
      } catch (schemaError) {
        console.log("⚠️ Database schema not found - needs migration");
        console.log("🔧 Run migration to create tables");
      }

      await simpleConnection.end();
      console.log("✅ MySQL database connected successfully");
      return true;
    } catch (error: any) {
      console.error("❌ LIVE MYSQL DATABASE CONNECTION FAILED:", error.message);
      console.log("🔧 Check MySQL connection string and permissions");
      console.log("ℹ️ Application will continue running without database");
      return false;
    }
  }

  // Helper method to create quotations table if missing
  private async createQuotationsTable(): Promise<void> {
    try {
      // Create quotations table
      await this.query(`
        CREATE TABLE quotations (
            id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
            company_id CHAR(36) NOT NULL,
            customer_id CHAR(36) NOT NULL,
            quote_number VARCHAR(50) NOT NULL,
            issue_date DATE NOT NULL,
            valid_until DATE NOT NULL,
            currency VARCHAR(3) DEFAULT 'KES',
            exchange_rate DECIMAL(10,4) DEFAULT 1.0000,
            subtotal DECIMAL(15,2) NOT NULL DEFAULT 0.00,
            tax_amount DECIMAL(15,2) DEFAULT 0.00,
            discount_amount DECIMAL(15,2) DEFAULT 0.00,
            total_amount DECIMAL(15,2) NOT NULL DEFAULT 0.00,
            status ENUM('draft', 'sent', 'accepted', 'rejected', 'expired', 'converted') DEFAULT 'draft',
            notes TEXT,
            terms TEXT,
            footer TEXT,
            internal_notes TEXT,
            created_by CHAR(36),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
            FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE RESTRICT,
            FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
            UNIQUE KEY uk_quotations_company_number (company_id, quote_number)
        )
      `);

      // Create indexes
      await this.query(
        "CREATE INDEX idx_quotations_company ON quotations (company_id)",
      );
      await this.query(
        "CREATE INDEX idx_quotations_customer ON quotations (customer_id)",
      );
      await this.query(
        "CREATE INDEX idx_quotations_status ON quotations (status)",
      );
      await this.query(
        "CREATE INDEX idx_quotations_date ON quotations (issue_date)",
      );

      // Create quotation items table
      await this.query(`
        CREATE TABLE quotation_items (
            id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
            quotation_id CHAR(36) NOT NULL,
            product_id CHAR(36),
            variant_id CHAR(36),
            description VARCHAR(500) NOT NULL,
            quantity DECIMAL(15,3) NOT NULL,
            unit_price DECIMAL(15,2) NOT NULL,
            discount_percentage DECIMAL(5,2) DEFAULT 0.00,
            discount_amount DECIMAL(15,2) DEFAULT 0.00,
            tax_rate DECIMAL(5,2) DEFAULT 0.00,
            tax_amount DECIMAL(15,2) DEFAULT 0.00,
            line_total DECIMAL(15,2) NOT NULL,
            sort_order INT DEFAULT 0,
            FOREIGN KEY (quotation_id) REFERENCES quotations(id) ON DELETE CASCADE,
            FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL,
            FOREIGN KEY (variant_id) REFERENCES product_variants(id) ON DELETE SET NULL
        )
      `);

      // Create indexes for quotation items
      await this.query(
        "CREATE INDEX idx_quotation_items_quotation ON quotation_items (quotation_id)",
      );
      await this.query(
        "CREATE INDEX idx_quotation_items_product ON quotation_items (product_id)",
      );

      console.log("✅ Quotations tables created successfully");

      // Add sample customers if none exist
      const customerCount = await this.query(
        "SELECT COUNT(*) as count FROM customers",
      );
      if (customerCount.rows[0].count === 0) {
        console.log("📋 Adding sample customers...");
        await this.addSampleCustomers();
      }

      // Add sample products if none exist
      const productCount = await this.query(
        "SELECT COUNT(*) as count FROM products",
      );
      if (productCount.rows[0].count === 0) {
        console.log("📋 Adding sample products...");
        await this.addSampleProducts();
      }
    } catch (error) {
      console.error("❌ Failed to create quotations table:", error);
    }
  }

  // Helper method to add sample categories
  private async addSampleCategories(): Promise<void> {
    try {
      const companyId = "00000000-0000-0000-0000-000000000001";

      await this.query(
        `INSERT INTO product_categories (id, name, description, is_active, company_id, created_at, updated_at)
         VALUES (UUID(), ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
        [
          "Medical Supplies",
          "Basic medical supplies and consumables",
          true,
          companyId,
        ],
      );

      await this.query(
        `INSERT INTO product_categories (id, name, description, is_active, company_id, created_at, updated_at)
         VALUES (UUID(), ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
        ["Medical Equipment", "Medical devices and equipment", true, companyId],
      );

      console.log("✅ Sample categories created successfully");
    } catch (error) {
      console.error("❌ Failed to add sample categories:", error);
    }
  }

  // Helper method to add sample customers
  private async addSampleCustomers(): Promise<void> {
    try {
      const companyId = "00000000-0000-0000-0000-000000000001";

      const sampleCustomers = [
        {
          name: "ABC Electronics Ltd",
          email: "orders@abcelectronics.co.ke",
          phone: "+254712345678",
          kra_pin: "P051234567A",
          address_line1: "123 Industrial Area",
          city: "Nairobi",
          country: "Kenya",
          credit_limit: 100000,
          current_balance: 15000,
        },
        {
          name: "Digital Solutions Co",
          email: "info@digitalsolutions.co.ke",
          phone: "+254723456789",
          address_line1: "456 Westlands Road",
          city: "Nairobi",
          country: "Kenya",
          credit_limit: 50000,
          current_balance: 5000,
        },
        {
          name: "Kenyan Medical Supplies",
          email: "procurement@kenyamed.co.ke",
          phone: "+254734567890",
          kra_pin: "P051234567B",
          address_line1: "789 Hospital Road",
          city: "Nairobi",
          country: "Kenya",
          credit_limit: 200000,
          current_balance: 0,
        },
      ];

      for (const customer of sampleCustomers) {
        await this.query(
          `
          INSERT INTO customers (
            id, company_id, name, email, phone, kra_pin,
            address_line1, city, country, credit_limit, current_balance,
            is_active, created_at, updated_at
          ) VALUES (
            UUID(), ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, TRUE, NOW(), NOW()
          )
        `,
          [
            companyId,
            customer.name,
            customer.email,
            customer.phone,
            customer.kra_pin || null,
            customer.address_line1,
            customer.city,
            customer.country,
            customer.credit_limit,
            customer.current_balance,
          ],
        );
      }

      console.log(`✅ Added ${sampleCustomers.length} sample customers`);
    } catch (error) {
      console.error("❌ Failed to add sample customers:", error);
    }
  }

  // Helper method to add sample products
  private async addSampleProducts(): Promise<void> {
    try {
      const companyId = "00000000-0000-0000-0000-000000000001";

      const sampleProducts = [
        {
          name: "Latex Rubber Gloves XL",
          description:
            "High-quality latex rubber gloves for medical and industrial use",
          sku: "LRG-XL-001",
          unit_of_measure: "pair",
          purchase_price: 400,
          selling_price: 500,
          min_stock: 50,
          max_stock: 1000,
          current_stock: 250,
          is_taxable: true,
          tax_rate: 16.0,
        },
        {
          name: "Digital Blood Pressure Monitor",
          description: "Accurate digital blood pressure monitoring device",
          sku: "DBP-001",
          unit_of_measure: "piece",
          purchase_price: 2500,
          selling_price: 3500,
          min_stock: 5,
          max_stock: 100,
          current_stock: 25,
          is_taxable: true,
          tax_rate: 16.0,
        },
        {
          name: "Surgical Face Masks (Box of 50)",
          description: "Disposable surgical face masks, FDA approved",
          sku: "SFM-50-001",
          unit_of_measure: "box",
          purchase_price: 800,
          selling_price: 1200,
          min_stock: 20,
          max_stock: 500,
          current_stock: 150,
          is_taxable: true,
          tax_rate: 16.0,
        },
      ];

      for (const product of sampleProducts) {
        await this.query(
          `
          INSERT INTO products (
            id, company_id, name, description, sku, unit_of_measure,
            purchase_price, selling_price, min_stock, max_stock, current_stock,
            is_taxable, tax_rate, track_inventory, is_active, status,
            created_at, updated_at
          ) VALUES (
            UUID(), ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, TRUE, TRUE, 'active', NOW(), NOW()
          )
        `,
          [
            companyId,
            product.name,
            product.description,
            product.sku,
            product.unit_of_measure,
            product.purchase_price,
            product.selling_price,
            product.min_stock,
            product.max_stock,
            product.current_stock,
            product.is_taxable,
            product.tax_rate,
          ],
        );
      }

      console.log(`✅ Added ${sampleProducts.length} sample products`);
    } catch (error) {
      console.error("❌ Failed to add sample products:", error);
    }
  }

  // Public method to create sample data
  public async createSampleData(): Promise<void> {
    console.log("🚀 Creating sample data...");
    await this.checkAndAddSampleData();
  }

  // Helper method to check and add sample data
  private async checkAndAddSampleData(): Promise<void> {
    try {
      const companyId = "00000000-0000-0000-0000-000000000001";

      // First ensure the company exists
      const companyExists = await this.query(
        "SELECT COUNT(*) as count FROM companies WHERE id = ?",
        [companyId],
      );
      if (companyExists.rows[0].count === 0) {
        console.log("🏢 Creating sample company...");
        await this.query(
          `INSERT INTO companies (id, name, kra_pin, vat_number, address_line1, city, country, phone, email, currency, vat_rate, invoice_prefix, is_active, created_at, updated_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
          [
            companyId,
            "Sample Medical Supply Company",
            "P123456789A",
            "VAT123456789",
            "123 Business Street",
            "Nairobi",
            "Kenya",
            "+254-700-000000",
            "admin@samplemedical.co.ke",
            "KES",
            16.0,
            "INV",
            true,
          ],
        );
        console.log("✅ Sample company created successfully");
      }

      // Add sample categories first
      const categoryCount = await this.query(
        "SELECT COUNT(*) as count FROM product_categories WHERE company_id = ?",
        [companyId],
      );
      console.log(
        `📁 Found ${categoryCount.rows[0].count} categories for company ${companyId}`,
      );
      if (categoryCount.rows[0].count === 0) {
        console.log("📁 Adding sample categories...");
        await this.addSampleCategories();
      } else {
        console.log("✅ Categories already exist, skipping creation");
      }

      // Add sample customers if none exist for the main company
      const customerCount = await this.query(
        "SELECT COUNT(*) as count FROM customers WHERE company_id = ?",
        ["00000000-0000-0000-0000-000000000001"],
      );
      if (customerCount.rows[0].count === 0) {
        console.log("📋 Adding sample customers...");
        await this.addSampleCustomers();
      }

      // Add sample products if none exist for the main company
      const productCount = await this.query(
        "SELECT COUNT(*) as count FROM products WHERE company_id = ?",
        ["00000000-0000-0000-0000-000000000001"],
      );
      if (productCount.rows[0].count === 0) {
        console.log("��� Adding sample products...");
        await this.addSampleProducts();
      }
    } catch (error) {
      console.error("❌ Failed to check/add sample data:", error);
    }
  }
}

// Export default instance
export default Database.getInstance();

// Export types for use in other files
export interface DatabaseRow {
  [key: string]: any;
}

export interface QueryResult {
  rows: DatabaseRow[];
  rowCount: number;
  fields: any[];
}

// Common database operations
export class BaseRepository {
  protected db: Database;

  constructor() {
    this.db = Database.getInstance();
  }

  // Helper method to build WHERE clauses (MySQL style)
  protected buildWhereClause(conditions: Record<string, any>): {
    where: string;
    params: any[];
  } {
    const keys = Object.keys(conditions).filter(
      (key) => conditions[key] !== undefined,
    );
    if (keys.length === 0) {
      return { where: "", params: [] };
    }

    const whereClauses = keys.map((key) => `${key} = ?`);
    const params = keys.map((key) => conditions[key]);

    return {
      where: `WHERE ${whereClauses.join(" AND ")}`,
      params,
    };
  }

  // Helper method for pagination
  protected buildPagination(page: number = 1, limit: number = 10): string {
    const offset = (page - 1) * limit;
    return `LIMIT ${limit} OFFSET ${offset}`;
  }

  // Helper method to convert snake_case to camelCase
  protected toCamelCase(obj: any): any {
    if (Array.isArray(obj)) {
      return obj.map((item) => this.toCamelCase(item));
    }

    // Handle Date objects - return them as-is, don't convert
    if (obj instanceof Date) {
      return obj;
    }

    if (obj !== null && typeof obj === "object") {
      const converted: any = {};
      for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
          const camelKey = key.replace(/_([a-z])/g, (match, letter) =>
            letter.toUpperCase(),
          );
          converted[camelKey] = this.toCamelCase(obj[key]);
        }
      }
      return converted;
    }

    return obj;
  }

  // Helper method to convert camelCase to snake_case
  protected toSnakeCase(obj: any): any {
    if (Array.isArray(obj)) {
      return obj.map((item) => this.toSnakeCase(item));
    }

    // Handle Date objects - return them as-is, don't convert
    if (obj instanceof Date) {
      return obj;
    }

    if (obj !== null && typeof obj === "object") {
      const converted: any = {};
      for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
          const snakeKey = key.replace(
            /[A-Z]/g,
            (letter) => `_${letter.toLowerCase()}`,
          );
          converted[snakeKey] = this.toSnakeCase(obj[key]);
        }
      }
      return converted;
    }

    return obj;
  }
}

// Utility functions for common database patterns (MySQL compatible)
export const DatabaseUtils = {
  // Generate UUID for new records (MySQL uses UUID() function)
  generateId(): string {
    return "UUID()";
  },

  // Format date for MySQL
  formatDate(date: Date): string {
    return date.toISOString().split("T")[0];
  },

  // Format timestamp for MySQL
  formatTimestamp(date: Date): string {
    return date.toISOString().slice(0, 19).replace("T", " ");
  },

  // Escape SQL identifiers (MySQL style)
  escapeIdentifier(identifier: string): string {
    return `\`${identifier.replace(/`/g, "``")}\``;
  },

  // Build INSERT query (MySQL style with ? placeholders)
  buildInsertQuery(
    table: string,
    data: Record<string, any>,
  ): { query: string; values: any[] } {
    const keys = Object.keys(data);
    const placeholders = keys.map(() => "?");
    const values = keys.map((key) => data[key]);

    const query = `
      INSERT INTO ${table} (${keys.join(", ")})
      VALUES (${placeholders.join(", ")})
    `;

    return { query, values };
  },

  // Build UPDATE query (MySQL style with ? placeholders)
  buildUpdateQuery(
    table: string,
    data: Record<string, any>,
    whereConditions: Record<string, any>,
  ): { query: string; values: any[] } {
    const updateKeys = Object.keys(data);
    const whereKeys = Object.keys(whereConditions);

    if (updateKeys.length === 0) {
      throw new Error("No data provided for update");
    }

    const setClause = updateKeys.map((key) => `${key} = ?`).join(", ");
    const whereClause = whereKeys.map((key) => `${key} = ?`).join(" AND ");

    const values = [
      ...updateKeys.map((key) => data[key]),
      ...whereKeys.map((key) => whereConditions[key]),
    ];

    const query = `
      UPDATE ${table}
      SET ${setClause}, updated_at = CURRENT_TIMESTAMP
      WHERE ${whereClause}
    `;

    return { query, values };
  },
};
