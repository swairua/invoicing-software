import { Router } from 'express';
import Database from '../database';

const router = Router();

// Get all invoices
router.get('/', async (req, res) => {
  try {
    const companyId = req.headers['x-company-id'] as string || '550e8400-e29b-41d4-a716-446655440000';
    
    const result = await Database.query(`
      SELECT 
        i.*,
        c.name as customer_name,
        c.email as customer_email,
        c.phone as customer_phone,
        c.kra_pin as customer_kra_pin,
        json_agg(
          json_build_object(
            'id', ii.id,
            'product_id', ii.product_id,
            'product_name', p.name,
            'product_sku', p.sku,
            'description', ii.description,
            'quantity', ii.quantity,
            'unit_price', ii.unit_price,
            'discount_amount', ii.discount_amount,
            'discount_percentage', ii.discount_percentage,
            'vat_rate', ii.vat_rate,
            'vat_amount', ii.vat_amount,
            'line_total', ii.line_total
          ) ORDER BY ii.sort_order
        ) as items
      FROM invoices i
      JOIN customers c ON i.customer_id = c.id
      LEFT JOIN invoice_items ii ON i.id = ii.invoice_id
      LEFT JOIN products p ON ii.product_id = p.id
      WHERE i.company_id = $1
      GROUP BY i.id, c.name, c.email, c.phone, c.kra_pin
      ORDER BY i.created_at DESC
      LIMIT 100
    `, [companyId]);

    // Format the data to match the frontend expectations
    const invoices = result.rows.map(row => ({
      id: row.id,
      invoiceNumber: row.invoice_number,
      customerId: row.customer_id,
      customer: {
        id: row.customer_id,
        name: row.customer_name,
        email: row.customer_email,
        phone: row.customer_phone,
        kraPin: row.customer_kra_pin
      },
      items: row.items.filter(item => item.id !== null).map(item => ({
        id: item.id,
        productId: item.product_id,
        product: {
          id: item.product_id,
          name: item.product_name,
          sku: item.product_sku
        },
        description: item.description,
        quantity: parseFloat(item.quantity),
        unitPrice: parseFloat(item.unit_price),
        discount: parseFloat(item.discount_amount),
        vatRate: parseFloat(item.vat_rate),
        total: parseFloat(item.line_total)
      })),
      subtotal: parseFloat(row.subtotal),
      vatAmount: parseFloat(row.vat_amount),
      discountAmount: parseFloat(row.discount_amount),
      total: parseFloat(row.total_amount),
      amountPaid: parseFloat(row.amount_paid),
      balance: parseFloat(row.balance_due),
      status: row.status,
      paymentStatus: row.payment_status,
      etimsStatus: row.etims_status,
      etimsCode: row.etims_code,
      dueDate: new Date(row.due_date),
      issueDate: new Date(row.issue_date),
      notes: row.notes,
      companyId: row.company_id,
      createdBy: row.created_by,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at)
    }));

    res.json({
      success: true,
      data: invoices
    });
  } catch (error) {
    console.error('Error fetching invoices:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch invoices'
    });
  }
});

// Get invoice by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const companyId = req.headers['x-company-id'] as string || '550e8400-e29b-41d4-a716-446655440000';
    
    const result = await Database.query(`
      SELECT 
        i.*,
        c.name as customer_name,
        c.email as customer_email,
        c.phone as customer_phone,
        json_agg(
          json_build_object(
            'id', ii.id,
            'product_id', ii.product_id,
            'product_name', p.name,
            'quantity', ii.quantity,
            'unit_price', ii.unit_price,
            'vat_rate', ii.vat_rate,
            'vat_amount', ii.vat_amount,
            'line_total', ii.line_total
          ) ORDER BY ii.sort_order
        ) as items
      FROM invoices i
      JOIN customers c ON i.customer_id = c.id
      LEFT JOIN invoice_items ii ON i.id = ii.invoice_id
      LEFT JOIN products p ON ii.product_id = p.id
      WHERE i.id = $1 AND i.company_id = $2
      GROUP BY i.id, c.name, c.email, c.phone
    `, [id, companyId]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Invoice not found'
      });
    }

    const row = result.rows[0];
    const invoice = {
      id: row.id,
      invoiceNumber: row.invoice_number,
      customerId: row.customer_id,
      customer: {
        name: row.customer_name,
        email: row.customer_email,
        phone: row.customer_phone
      },
      items: row.items.filter(item => item.id !== null),
      subtotal: parseFloat(row.subtotal),
      vatAmount: parseFloat(row.vat_amount),
      discountAmount: parseFloat(row.discount_amount),
      total: parseFloat(row.total_amount),
      amountPaid: parseFloat(row.amount_paid),
      balance: parseFloat(row.balance_due),
      status: row.status,
      dueDate: new Date(row.due_date),
      issueDate: new Date(row.issue_date),
      notes: row.notes
    };

    res.json({
      success: true,
      data: invoice
    });
  } catch (error) {
    console.error('Error fetching invoice:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch invoice'
    });
  }
});

// Create new invoice
router.post('/', async (req, res) => {
  try {
    const companyId = req.headers['x-company-id'] as string || '550e8400-e29b-41d4-a716-446655440000';
    const userId = req.headers['x-user-id'] as string || '550e8400-e29b-41d4-a716-446655440001';
    
    const {
      customerId,
      dueDate,
      notes,
      items
    } = req.body;

    if (!customerId || !items || items.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Customer ID and items are required'
      });
    }

    // Start transaction
    await Database.query('BEGIN');

    try {
      // Get next invoice number
      const sequenceResult = await Database.query(`
        SELECT 
          COALESCE(prefix, 'INV') as prefix,
          current_number,
          padding_length
        FROM number_sequences 
        WHERE company_id = $1 AND sequence_type = 'invoice'
      `, [companyId]);

      let invoiceNumber;
      if (sequenceResult.rows.length > 0) {
        const seq = sequenceResult.rows[0];
        const nextNumber = seq.current_number;
        const paddedNumber = nextNumber.toString().padStart(seq.padding_length, '0');
        invoiceNumber = `${seq.prefix}-2024-${paddedNumber}`;

        // Update sequence
        await Database.query(`
          UPDATE number_sequences 
          SET current_number = current_number + 1, updated_at = NOW()
          WHERE company_id = $1 AND sequence_type = 'invoice'
        `, [companyId]);
      } else {
        // Create default sequence
        invoiceNumber = `INV-2024-001`;
        await Database.query(`
          INSERT INTO number_sequences (company_id, sequence_type, prefix, current_number, padding_length)
          VALUES ($1, 'invoice', 'INV', 2, 3)
        `, [companyId]);
      }

      // Calculate totals
      let subtotal = 0;
      let totalVatAmount = 0;

      for (const item of items) {
        const lineSubtotal = item.unitPrice * item.quantity;
        const taxRate = await Database.query(`
          SELECT get_applicable_tax_rate($1, $2, $3, $4) as tax_rate
        `, [companyId, item.productId, customerId, new Date()]);
        
        const vatRate = parseFloat(taxRate.rows[0].tax_rate);
        const vatAmount = (lineSubtotal * vatRate) / 100;
        
        subtotal += lineSubtotal;
        totalVatAmount += vatAmount;
      }

      const totalAmount = subtotal + totalVatAmount;

      // Create invoice
      const invoiceResult = await Database.query(`
        INSERT INTO invoices (
          company_id, customer_id, invoice_number, subtotal, vat_amount, 
          total_amount, balance_due, issue_date, due_date, notes, created_by
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        RETURNING *
      `, [
        companyId, customerId, invoiceNumber, subtotal, totalVatAmount,
        totalAmount, totalAmount, new Date(), new Date(dueDate), notes, userId
      ]);

      const invoice = invoiceResult.rows[0];

      // Create invoice items
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        const lineSubtotal = item.unitPrice * item.quantity;
        
        const taxRate = await Database.query(`
          SELECT get_applicable_tax_rate($1, $2, $3, $4) as tax_rate
        `, [companyId, item.productId, customerId, new Date()]);
        
        const vatRate = parseFloat(taxRate.rows[0].tax_rate);
        const vatAmount = (lineSubtotal * vatRate) / 100;
        const lineTotal = lineSubtotal + vatAmount;

        await Database.query(`
          INSERT INTO invoice_items (
            invoice_id, product_id, quantity, unit_price, vat_rate, 
            vat_amount, line_total, sort_order
          )
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        `, [
          invoice.id, item.productId, item.quantity, item.unitPrice,
          vatRate, vatAmount, lineTotal, i
        ]);
      }

      await Database.query('COMMIT');

      // Fetch the complete invoice with items
      const completeInvoiceResult = await Database.query(`
        SELECT 
          i.*,
          c.name as customer_name,
          c.email as customer_email
        FROM invoices i
        JOIN customers c ON i.customer_id = c.id
        WHERE i.id = $1
      `, [invoice.id]);

      const newInvoice = completeInvoiceResult.rows[0];

      res.status(201).json({
        success: true,
        data: {
          id: newInvoice.id,
          invoiceNumber: newInvoice.invoice_number,
          customerId: newInvoice.customer_id,
          customer: {
            name: newInvoice.customer_name,
            email: newInvoice.customer_email
          },
          subtotal: parseFloat(newInvoice.subtotal),
          vatAmount: parseFloat(newInvoice.vat_amount),
          total: parseFloat(newInvoice.total_amount),
          balance: parseFloat(newInvoice.balance_due),
          status: newInvoice.status,
          dueDate: new Date(newInvoice.due_date),
          issueDate: new Date(newInvoice.issue_date),
          notes: newInvoice.notes,
          items: items
        }
      });

    } catch (error) {
      await Database.query('ROLLBACK');
      throw error;
    }

  } catch (error) {
    console.error('Error creating invoice:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create invoice'
    });
  }
});

// Update invoice status
router.patch('/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const companyId = req.headers['x-company-id'] as string || '550e8400-e29b-41d4-a716-446655440000';

    const result = await Database.query(`
      UPDATE invoices 
      SET status = $1, updated_at = NOW()
      WHERE id = $2 AND company_id = $3
      RETURNING *
    `, [status, id, companyId]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Invoice not found'
      });
    }

    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error updating invoice status:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update invoice status'
    });
  }
});

// Process payment
router.post('/:id/payments', async (req, res) => {
  try {
    const { id } = req.params;
    const companyId = req.headers['x-company-id'] as string || '550e8400-e29b-41d4-a716-446655440000';
    const userId = req.headers['x-user-id'] as string || '550e8400-e29b-41d4-a716-446655440001';
    
    const {
      amount,
      method,
      reference,
      notes
    } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        error: 'Valid payment amount is required'
      });
    }

    // Get invoice details
    const invoiceResult = await Database.query(`
      SELECT customer_id, balance_due
      FROM invoices 
      WHERE id = $1 AND company_id = $2
    `, [id, companyId]);

    if (invoiceResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Invoice not found'
      });
    }

    const invoice = invoiceResult.rows[0];

    if (amount > invoice.balance_due) {
      return res.status(400).json({
        success: false,
        error: 'Payment amount cannot exceed outstanding balance'
      });
    }

    // Create payment record
    const paymentResult = await Database.query(`
      INSERT INTO payments (
        company_id, customer_id, invoice_id, amount, payment_method,
        reference_number, payment_date, notes, created_by
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *
    `, [
      companyId, invoice.customer_id, id, amount, method,
      reference, new Date(), notes, userId
    ]);

    res.status(201).json({
      success: true,
      data: paymentResult.rows[0]
    });

  } catch (error) {
    console.error('Error processing payment:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to process payment'
    });
  }
});

export default router;
