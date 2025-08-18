import { Router } from "express";
import customerRepository from "../repositories/customerRepository";

const router = Router();

// Get all customers
router.get("/", async (req, res) => {
  try {
    const companyId =
      (req.headers["x-company-id"] as string) ||
      "550e8400-e29b-41d4-a716-446655440000";
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;
    const search = req.query.search as string;
    const isActive = req.query.isActive
      ? req.query.isActive === "true"
      : undefined;

    const result = await customerRepository.findAll(companyId, {
      page,
      limit,
      search,
      isActive,
    });

    res.json({
      success: true,
      data: result.customers,
      meta: {
        total: result.total,
        page,
        limit,
        totalPages: Math.ceil(result.total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching customers:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch customers from database",
      details: error.message,
    });
  }
});

// Get customer by ID
router.get("/:id", async (req, res) => {
  try {
    const companyId =
      (req.headers["x-company-id"] as string) ||
      "550e8400-e29b-41d4-a716-446655440000";
    const customer = await customerRepository.findById(
      req.params.id,
      companyId,
    );

    if (!customer) {
      return res.status(404).json({
        success: false,
        error: "Customer not found",
      });
    }

    res.json({
      success: true,
      data: customer,
    });
  } catch (error) {
    console.error("Error fetching customer:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch customer from database",
      details: error.message,
    });
  }
});

// Create new customer
router.post("/", async (req, res) => {
  try {
    const companyId =
      (req.headers["x-company-id"] as string) ||
      "550e8400-e29b-41d4-a716-446655440000";
    const userId =
      (req.headers["x-user-id"] as string) ||
      "550e8400-e29b-41d4-a716-446655440001";

    const customerData = {
      ...req.body,
      companyId,
    };

    const customer = await customerRepository.create(customerData);

    res.status(201).json({
      success: true,
      data: customer,
    });
  } catch (error) {
    console.error("Error creating customer:", error);
    res.status(500).json({
      success: false,
      error: "Failed to create customer in database",
      details: error.message,
    });
  }
});

// Update customer
router.put("/:id", async (req, res) => {
  try {
    console.log("Customer update route - ID:", req.params.id);
    console.log("Customer update route - Body:", req.body);
    const companyId =
      (req.headers["x-company-id"] as string) ||
      "550e8400-e29b-41d4-a716-446655440000";

    const customer = await customerRepository.update(
      req.params.id,
      companyId,
      req.body,
    );

    if (!customer) {
      return res.status(404).json({
        success: false,
        error: "Customer not found",
      });
    }

    res.json({
      success: true,
      data: customer,
    });
  } catch (error) {
    console.error("Error updating customer:", error);
    res.status(500).json({
      success: false,
      error: "Failed to update customer in database",
      details: error.message,
    });
  }
});

// Delete customer (soft delete)
router.delete("/:id", async (req, res) => {
  try {
    const companyId =
      (req.headers["x-company-id"] as string) ||
      "550e8400-e29b-41d4-a716-446655440000";

    const success = await customerRepository.delete(req.params.id, companyId);

    if (!success) {
      return res.status(404).json({
        success: false,
        error: "Customer not found",
      });
    }

    res.json({
      success: true,
      message: "Customer deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting customer:", error);
    res.status(500).json({
      success: false,
      error: "Failed to delete customer from database",
      details: error.message,
    });
  }
});

// Get customer outstanding balance
router.get("/:id/outstanding", async (req, res) => {
  try {
    const balance = await customerRepository.getOutstandingBalance(
      req.params.id,
    );

    res.json({
      success: true,
      data: { balance },
    });
  } catch (error) {
    console.error("Error fetching outstanding balance:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch outstanding balance from database",
      details: error.message,
    });
  }
});

export default router;
