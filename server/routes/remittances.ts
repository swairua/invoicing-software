import { Router } from "express";
import Database from "../database";

const router = Router();

// Get all remittance advice records
router.get("/", async (req, res) => {
  try {
    const companyId =
      (req.headers["x-company-id"] as string) ||
      "00000000-0000-0000-0000-000000000001";

    console.log(
      "📋 Fetching remittance advice records for company:",
      companyId,
    );

    // For now, return mock data since the remittances table may not exist yet
    // TODO: Create remittances table in database and implement proper queries
    const mockRemittances = [
      {
        id: "1",
        remittanceNumber: "RA202401001",
        date: "2024-01-15",
        customerName: "ABC Electronics Ltd",
        customerEmail: "orders@abcelectronics.co.ke",
        totalPayment: 45000,
        itemCount: 3,
        status: "sent",
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: "2",
        remittanceNumber: "RA202401002",
        date: "2024-01-18",
        customerName: "Digital Solutions Co",
        customerEmail: "info@digitalsolutions.co.ke",
        totalPayment: 28500,
        itemCount: 2,
        status: "draft",
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: "3",
        remittanceNumber: "RA202401003",
        date: "2024-01-20",
        customerName: "Kenyan Medical Supplies",
        customerEmail: "procurement@kenyamed.co.ke",
        totalPayment: 62000,
        itemCount: 5,
        status: "sent",
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      },
    ];

    console.log(
      `📋 Returning ${mockRemittances.length} remittance advice records`,
    );

    res.json({
      success: true,
      remittances: mockRemittances,
      data: mockRemittances, // Also include as 'data' for consistency
    });
  } catch (error) {
    console.error("Error fetching remittance advice records:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch remittance advice records",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

// Get remittance advice by ID
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const companyId =
      (req.headers["x-company-id"] as string) ||
      "00000000-0000-0000-0000-000000000001";

    console.log(`📋 Fetching remittance advice ${id} for company:`, companyId);

    // Get the corresponding remittance from our mock data
    const allRemittances = [
      {
        id: "1",
        remittanceNumber: "RA202401001",
        date: "2024-01-15",
        customerName: "ABC Electronics Ltd",
        customerEmail: "orders@abcelectronics.co.ke",
        customerAddress: "123 Industrial Area\nNairobi, Kenya",
        totalPayment: 45000,
        itemCount: 3,
        status: "sent",
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        items: [
          {
            id: "1",
            date: "2024-01-10",
            reference: "INV-2024-005",
            type: "invoice",
            amount: 20000,
            paymentAmount: 20000,
          },
          {
            id: "2",
            date: "2024-01-12",
            reference: "INV-2024-007",
            type: "invoice",
            amount: 15000,
            paymentAmount: 15000,
          },
          {
            id: "3",
            date: "2024-01-14",
            reference: "INV-2024-009",
            type: "invoice",
            amount: 10000,
            paymentAmount: 10000,
          },
        ],
      },
      {
        id: "2",
        remittanceNumber: "RA202401002",
        date: "2024-01-18",
        customerName: "Digital Solutions Co",
        customerEmail: "info@digitalsolutions.co.ke",
        customerAddress: "456 Westlands Road\nNairobi, Kenya",
        totalPayment: 28500,
        itemCount: 2,
        status: "draft",
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        items: [
          {
            id: "1",
            date: "2024-01-15",
            reference: "INV-2024-011",
            type: "invoice",
            amount: 18500,
            paymentAmount: 18500,
          },
          {
            id: "2",
            date: "2024-01-16",
            reference: "INV-2024-013",
            type: "invoice",
            amount: 10000,
            paymentAmount: 10000,
          },
        ],
      },
      {
        id: "3",
        remittanceNumber: "RA202401003",
        date: "2024-01-20",
        customerName: "Kenyan Medical Supplies",
        customerEmail: "procurement@kenyamed.co.ke",
        customerAddress: "789 Hospital Road\nNairobi, Kenya",
        totalPayment: 62000,
        itemCount: 5,
        status: "sent",
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        items: [
          {
            id: "1",
            date: "2024-01-16",
            reference: "INV-2024-015",
            type: "invoice",
            amount: 15000,
            paymentAmount: 15000,
          },
          {
            id: "2",
            date: "2024-01-17",
            reference: "INV-2024-017",
            type: "invoice",
            amount: 12000,
            paymentAmount: 12000,
          },
          {
            id: "3",
            date: "2024-01-18",
            reference: "INV-2024-019",
            type: "invoice",
            amount: 15000,
            paymentAmount: 15000,
          },
          {
            id: "4",
            date: "2024-01-19",
            reference: "INV-2024-021",
            type: "invoice",
            amount: 10000,
            paymentAmount: 10000,
          },
          {
            id: "5",
            date: "2024-01-20",
            reference: "INV-2024-023",
            type: "invoice",
            amount: 10000,
            paymentAmount: 10000,
          },
        ],
      },
    ];

    // Find the specific remittance or return default
    const mockRemittance = allRemittances.find((r) => r.id === id) || {
      id,
      remittanceNumber: `RA202401${id.padStart(3, "0")}`,
      date: new Date().toISOString().split("T")[0],
      customerName: "Default Customer",
      customerEmail: "customer@example.com",
      customerAddress: "Default Address\nCity, Country",
      totalPayment: 35000,
      itemCount: 1,
      status: "draft",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      items: [
        {
          id: "1",
          date: new Date().toISOString().split("T")[0],
          reference: "REF-DEFAULT",
          type: "invoice",
          amount: 35000,
          paymentAmount: 35000,
        },
      ],
    };

    res.json({
      success: true,
      data: mockRemittance,
    });
  } catch (error) {
    console.error(`Error fetching remittance advice ${req.params.id}:`, error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch remittance advice",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

// Create new remittance advice
router.post("/", async (req, res) => {
  try {
    const companyId =
      (req.headers["x-company-id"] as string) ||
      "00000000-0000-0000-0000-000000000001";
    const userId =
      (req.headers["x-user-id"] as string) ||
      "550e8400-e29b-41d4-a716-446655440001";

    const remittanceData = req.body;

    console.log("📋 Creating new remittance advice:", remittanceData);

    // Mock response for created remittance
    const newRemittance = {
      id: Date.now().toString(),
      remittanceNumber: remittanceData.remittanceNumber || `RA${Date.now()}`,
      date: remittanceData.date || new Date().toISOString().split("T")[0],
      customerName: remittanceData.customer?.name || "Unknown Customer",
      customerEmail: remittanceData.customer?.email || "",
      totalPayment: remittanceData.totalPayment || 0,
      itemCount: remittanceData.items?.length || 0,
      status: remittanceData.status || "draft",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    res.status(201).json({
      success: true,
      data: newRemittance,
    });
  } catch (error) {
    console.error("Error creating remittance advice:", error);
    res.status(500).json({
      success: false,
      error: "Failed to create remittance advice",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

// Update remittance advice
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const companyId =
      (req.headers["x-company-id"] as string) ||
      "00000000-0000-0000-0000-000000000001";

    const remittanceData = req.body;

    console.log(`📋 Updating remittance advice ${id}:`, remittanceData);

    // Mock updated remittance
    const updatedRemittance = {
      id,
      ...remittanceData,
      updatedAt: new Date().toISOString(),
    };

    res.json({
      success: true,
      data: updatedRemittance,
    });
  } catch (error) {
    console.error(`Error updating remittance advice ${req.params.id}:`, error);
    res.status(500).json({
      success: false,
      error: "Failed to update remittance advice",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

// Delete remittance advice
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const companyId =
      (req.headers["x-company-id"] as string) ||
      "00000000-0000-0000-0000-000000000001";

    console.log(`📋 Deleting remittance advice ${id} for company:`, companyId);

    res.json({
      success: true,
      message: "Remittance advice deleted successfully",
    });
  } catch (error) {
    console.error(`Error deleting remittance advice ${req.params.id}:`, error);
    res.status(500).json({
      success: false,
      error: "Failed to delete remittance advice",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

export default router;
