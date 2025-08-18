import { Router } from "express";
import productRepository from "../repositories/productRepository";

const router = Router();

// Test product update with forced null category
router.put("/:id", async (req, res) => {
  console.log("🧪 TEST UPDATE endpoint called for product:", req.params.id);
  
  try {
    const companyId =
      (req.headers["x-company-id"] as string) ||
      "00000000-0000-0000-0000-000000000001";

    console.log("🧪 TEST: Request body fields:", Object.keys(req.body));
    
    // Get current product first
    const currentProduct = await productRepository.findById(req.params.id, companyId);
    if (!currentProduct) {
      return res.status(404).json({
        success: false,
        error: "Product not found",
      });
    }

    // Create minimal update data with forced null category
    const updateData = {
      name: req.body.name || currentProduct.name,
      description: req.body.description || currentProduct.description,
      sku: req.body.sku || currentProduct.sku,
      categoryId: null, // FORCE to null to prevent FK constraint
      unitOfMeasure: req.body.unit || currentProduct.unitOfMeasure,
      purchasePrice: req.body.purchasePrice || currentProduct.purchasePrice,
      sellingPrice: req.body.sellingPrice || currentProduct.sellingPrice,
      currentStock: req.body.currentStock || currentProduct.currentStock,
      minStock: req.body.minStock || currentProduct.minStock,
      maxStock: req.body.maxStock || currentProduct.maxStock,
      isActive: req.body.isActive !== undefined ? req.body.isActive : currentProduct.isActive,
      status: req.body.status || currentProduct.status,
    };

    console.log("🧪 TEST: Update data:", updateData);
    console.log("🧪 TEST: Forced categoryId to null");

    const updatedProduct = await productRepository.update(
      req.params.id,
      companyId,
      updateData
    );

    if (!updatedProduct) {
      return res.status(404).json({
        success: false,
        error: "Product not found after update",
      });
    }

    console.log("🧪 TEST: Update successful!");

    res.json({
      success: true,
      data: updatedProduct,
      message: "Product updated successfully (test endpoint)",
    });
  } catch (error) {
    console.error("🧪 TEST: Error updating product:", error);
    res.status(500).json({
      success: false,
      error: "Failed to update product (test endpoint)",
      details: error.message,
    });
  }
});

export default router;
