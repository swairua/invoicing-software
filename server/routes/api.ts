import { Router } from 'express';
import customersRouter from './customers';
import productsRouter from './products';
import Database from '../database';

const router = Router();

// Health check endpoint
router.get('/health', async (req, res) => {
  try {
    const dbConnected = await Database.testConnection();
    res.json({
      success: true,
      status: 'healthy',
      timestamp: new Date().toISOString(),
      database: dbConnected ? 'connected' : 'disconnected'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Database test endpoint
router.get('/test-db', async (req, res) => {
  try {
    const result = await Database.query('SELECT COUNT(*) as count FROM companies');
    res.json({
      success: true,
      message: 'Database connection successful',
      companies: result.rows[0].count
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Database connection failed'
    });
  }
});

// Quick dashboard metrics endpoint
router.get('/dashboard/metrics', async (req, res) => {
  try {
    const companyId = req.headers['x-company-id'] as string || '550e8400-e29b-41d4-a716-446655440000';
    
    // Get basic metrics from database
    const [
      invoicesResult,
      paymentsResult,
      lowStockResult,
      salesTrendResult
    ] = await Promise.all([
      Database.query(`
        SELECT 
          COUNT(*) as total_invoices,
          COALESCE(SUM(total_amount), 0) as total_revenue,
          COALESCE(SUM(balance_due), 0) as outstanding_invoices
        FROM invoices 
        WHERE company_id = $1 AND status != 'cancelled'
      `, [companyId]),
      Database.query(`
        SELECT COALESCE(SUM(amount), 0) as recent_payments
        FROM payments 
        WHERE company_id = $1 AND payment_date >= CURRENT_DATE - INTERVAL '7 days'
      `, [companyId]),
      Database.query(`
        SELECT COUNT(*) as low_stock_alerts
        FROM products 
        WHERE company_id = $1 AND current_stock <= min_stock AND track_inventory = TRUE AND is_active = TRUE
      `, [companyId]),
      Database.query(`
        SELECT 
          DATE(issue_date) as date,
          COALESCE(SUM(total_amount), 0) as amount
        FROM invoices 
        WHERE company_id = $1 AND issue_date >= CURRENT_DATE - INTERVAL '7 days'
        GROUP BY DATE(issue_date)
        ORDER BY date DESC
      `, [companyId])
    ]);

    const metrics = {
      totalRevenue: parseFloat(invoicesResult.rows[0].total_revenue) || 0,
      outstandingInvoices: parseFloat(invoicesResult.rows[0].outstanding_invoices) || 0,
      lowStockAlerts: parseInt(lowStockResult.rows[0].low_stock_alerts) || 0,
      recentPayments: parseFloat(paymentsResult.rows[0].recent_payments) || 0,
      salesTrend: salesTrendResult.rows.map(row => ({
        date: row.date,
        amount: parseFloat(row.amount) || 0
      })),
      topProducts: [
        { name: 'Latex Rubber Gloves', sales: 45600 },
        { name: 'Office Chair Executive', sales: 32400 },
        { name: 'Digital Blood Pressure Monitor', sales: 28900 }
      ],
      recentActivities: [
        {
          id: '1',
          type: 'invoice',
          description: 'Invoice activity from database',
          timestamp: new Date()
        }
      ]
    };

    res.json({
      success: true,
      data: metrics
    });
  } catch (error) {
    console.error('Error fetching dashboard metrics:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch dashboard metrics'
    });
  }
});

// Route handlers
router.use('/customers', customersRouter);
router.use('/products', productsRouter);

// Placeholder routes for other entities
router.get('/invoices', async (req, res) => {
  try {
    const companyId = req.headers['x-company-id'] as string || '550e8400-e29b-41d4-a716-446655440000';
    
    const result = await Database.query(`
      SELECT 
        i.*,
        c.name as customer_name,
        c.email as customer_email
      FROM invoices i
      JOIN customers c ON i.customer_id = c.id
      WHERE i.company_id = $1
      ORDER BY i.created_at DESC
      LIMIT 50
    `, [companyId]);

    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('Error fetching invoices:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch invoices'
    });
  }
});

router.get('/quotations', async (req, res) => {
  try {
    const companyId = req.headers['x-company-id'] as string || '550e8400-e29b-41d4-a716-446655440000';
    
    const result = await Database.query(`
      SELECT 
        q.*,
        c.name as customer_name,
        c.email as customer_email
      FROM quotations q
      JOIN customers c ON q.customer_id = c.id
      WHERE q.company_id = $1
      ORDER BY q.created_at DESC
      LIMIT 50
    `, [companyId]);

    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('Error fetching quotations:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch quotations'
    });
  }
});

router.get('/proformas', async (req, res) => {
  try {
    const companyId = req.headers['x-company-id'] as string || '550e8400-e29b-41d4-a716-446655440000';
    
    const result = await Database.query(`
      SELECT 
        p.*,
        c.name as customer_name,
        c.email as customer_email
      FROM proforma_invoices p
      JOIN customers c ON p.customer_id = c.id
      WHERE p.company_id = $1
      ORDER BY p.created_at DESC
      LIMIT 50
    `, [companyId]);

    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('Error fetching proformas:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch proformas'
    });
  }
});

router.get('/payments', async (req, res) => {
  try {
    const companyId = req.headers['x-company-id'] as string || '550e8400-e29b-41d4-a716-446655440000';
    
    const result = await Database.query(`
      SELECT 
        p.*,
        c.name as customer_name,
        i.invoice_number
      FROM payments p
      JOIN customers c ON p.customer_id = c.id
      LEFT JOIN invoices i ON p.invoice_id = i.id
      WHERE p.company_id = $1
      ORDER BY p.created_at DESC
      LIMIT 50
    `, [companyId]);

    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('Error fetching payments:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch payments'
    });
  }
});

export default router;
