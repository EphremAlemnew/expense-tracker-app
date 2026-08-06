import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { db, initDB } from "../server/db.js";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// Initialize SQLite database tables on first request
let isDBInit = false;
app.use(async (req, res, next) => {
  if (!isDBInit) {
    try {
      await initDB();
      isDBInit = true;
    } catch (err) {
      console.error("Database initialization failed in serverless function:", err);
    }
  }
  next();
});

// --- API Endpoints ---

// Authentication Route
app.post("/api/login", async (req, res) => {
  const { username, password } = req.body;
  const expectedUsername = process.env.AUTH_USERNAME || "ephrem";
  const expectedPassword = process.env.AUTH_PASSWORD || "password123";
  if (username === expectedUsername && password === expectedPassword) {
    res.json({ success: true, token: "fortuna_auth_token_secret", username: expectedUsername });
  } else {
    res.status(401).json({ success: false, message: "Incorrect username or password. Please try again." });
  }
});

// 1. Transactions
app.get("/api/transactions", async (req, res) => {
  try {
    const result = await db.execute("SELECT * FROM transactions ORDER BY date DESC");
    res.json(result.rows || []);
  } catch (error) {
    console.error("Error fetching transactions:", error);
    res.status(500).json({ error: "Failed to fetch transactions" });
  }
});

app.post("/api/transactions", async (req, res) => {
  try {
    const tx = req.body;

    if (tx.id) {
      // Edit
      await db.execute({
        sql: "UPDATE transactions SET title = ?, amount = ?, type = ?, category = ?, date = ?, notes = ? WHERE id = ?",
        args: [tx.title, tx.amount, tx.type, tx.category, tx.date, tx.notes || "", tx.id],
      });
    } else {
      // Add
      tx.id = Math.random().toString(36).substring(2, 9);
      await db.execute({
        sql: "INSERT INTO transactions (id, title, amount, type, category, date, notes) VALUES (?, ?, ?, ?, ?, ?, ?)",
        args: [tx.id, tx.title, tx.amount, tx.type, tx.category, tx.date, tx.notes || ""],
      });
    }

    res.status(200).json(tx);
  } catch (error) {
    console.error("Error saving transaction:", error);
    res.status(500).json({ error: "Failed to save transaction" });
  }
});

app.delete("/api/transactions/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await db.execute({
      sql: "DELETE FROM transactions WHERE id = ?",
      args: [id],
    });
    res.status(200).json({ success: true });
  } catch (error) {
    console.error("Error deleting transaction:", error);
    res.status(500).json({ error: "Failed to delete transaction" });
  }
});

app.delete("/api/transactions", async (req, res) => {
  try {
    await db.execute("DELETE FROM transactions");
    res.status(200).json({ success: true });
  } catch (error) {
    console.error("Error clearing transactions:", error);
    res.status(500).json({ error: "Failed to clear transactions" });
  }
});

// 2. Budgets
app.get("/api/budgets", async (req, res) => {
  try {
    const result = await db.execute("SELECT category, limit_amount as \"limit\" FROM budgets");
    const budgets = (result.rows || []).map((r) => ({
      category: r.category,
      limit: r.limit,
    }));
    res.json(budgets);
  } catch (error) {
    console.error("Error fetching budgets:", error);
    res.status(500).json({ error: "Failed to fetch budgets" });
  }
});

app.post("/api/budgets", async (req, res) => {
  try {
    const budget = req.body;
    await db.execute({
      sql: "INSERT INTO budgets (category, limit_amount) VALUES (?, ?) ON CONFLICT(category) DO UPDATE SET limit_amount = excluded.limit_amount",
      args: [budget.category, budget.limit],
    });
    res.status(200).json(budget);
  } catch (error) {
    console.error("Error saving budget:", error);
    res.status(500).json({ error: "Failed to save budget" });
  }
});

app.delete("/api/budgets/:category", async (req, res) => {
  try {
    const { category } = req.params;
    await db.execute({
      sql: "DELETE FROM budgets WHERE category = ?",
      args: [category],
    });
    res.status(200).json({ success: true });
  } catch (error) {
    console.error("Error deleting budget:", error);
    res.status(500).json({ error: "Failed to delete budget" });
  }
});

// 3. Subscriptions
app.get("/api/subscriptions", async (req, res) => {
  try {
    const result = await db.execute("SELECT * FROM subscriptions");
    res.json(result.rows || []);
  } catch (error) {
    console.error("Error fetching subscriptions:", error);
    res.status(500).json({ error: "Failed to fetch subscriptions" });
  }
});

app.post("/api/subscriptions", async (req, res) => {
  try {
    const sub = req.body;
    if (!sub.id) {
      sub.id = Math.random().toString(36).substring(2, 9);
    }
    await db.execute({
      sql: "INSERT INTO subscriptions (id, title, amount, dueDate, category) VALUES (?, ?, ?, ?, ?) ON CONFLICT(id) DO UPDATE SET title = excluded.title, amount = excluded.amount, dueDate = excluded.dueDate, category = excluded.category",
      args: [sub.id, sub.title, sub.amount, sub.dueDate, sub.category],
    });
    res.status(200).json(sub);
  } catch (error) {
    console.error("Error saving subscription:", error);
    res.status(500).json({ error: "Failed to save subscription" });
  }
});

app.delete("/api/subscriptions/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await db.execute({
      sql: "DELETE FROM subscriptions WHERE id = ?",
      args: [id],
    });
    res.status(200).json({ success: true });
  } catch (error) {
    console.error("Error deleting subscription:", error);
    res.status(500).json({ error: "Failed to delete subscription" });
  }
});

// 4. Categories
app.get("/api/categories", async (req, res) => {
  try {
    const result = await db.execute("SELECT * FROM categories");
    res.json(result.rows || []);
  } catch (error) {
    console.error("Error fetching categories:", error);
    res.status(500).json({ error: "Failed to fetch categories" });
  }
});

app.post("/api/categories", async (req, res) => {
  try {
    const cat = req.body;
    if (!cat.id) {
      cat.id = cat.label.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    }
    await db.execute({
      sql: "INSERT INTO categories (id, label, color, type) VALUES (?, ?, ?, ?) ON CONFLICT(id) DO UPDATE SET label = excluded.label, color = excluded.color, type = excluded.type",
      args: [cat.id, cat.label, cat.color, cat.type],
    });
    res.status(200).json(cat);
  } catch (error) {
    console.error("Error saving category:", error);
    res.status(500).json({ error: "Failed to save category" });
  }
});

// 5. Tax Calculations
app.get("/api/tax-calculations", async (req, res) => {
  try {
    const result = await db.execute("SELECT * FROM tax_calculations");
    const calcs = (result.rows || []).map((r) => {
      try {
        return JSON.parse(r.data);
      } catch {
        return { id: r.id };
      }
    });
    res.json(calcs);
  } catch (error) {
    console.error("Error fetching tax calculations:", error);
    res.status(500).json({ error: "Failed to fetch tax calculations" });
  }
});

app.post("/api/tax-calculations", async (req, res) => {
  try {
    const calc = req.body;
    if (!calc.id) {
      calc.id = Math.random().toString(36).substring(2, 9);
    }
    await db.execute({
      sql: "INSERT INTO tax_calculations (id, data) VALUES (?, ?)",
      args: [calc.id, JSON.stringify(calc)],
    });
    res.status(200).json(calc);
  } catch (error) {
    console.error("Error saving tax calculation:", error);
    res.status(500).json({ error: "Failed to save tax calculation" });
  }
});

app.delete("/api/tax-calculations/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await db.execute({
      sql: "DELETE FROM tax_calculations WHERE id = ?",
      args: [id],
    });
    res.status(200).json({ success: true });
  } catch (error) {
    console.error("Error deleting tax calculation:", error);
    res.status(500).json({ error: "Failed to delete tax calculation" });
  }
});

// 6. Reset Database
app.delete("/api/reset", async (req, res) => {
  try {
    await db.execute("DELETE FROM transactions");
    await db.execute("DELETE FROM budgets");
    await db.execute("DELETE FROM subscriptions");
    await db.execute("DELETE FROM tax_calculations");
    await db.execute("DELETE FROM categories");
    
    // Seed default categories
    const defaultCategories = [
      { id: "food", label: "Food & Dining", color: "#f87171", type: "expense" },
      { id: "utilities", label: "Bills & Utilities", color: "#60a5fa", type: "expense" },
      { id: "entertainment", label: "Entertainment", color: "#c084fc", type: "expense" },
      { id: "transport", label: "Transportation", color: "#facc15", type: "expense" },
      { id: "shopping", label: "Shopping", color: "#f472b6", type: "expense" },
      { id: "health", label: "Health & Fitness", color: "#34d399", type: "expense" },
      { id: "other", label: "Other Expenses", color: "#94a3b8", type: "expense" },
      { id: "salary", label: "Salary", color: "#10b981", type: "income" },
      { id: "freelance", label: "Freelance Work", color: "#3b82f6", type: "income" },
      { id: "investments", label: "Investments", color: "#f59e0b", type: "income" },
      { id: "other_income", label: "Other Income", color: "#6b7280", type: "income" }
    ];

    for (const cat of defaultCategories) {
      await db.execute({
        sql: "INSERT INTO categories (id, label, color, type) VALUES (?, ?, ?, ?)",
        args: [cat.id, cat.label, cat.color, cat.type],
      });
    }

    res.status(200).json({ success: true });
  } catch (error) {
    console.error("Error resetting database:", error);
    res.status(500).json({ error: "Failed to reset database" });
  }
});

export default app;
