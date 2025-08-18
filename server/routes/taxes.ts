import { Router } from 'express';
import Database from '../database';

const router = Router();

// Get all tax configurations
router.get('/', async (req, res) => {
  try {
    const companyId = req.headers['x-company-id'] as string || '550e8400-e29b-41d4-a716-446655440000';
    
    const result = await Database.query(`
      SELECT 
        tc.*,
        CASE WHEN tc.applicable_until IS NOT NULL AND tc.applicable_until < CURRENT_DATE 
             THEN FALSE ELSE tc.is_active END as effective_status
      FROM tax_configurations tc
      WHERE tc.company_id = $1
      ORDER BY tc.is_default DESC, tc.name ASC
    `, [companyId]);

    res.json({
      success: true,
      data: result.rows.map(row => ({
        id: row.id,
        name: row.name,
        code: row.code,
        taxType: row.tax_type,
        rate: parseFloat(row.rate),
        calculationMethod: row.calculation_method,
        description: row.description,
        isDefault: row.is_default,
        isActive: row.is_active,
        effectiveStatus: row.effective_status,
        applicableFrom: row.applicable_from,
        applicableUntil: row.applicable_until,
        createdAt: row.created_at,
        updatedAt: row.updated_at
      }))
    });
  } catch (error) {
    console.error('Error fetching tax configurations:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch tax configurations'
    });
  }
});

// Get tax configuration by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const companyId = req.headers['x-company-id'] as string || '550e8400-e29b-41d4-a716-446655440000';
    
    const result = await Database.query(`
      SELECT * FROM tax_configurations
      WHERE id = $1 AND company_id = $2
    `, [id, companyId]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Tax configuration not found'
      });
    }

    const row = result.rows[0];
    res.json({
      success: true,
      data: {
        id: row.id,
        name: row.name,
        code: row.code,
        taxType: row.tax_type,
        rate: parseFloat(row.rate),
        calculationMethod: row.calculation_method,
        description: row.description,
        isDefault: row.is_default,
        isActive: row.is_active,
        applicableFrom: row.applicable_from,
        applicableUntil: row.applicable_until
      }
    });
  } catch (error) {
    console.error('Error fetching tax configuration:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch tax configuration'
    });
  }
});

// Create new tax configuration
router.post('/', async (req, res) => {
  try {
    const companyId = req.headers['x-company-id'] as string || '550e8400-e29b-41d4-a716-446655440000';
    const userId = req.headers['x-user-id'] as string || '550e8400-e29b-41d4-a716-446655440001';
    
    const {
      name,
      code,
      taxType = 'vat',
      rate,
      calculationMethod = 'exclusive',
      description,
      isDefault = false,
      isActive = true,
      applicableFrom,
      applicableUntil
    } = req.body;

    if (!name || !code || rate === undefined) {
      return res.status(400).json({
        success: false,
        error: 'Name, code, and rate are required'
      });
    }

    if (rate < 0 || rate > 100) {
      return res.status(400).json({
        success: false,
        error: 'Tax rate must be between 0 and 100'
      });
    }

    // Start transaction
    await Database.query('BEGIN');

    try {
      // If this is being set as default, unset other defaults
      if (isDefault) {
        await Database.query(`
          UPDATE tax_configurations 
          SET is_default = FALSE, updated_at = NOW()
          WHERE company_id = $1 AND is_default = TRUE
        `, [companyId]);
      }

      // Create tax configuration
      const result = await Database.query(`
        INSERT INTO tax_configurations (
          company_id, name, code, tax_type, rate, calculation_method,
          description, is_default, is_active, applicable_from, applicable_until, created_by
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
        RETURNING *
      `, [
        companyId, name, code, taxType, rate, calculationMethod,
        description, isDefault, isActive, applicableFrom, applicableUntil, userId
      ]);

      await Database.query('COMMIT');

      const row = result.rows[0];
      res.status(201).json({
        success: true,
        data: {
          id: row.id,
          name: row.name,
          code: row.code,
          taxType: row.tax_type,
          rate: parseFloat(row.rate),
          calculationMethod: row.calculation_method,
          description: row.description,
          isDefault: row.is_default,
          isActive: row.is_active,
          applicableFrom: row.applicable_from,
          applicableUntil: row.applicable_until
        }
      });

    } catch (error) {
      await Database.query('ROLLBACK');
      
      // Check for unique constraint violation
      if (error.code === '23505') {
        return res.status(400).json({
          success: false,
          error: 'Tax code already exists for this company'
        });
      }
      throw error;
    }

  } catch (error) {
    console.error('Error creating tax configuration:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create tax configuration'
    });
  }
});

// Update tax configuration
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const companyId = req.headers['x-company-id'] as string || '550e8400-e29b-41d4-a716-446655440000';
    
    const {
      name,
      code,
      taxType,
      rate,
      calculationMethod,
      description,
      isDefault,
      isActive,
      applicableFrom,
      applicableUntil
    } = req.body;

    if (rate !== undefined && (rate < 0 || rate > 100)) {
      return res.status(400).json({
        success: false,
        error: 'Tax rate must be between 0 and 100'
      });
    }

    // Start transaction
    await Database.query('BEGIN');

    try {
      // If this is being set as default, unset other defaults
      if (isDefault) {
        await Database.query(`
          UPDATE tax_configurations 
          SET is_default = FALSE, updated_at = NOW()
          WHERE company_id = $1 AND is_default = TRUE AND id != $2
        `, [companyId, id]);
      }

      // Build dynamic update query
      const updates = [];
      const values = [];
      let paramIndex = 1;

      if (name !== undefined) {
        updates.push(`name = $${paramIndex++}`);
        values.push(name);
      }
      if (code !== undefined) {
        updates.push(`code = $${paramIndex++}`);
        values.push(code);
      }
      if (taxType !== undefined) {
        updates.push(`tax_type = $${paramIndex++}`);
        values.push(taxType);
      }
      if (rate !== undefined) {
        updates.push(`rate = $${paramIndex++}`);
        values.push(rate);
      }
      if (calculationMethod !== undefined) {
        updates.push(`calculation_method = $${paramIndex++}`);
        values.push(calculationMethod);
      }
      if (description !== undefined) {
        updates.push(`description = $${paramIndex++}`);
        values.push(description);
      }
      if (isDefault !== undefined) {
        updates.push(`is_default = $${paramIndex++}`);
        values.push(isDefault);
      }
      if (isActive !== undefined) {
        updates.push(`is_active = $${paramIndex++}`);
        values.push(isActive);
      }
      if (applicableFrom !== undefined) {
        updates.push(`applicable_from = $${paramIndex++}`);
        values.push(applicableFrom);
      }
      if (applicableUntil !== undefined) {
        updates.push(`applicable_until = $${paramIndex++}`);
        values.push(applicableUntil);
      }

      if (updates.length === 0) {
        return res.status(400).json({
          success: false,
          error: 'No fields to update'
        });
      }

      updates.push(`updated_at = NOW()`);
      values.push(id, companyId);

      const result = await Database.query(`
        UPDATE tax_configurations 
        SET ${updates.join(', ')}
        WHERE id = $${paramIndex++} AND company_id = $${paramIndex++}
        RETURNING *
      `, values);

      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'Tax configuration not found'
        });
      }

      await Database.query('COMMIT');

      const row = result.rows[0];
      res.json({
        success: true,
        data: {
          id: row.id,
          name: row.name,
          code: row.code,
          taxType: row.tax_type,
          rate: parseFloat(row.rate),
          calculationMethod: row.calculation_method,
          description: row.description,
          isDefault: row.is_default,
          isActive: row.is_active,
          applicableFrom: row.applicable_from,
          applicableUntil: row.applicable_until
        }
      });

    } catch (error) {
      await Database.query('ROLLBACK');
      
      // Check for unique constraint violation
      if (error.code === '23505') {
        return res.status(400).json({
          success: false,
          error: 'Tax code already exists for this company'
        });
      }
      throw error;
    }

  } catch (error) {
    console.error('Error updating tax configuration:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update tax configuration'
    });
  }
});

// Delete tax configuration
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const companyId = req.headers['x-company-id'] as string || '550e8400-e29b-41d4-a716-446655440000';

    // Check if tax configuration is in use
    const usageCheck = await Database.query(`
      SELECT COUNT(*) as usage_count
      FROM (
        SELECT 1 FROM products WHERE tax_config_id = $1
        UNION ALL
        SELECT 1 FROM invoice_items WHERE tax_config_id = $1
        UNION ALL
        SELECT 1 FROM quotation_items WHERE tax_config_id = $1
        UNION ALL
        SELECT 1 FROM proforma_invoice_items WHERE tax_config_id = $1
      ) usage
    `, [id]);

    const usageCount = parseInt(usageCheck.rows[0].usage_count);
    if (usageCount > 0) {
      return res.status(400).json({
        success: false,
        error: 'Cannot delete tax configuration that is in use. Consider deactivating it instead.'
      });
    }

    const result = await Database.query(`
      DELETE FROM tax_configurations
      WHERE id = $1 AND company_id = $2
      RETURNING id
    `, [id, companyId]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Tax configuration not found'
      });
    }

    res.json({
      success: true,
      message: 'Tax configuration deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting tax configuration:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete tax configuration'
    });
  }
});

// Get tax exemption reasons
router.get('/exemptions/reasons', async (req, res) => {
  try {
    const companyId = req.headers['x-company-id'] as string || '550e8400-e29b-41d4-a716-446655440000';
    
    const result = await Database.query(`
      SELECT * FROM tax_exemption_reasons
      WHERE company_id = $1 AND is_active = TRUE
      ORDER BY name ASC
    `, [companyId]);

    res.json({
      success: true,
      data: result.rows.map(row => ({
        id: row.id,
        name: row.name,
        code: row.code,
        description: row.description,
        isActive: row.is_active
      }))
    });
  } catch (error) {
    console.error('Error fetching tax exemption reasons:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch tax exemption reasons'
    });
  }
});

export default router;
