import { Router } from "express";

const router = Router();

// Create sample categories if none exist
router.post("/setup", async (req, res) => {
  try {
    const companyId =
      (req.headers["x-company-id"] as string) ||
      "00000000-0000-0000-0000-000000000001";

    const { default: Database } = await import("../database.js");

    console.log("🔧 Setting up categories for company:", companyId);

    // Always create categories, but avoid duplicates
    const sampleCategories = [
      { name: "General", description: "General products and items" },
      {
        name: "Medical Supplies",
        description: "Basic medical supplies and consumables",
      },
      {
        name: "Medical Equipment",
        description: "Medical devices and equipment",
      },
      {
        name: "Electronics",
        description: "Electronic devices and accessories",
      },
    ];

    const createdCategories = [];

    for (const category of sampleCategories) {
      // Check if category already exists
      const existing = await Database.query(
        `SELECT * FROM product_categories WHERE company_id = ? AND name = ?`,
        [companyId, category.name],
      );

      if (existing.rows.length === 0) {
        console.log(`➕ Creating category: ${category.name}`);
        await Database.query(
          `INSERT INTO product_categories (id, name, description, company_id, is_active, created_at, updated_at)
           VALUES (UUID(), ?, ?, ?, TRUE, NOW(), NOW())`,
          [category.name, category.description, companyId],
        );

        // Get the created category
        const created = await Database.query(
          `SELECT * FROM product_categories WHERE company_id = ? AND name = ? ORDER BY created_at DESC LIMIT 1`,
          [companyId, category.name],
        );

        if (created.rows[0]) {
          createdCategories.push(created.rows[0]);
        }
      } else {
        console.log(`✅ Category already exists: ${category.name}`);
        createdCategories.push(existing.rows[0]);
      }
    }

    // Get all categories for this company
    const allCategories = await Database.query(
      "SELECT * FROM product_categories WHERE company_id = ? ORDER BY name",
      [companyId],
    );

    res.json({
      success: true,
      message: `Setup complete. ${createdCategories.length} categories ready.`,
      data: allCategories.rows,
      created: createdCategories.length,
      total: allCategories.rows.length,
    });
  } catch (error) {
    console.error("Error setting up categories:", error);
    res.status(500).json({
      success: false,
      error: "Failed to setup categories",
      details: error.message,
    });
  }
});

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
    console.log("Returning fallback categories data");

    // Return fallback categories when database is unavailable
    const fallbackCategories = [
      {
        id: "00000000-0000-0000-0000-000000000001",
        name: "General",
        description: "General products",
        parentId: null,
        companyId:
          (req.headers["x-company-id"] as string) ||
          "00000000-0000-0000-0000-000000000001",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: "00000000-0000-0000-0000-000000000002",
        name: "Medical Supplies",
        description: "Medical and healthcare supplies",
        parentId: null,
        companyId:
          (req.headers["x-company-id"] as string) ||
          "00000000-0000-0000-0000-000000000001",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: "00000000-0000-0000-0000-000000000003",
        name: "Medical Equipment",
        description: "Medical devices and equipment",
        parentId: null,
        companyId:
          (req.headers["x-company-id"] as string) ||
          "00000000-0000-0000-0000-000000000001",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: "00000000-0000-0000-0000-000000000004",
        name: "Electronics",
        description: "Electronic devices and accessories",
        parentId: null,
        companyId:
          (req.headers["x-company-id"] as string) ||
          "00000000-0000-0000-0000-000000000001",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    res.json({
      success: true,
      data: fallbackCategories,
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
