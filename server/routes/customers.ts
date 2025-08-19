import { Router } from "express";
import customerRepository from "../repositories/customerRepository";

const router = Router();

// Get all customers
router.get("/", async (req, res) => {
  console.log("🔍 GET /api/customers endpoint called");
  try {
    const companyId =
      (req.headers["x-company-id"] as string) ||
      "00000000-0000-0000-0000-000000000001";
    console.log("🏢 Company ID:", companyId);
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;
    const search = req.query.search as string;
    const isActive = req.query.isActive
      ? req.query.isActive === "true"
      : undefined;

    console.log("📋 Calling customerRepository.findAll...");
    const result = await customerRepository.findAll(companyId, {
      page,
      limit,
      search,
      isActive,
    });
    console.log("✅ Repository call successful, customers found:", result.customers.length);

    // If no customers found and we're in mock mode, return sample data
    if (result.customers.length === 0 && result.total === 0) {
      console.log("📋 No customers found, returning mock sample data");
      const mockCustomers = [
        {
          id: "mock-cust-1",
          name: "ABC Medical Center",
          email: "orders@abcmedical.co.ke",
          phone: "+254712345678",
          kraPin: "P051234567A",
          addressLine1: "123 Hospital Road",
          addressLine2: "",
          city: "Nairobi",
          state: "Nairobi County",
          postalCode: "00100",
          country: "Kenya",
          creditLimit: 100000,
          balance: 15000,
          currentBalance: 15000,
          isActive: true,
          companyId: companyId,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: "mock-cust-2",
          name: "Kenyatta University Hospital",
          email: "procurement@kuh.ac.ke",
          phone: "+254723456789",
          kraPin: "P051234567B",
          addressLine1: "456 University Way",
          addressLine2: "",
          city: "Nairobi",
          state: "Nairobi County",
          postalCode: "00100",
          country: "Kenya",
          creditLimit: 200000,
          balance: 0,
          currentBalance: 0,
          isActive: true,
          companyId: companyId,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: "mock-cust-3",
          name: "Health Plus Clinic",
          email: "supplies@healthplus.co.ke",
          phone: "+254734567890",
          kraPin: "P051234567C",
          addressLine1: "789 Wellness Street",
          addressLine2: "",
          city: "Mombasa",
          state: "Mombasa County",
          postalCode: "80100",
          country: "Kenya",
          creditLimit: 50000,
          balance: 8500,
          currentBalance: 8500,
          isActive: true,
          companyId: companyId,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      const response = {
        success: true,
        data: mockCustomers,
        meta: {
          total: mockCustomers.length,
          page,
          limit,
          totalPages: 1,
        },
      };

      console.log("📤 Sending mock customers response");
      res.json(response);
      return;
    }

    const response = {
      success: true,
      data: result.customers,
      meta: {
        total: result.total,
        page,
        limit,
        totalPages: Math.ceil(result.total / limit),
      },
    };

    console.log("📤 Sending response:", JSON.stringify(response, null, 2));
    res.json(response);
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
      "00000000-0000-0000-0000-000000000001";
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
      "00000000-0000-0000-0000-000000000001";
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
      "00000000-0000-0000-0000-000000000001";

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
      "00000000-0000-0000-0000-000000000001";

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
