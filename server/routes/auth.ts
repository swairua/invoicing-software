import { Router } from "express";
import Database from "../database";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const router = Router();

// Login endpoint with database fallback
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    console.log("🔐 Login attempt for email:", email);

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: "Email and password are required"
      });
    }

    let user = null;

    // For demo/development, use fallback authentication first
    if (email === "admin@company.com" && password === "password") {
      user = {
        id: "demo-admin-001",
        email: "admin@company.com",
        first_name: "Admin",
        last_name: "User",
        role: "admin",
        company_id: "demo-company-001",
        company_name: "Demo Company"
      };
      console.log("👤 Using fallback admin user for demo");
    } else {
      // Only try database if not using demo credentials
      try {
        // Try to query the users table
        const userQuery = `
          SELECT u.*, c.name as company_name
          FROM users u
          LEFT JOIN companies c ON u.company_id = c.id
          WHERE u.email = ? AND u.is_active = 1
        `;

        const result = await Database.query(userQuery, [email]);

        if (result.rows && result.rows.length > 0) {
          user = result.rows[0];
          console.log("👤 Found user in database:", user.email, "Role:", user.role);
        }
      } catch (dbError) {
        console.log("⚠️ Database unavailable for non-demo user:", email);
      }
    }

    if (!user) {
      console.log("❌ User not found:", email);
      return res.status(401).json({
        success: false,
        error: "Invalid email or password"
      });
    }

    // For demo purposes, accept simple password or hashed password
    let passwordValid = false;

    if (user.password_hash && user.password_hash.startsWith('$2')) {
      // Check hashed password with bcrypt
      passwordValid = await bcrypt.compare(password, user.password_hash);
    } else {
      // For demo/development, allow simple password match
      passwordValid = password === 'password' ||
                     password === 'admin' ||
                     password === user.email.split('@')[0] ||
                     password === user.password_hash; // In case password_hash contains plain text
    }

    if (!passwordValid) {
      console.log("❌ Invalid password for user:", email);
      return res.status(401).json({
        success: false,
        error: "Invalid email or password"
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        role: user.role,
        companyId: user.company_id
      },
      process.env.JWT_SECRET || "default_secret_key",
      { expiresIn: "24h" }
    );

    // Return user data and token
    const userData = {
      id: user.id,
      email: user.email,
      firstName: user.first_name,
      lastName: user.last_name,
      role: user.role,
      companyId: user.company_id,
      companyName: user.company_name
    };

    console.log("✅ Login successful for:", email);

    res.json({
      success: true,
      user: userData,
      token
    });

  } catch (error) {
    console.error("💥 Login error:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error"
    });
  }
});

// Get current user endpoint (for token validation)
router.get("/me", async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({
        success: false,
        error: "No token provided"
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || "default_secret_key") as any;
    
    const userQuery = `
      SELECT u.*, c.name as company_name 
      FROM users u 
      LEFT JOIN companies c ON u.company_id = c.id 
      WHERE u.id = ? AND u.is_active = 1
    `;
    
    const result = await Database.query(userQuery, [decoded.userId]);
    
    if (!result.rows || result.rows.length === 0) {
      return res.status(401).json({
        success: false,
        error: "User not found"
      });
    }

    const user = result.rows[0];
    const userData = {
      id: user.id,
      email: user.email,
      firstName: user.first_name,
      lastName: user.last_name,
      role: user.role,
      companyId: user.company_id,
      companyName: user.company_name
    };

    res.json({
      success: true,
      user: userData
    });

  } catch (error) {
    console.error("💥 Token validation error:", error);
    res.status(401).json({
      success: false,
      error: "Invalid token"
    });
  }
});

export default router;
