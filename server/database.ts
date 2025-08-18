import mysql from "mysql2/promise";

// Database configuration - MySQL connection
const DATABASE_CONFIG = {
  host: process.env.DB_HOST || "mysql-242eb3d7-invoicing-software.c.aivencloud.com",
  port: parseInt(process.env.DB_PORT || "11397"),
  user: process.env.DB_USER || "avnadmin",
  password: process.env.DB_PASSWORD || "AVNS_x9WdjKNy72pMT6Zr90I",
  database: process.env.DB_NAME || "defaultdb",
  ssl: {
    rejectUnauthorized: false,
  },
  connectionLimit: 10,
};

// Create connection pool
const pool = mysql.createPool(DATABASE_CONFIG);

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
        fields
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
      console.log(`🔌 Connecting to: ${DATABASE_CONFIG.host}:${DATABASE_CONFIG.port}`);
      console.log("🗄️ Using LIVE MYSQL DATABASE - No mock data");
      
      const result = await this.query(
        "SELECT 1 as test",
      );
      console.log("✅ LIVE MYSQL DATABASE CONNECTION SUCCESSFUL!");
      console.log("🔗 Database test result:", result.rows[0].test);

      // Test if we can query tables
      try {
        const companyTest = await this.query(
          "SELECT COUNT(*) as count FROM companies",
        );
        console.log(
          `✅ Database schema ready - Found ${companyTest.rows[0].count} companies`,
        );

        const tableCheck = await this.query(`
          SELECT table_name FROM information_schema.tables
          WHERE table_schema = ?
          ORDER BY table_name
        `, [DATABASE_CONFIG.database]);
        console.log(`📋 Available tables: ${tableCheck.rows.length} total`);
      } catch (schemaError) {
        console.log("⚠️ Database schema not found - needs migration");
        console.log("🔧 Run migration to create tables");
      }

      return true;
    } catch (error: any) {
      console.error("❌ LIVE MYSQL DATABASE CONNECTION FAILED:", error.message);
      console.log("🔧 Check MySQL connection string and permissions");
      return false;
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
    return date.toISOString().slice(0, 19).replace('T', ' ');
  },

  // Escape SQL identifiers (MySQL style)
  escapeIdentifier(identifier: string): string {
    return `\`${identifier.replace(/`/g, '``')}\``;
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

    const setClause = updateKeys
      .map((key) => `${key} = ?`)
      .join(", ");
    const whereClause = whereKeys
      .map((key) => `${key} = ?`)
      .join(" AND ");

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
