import { createClient } from "@libsql/client";
import dotenv from "dotenv";

dotenv.config();

const url = process.env.TURSO_DATABASE_URL || "file:local.db";
const authToken = process.env.TURSO_AUTH_TOKEN;

export const db = createClient({
  url,
  authToken,
});

// Run migrations/table creation
export async function initDB() {
  console.log(`Initializing SQLite/Turso database at: ${url}`);
  
  await db.execute(`
    CREATE TABLE IF NOT EXISTS transactions (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      amount REAL NOT NULL,
      type TEXT NOT NULL,
      category TEXT NOT NULL,
      date TEXT NOT NULL,
      notes TEXT
    )
  `);

  await db.execute(`
    CREATE TABLE IF NOT EXISTS budgets (
      category TEXT PRIMARY KEY,
      limit_amount REAL NOT NULL
    )
  `);

  await db.execute(`
    CREATE TABLE IF NOT EXISTS subscriptions (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      amount REAL NOT NULL,
      dueDate INTEGER NOT NULL,
      category TEXT NOT NULL
    )
  `);

  await db.execute(`
    CREATE TABLE IF NOT EXISTS categories (
      id TEXT PRIMARY KEY,
      label TEXT NOT NULL,
      color TEXT NOT NULL,
      type TEXT NOT NULL
    )
  `);

  await db.execute(`
    CREATE TABLE IF NOT EXISTS tax_calculations (
      id TEXT PRIMARY KEY,
      data TEXT NOT NULL
    )
  `);

  // Seed default categories if the table is empty
  const categoriesCount = await db.execute("SELECT COUNT(*) as count FROM categories");
  if (categoriesCount.rows[0].count === 0) {
    console.log("Seeding default categories...");
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
  }
}
