import { Router } from "express";

const router = Router();

// Get all categories
router.get("/", async (req, res) => {
  try {
    const companyId =
      (req.headers["x-company-id"] as string) ||
      "00000000-0000-0000-0000-000000000001";

    // Import database here to avoid circular dependency issues
    const { default: Database } = await import("../database.js");

    const result = await Database.query(
      `SELECT * FROM product_categories 
       WHERE company_id = ? 
       ORDER BY name ASC`,
      [companyId],
    );

    res.json({
      success: true,
      data: result.rows,
    });
  } catch (error) {
    console.error("Error fetching categories:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch categories",
      details: error.message,
    });
  }
});

// Create new category
router.post("/", async (req, res) => {
  try {
    const companyId =
      (req.headers["x-company-id"] as string) ||
      "00000000-0000-0000-0000-000000000001";
    const { name, description, parentId } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        error: "Category name is required",
      });
    }

    const { default: Database } = await import("../database.js");

    const result = await Database.query(
      `INSERT INTO product_categories (id, name, description, parent_id, company_id, created_at, updated_at) 
       VALUES (UUID(), ?, ?, ?, ?, NOW(), NOW())`,
      [name, description, parentId || null, companyId],
    );

    // Get the created category
    const createdCategory = await Database.query(
      `SELECT * FROM product_categories WHERE company_id = ? AND name = ? ORDER BY created_at DESC LIMIT 1`,
      [companyId, name],
    );

    res.status(201).json({
      success: true,
      data: createdCategory.rows[0],
    });
  } catch (error) {
    console.error("Error creating category:", error);
    res.status(500).json({
      success: false,
      error: "Failed to create category",
      details: error.message,
    });
  }
});

// Update category
router.put("/:id", async (req, res) => {
  try {
    const companyId =
      (req.headers["x-company-id"] as string) ||
      "00000000-0000-0000-0000-000000000001";
    const { id } = req.params;
    const { name, description, parentId } = req.body;

    const { default: Database } = await import("../database.js");

    const result = await Database.query(
      `UPDATE product_categories 
       SET name = ?, description = ?, parent_id = ?, updated_at = NOW()
       WHERE id = ? AND company_id = ?`,
      [name, description, parentId || null, id, companyId],
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        error: "Category not found",
      });
    }

    // Get the updated category
    const updatedCategory = await Database.query(
      `SELECT * FROM product_categories WHERE id = ? AND company_id = ?`,
      [id, companyId],
    );

    res.json({
      success: true,
      data: updatedCategory.rows[0],
    });
  } catch (error) {
    console.error("Error updating category:", error);
    res.status(500).json({
      success: false,
      error: "Failed to update category",
      details: error.message,
    });
  }
});

// Delete category
router.delete("/:id", async (req, res) => {
  try {
    const companyId =
      (req.headers["x-company-id"] as string) ||
      "00000000-0000-0000-0000-000000000001";
    const { id } = req.params;

    const { default: Database } = await import("../database.js");

    // Check if category has subcategories
    const subcategoriesResult = await Database.query(
      `SELECT COUNT(*) as count FROM product_categories 
       WHERE parent_id = ? AND company_id = ?`,
      [id, companyId],
    );

    if (subcategoriesResult.rows[0].count > 0) {
      return res.status(400).json({
        success: false,
        error: "Cannot delete category with subcategories",
      });
    }

    // Check if category is used by products
    const productsResult = await Database.query(
      `SELECT COUNT(*) as count FROM products 
       WHERE category_id = ? AND company_id = ?`,
      [id, companyId],
    );

    if (productsResult.rows[0].count > 0) {
      return res.status(400).json({
        success: false,
        error: "Cannot delete category that is used by products",
      });
    }

    const result = await Database.query(
      `DELETE FROM product_categories 
       WHERE id = ? AND company_id = ?`,
      [id, companyId],
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        error: "Category not found",
      });
    }

    res.json({
      success: true,
      message: "Category deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting category:", error);
    res.status(500).json({
      success: false,
      error: "Failed to delete category",
      details: error.message,
    });
  }
});

export default router;
