import { Pool, PoolClient } from 'pg';

// Database configuration
const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://postgres:Sirgeorge.12@db.qvtgnxezqwwlhzdmtwhc.supabase.co:5432/postgres';

// Create connection pool
const pool = new Pool({
  connectionString: DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  },
  max: 20, // Maximum number of clients in the pool
  idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
  connectionTimeoutMillis: 2000, // Return an error after 2 seconds if connection could not be established
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

  // Get a client from the pool
  async getClient(): Promise<PoolClient> {
    return await pool.connect();
  }

  // Execute a query with automatic client management
  async query(text: string, params?: any[]): Promise<any> {
    const client = await this.getClient();
    try {
      const result = await client.query(text, params);
      return result;
    } finally {
      client.release();
    }
  }

  // Execute multiple queries in a transaction
  async transaction(callback: (client: PoolClient) => Promise<any>): Promise<any> {
    const client = await this.getClient();
    try {
      await client.query('BEGIN');
      const result = await callback(client);
      await client.query('COMMIT');
      return result;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  // Close all connections
  async close(): Promise<void> {
    await pool.end();
  }

  // Test connection
  async testConnection(): Promise<boolean> {
    try {
      const result = await this.query('SELECT NOW() as current_time');
      console.log('✅ Database connection successful:', result.rows[0].current_time);
      return true;
    } catch (error) {
      console.error('❌ Database connection failed:', error);
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
  command: string;
  oid: number;
  fields: any[];
}

// Common database operations
export class BaseRepository {
  protected db: Database;

  constructor() {
    this.db = Database.getInstance();
  }

  // Helper method to build WHERE clauses
  protected buildWhereClause(conditions: Record<string, any>): { where: string; params: any[] } {
    const keys = Object.keys(conditions).filter(key => conditions[key] !== undefined);
    if (keys.length === 0) {
      return { where: '', params: [] };
    }

    const whereClauses = keys.map((key, index) => `${key} = $${index + 1}`);
    const params = keys.map(key => conditions[key]);

    return {
      where: `WHERE ${whereClauses.join(' AND ')}`,
      params
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
      return obj.map(item => this.toCamelCase(item));
    }
    
    if (obj !== null && typeof obj === 'object') {
      const converted: any = {};
      for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
          const camelKey = key.replace(/_([a-z])/g, (match, letter) => letter.toUpperCase());
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
      return obj.map(item => this.toSnakeCase(item));
    }
    
    if (obj !== null && typeof obj === 'object') {
      const converted: any = {};
      for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
          const snakeKey = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
          converted[snakeKey] = this.toSnakeCase(obj[key]);
        }
      }
      return converted;
    }
    
    return obj;
  }
}

// Utility functions for common database patterns
export const DatabaseUtils = {
  // Generate UUID for new records
  generateId(): string {
    return 'uuid_generate_v4()';
  },

  // Format date for PostgreSQL
  formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
  },

  // Format timestamp for PostgreSQL
  formatTimestamp(date: Date): string {
    return date.toISOString();
  },

  // Escape SQL identifiers
  escapeIdentifier(identifier: string): string {
    return `"${identifier.replace(/"/g, '""')}"`;
  },

  // Build INSERT query
  buildInsertQuery(table: string, data: Record<string, any>): { query: string; values: any[] } {
    const keys = Object.keys(data);
    const placeholders = keys.map((_, index) => `$${index + 1}`);
    const values = keys.map(key => data[key]);

    const query = `
      INSERT INTO ${table} (${keys.join(', ')})
      VALUES (${placeholders.join(', ')})
      RETURNING *
    `;

    return { query, values };
  },

  // Build UPDATE query
  buildUpdateQuery(table: string, data: Record<string, any>, whereConditions: Record<string, any>): { query: string; values: any[] } {
    const updateKeys = Object.keys(data);
    const whereKeys = Object.keys(whereConditions);
    
    const setClause = updateKeys.map((key, index) => `${key} = $${index + 1}`).join(', ');
    const whereClause = whereKeys.map((key, index) => `${key} = $${updateKeys.length + index + 1}`).join(' AND ');
    
    const values = [...updateKeys.map(key => data[key]), ...whereKeys.map(key => whereConditions[key])];

    const query = `
      UPDATE ${table}
      SET ${setClause}, updated_at = CURRENT_TIMESTAMP
      WHERE ${whereClause}
      RETURNING *
    `;

    return { query, values };
  }
};
