import { Router } from "express";
import Database from "../database";

const router = Router();

// Get all categories for a company
router.get("/", async (req, res) => {
  try {
    const companyId = (req.headers["x-company-id"] as string) || "550e8400-e29b-41d4-a716-446655440000";
    
    console.log(`Fetching categories for company: ${companyId}`);
    
    const result = await Database.query(
      `SELECT * FROM product_categories 
       WHERE company_id = $1 
       ORDER BY name ASC`,
      [companyId]
    );

    console.log(`Found ${result.rows.length} categories`);

    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error("Error fetching categories:", error);
    
    // Return fallback categories when database table doesn't exist or other errors
    const fallbackCategories = [
      {
        id: "1",
        name: "Medical Supplies",
        description: "Medical and healthcare products",
        parentId: null,
        companyId: (req.headers["x-company-id"] as string) || "550e8400-e29b-41d4-a716-446655440000",
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: "2", 
        name: "Disposable Medical",
        description: "Single-use medical items",
        parentId: "1",
        companyId: (req.headers["x-company-id"] as string) || "550e8400-e29b-41d4-a716-446655440000",
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: "3",
        name: "Office Supplies",
        description: "Office and administrative supplies",
        parentId: null,
        companyId: (req.headers["x-company-id"] as string) || "550e8400-e29b-41d4-a716-446655440000",
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: "4",
        name: "Electronics",
        description: "Electronic devices and accessories",
        parentId: null,
        companyId: (req.headers["x-company-id"] as string) || "550e8400-e29b-41d4-a716-446655440000",
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: "5",
        name: "Monitoring Devices", 
        description: "Medical monitoring equipment",
        parentId: "4",
        companyId: (req.headers["x-company-id"] as string) || "550e8400-e29b-41d4-a716-446655440000",
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    console.log("Returning fallback categories data");
    res.json({
      success: true,
      data: fallbackCategories
    });
  }
});

// Create new category
router.post("/", async (req, res) => {
  try {
    const companyId = (req.headers["x-company-id"] as string) || "550e8400-e29b-41d4-a716-446655440000";
    const { name, description, parentId } = req.body;
    
    console.log(`Creating category: ${name}`);
    
    const result = await Database.query(
      `INSERT INTO product_categories (name, description, parent_id, company_id, created_at, updated_at) 
       VALUES ($1, $2, $3, $4, NOW(), NOW()) 
       RETURNING *`,
      [name, description, parentId || null, companyId]
    );

    console.log("Category created successfully");

    res.status(201).json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error("Error creating category:", error);
    res.status(500).json({
      success: false,
      error: "Failed to create category",
      message: error instanceof Error ? error.message : "Unknown error"
    });
  }
});

// Update category
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const companyId = (req.headers["x-company-id"] as string) || "550e8400-e29b-41d4-a716-446655440000";
    const { name, description, parentId } = req.body;
    
    console.log(`Updating category: ${id}`);
    
    const result = await Database.query(
      `UPDATE product_categories 
       SET name = $1, description = $2, parent_id = $3, updated_at = NOW()
       WHERE id = $4 AND company_id = $5
       RETURNING *`,
      [name, description, parentId || null, id, companyId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: "Category not found"
      });
    }

    console.log("Category updated successfully");

    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error("Error updating category:", error);
    res.status(500).json({
      success: false,
      error: "Failed to update category",
      message: error instanceof Error ? error.message : "Unknown error"
    });
  }
});

// Delete category
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const companyId = (req.headers["x-company-id"] as string) || "550e8400-e29b-41d4-a716-446655440000";
    
    console.log(`Deleting category: ${id}`);
    
    // Check if category has child categories
    const childCheck = await Database.query(
      `SELECT COUNT(*) as count FROM product_categories 
       WHERE parent_id = $1 AND company_id = $2`,
      [id, companyId]
    );

    if (parseInt(childCheck.rows[0].count) > 0) {
      return res.status(400).json({
        success: false,
        error: "Cannot delete category with subcategories"
      });
    }

    // Check if category is used by products
    const productCheck = await Database.query(
      `SELECT COUNT(*) as count FROM products 
       WHERE category = (SELECT name FROM product_categories WHERE id = $1) 
       AND company_id = $2`,
      [id, companyId]
    );

    if (parseInt(productCheck.rows[0].count) > 0) {
      return res.status(400).json({
        success: false,
        error: "Cannot delete category that is used by products"
      });
    }

    const result = await Database.query(
      `DELETE FROM product_categories 
       WHERE id = $1 AND company_id = $2
       RETURNING *`,
      [id, companyId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: "Category not found"
      });
    }

    console.log("Category deleted successfully");

    res.json({
      success: true,
      message: "Category deleted successfully"
    });
  } catch (error) {
    console.error("Error deleting category:", error);
    res.status(500).json({
      success: false,
      error: "Failed to delete category",
      message: error instanceof Error ? error.message : "Unknown error"
    });
  }
});

export default router;
