import express from "express";
import cors from "cors";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = path.join(__dirname, "db.json");

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Helper to read JSON DB
async function readDB() {
  try {
    const data = await fs.readFile(dbPath, "utf-8");
    return JSON.parse(data);
  } catch (error) {
    console.error("Error reading database:", error);
    return { transactions: [], budgets: [], subscriptions: [], taxCalculations: [] };
  }
}

// Helper to write JSON DB
async function writeDB(data) {
  try {
    await fs.writeFile(dbPath, JSON.stringify(data, null, 2), "utf-8");
  } catch (error) {
    console.error("Error writing database:", error);
  }
}

// --- API Endpoints ---

// 1. Transactions
app.get("/api/transactions", async (req, res) => {
  const db = await readDB();
  res.json(db.transactions || []);
});

app.post("/api/transactions", async (req, res) => {
  const db = await readDB();
  const tx = req.body;

  if (!db.transactions) db.transactions = [];

  if (tx.id) {
    // Edit
    db.transactions = db.transactions.map((t) => (t.id === tx.id ? tx : t));
  } else {
    // Add
    tx.id = Math.random().toString(36).substring(2, 9);
    db.transactions.unshift(tx);
  }

  await writeDB(db);
  res.status(200).json(tx);
});

app.delete("/api/transactions/:id", async (req, res) => {
  const db = await readDB();
  const { id } = req.params;

  db.transactions = (db.transactions || []).filter((t) => t.id !== id);
  await writeDB(db);
  res.status(200).json({ success: true });
});

app.delete("/api/transactions", async (req, res) => {
  const db = await readDB();
  db.transactions = [];
  await writeDB(db);
  res.status(200).json({ success: true });
});

// 2. Budgets
app.get("/api/budgets", async (req, res) => {
  const db = await readDB();
  res.json(db.budgets || []);
});

app.post("/api/budgets", async (req, res) => {
  const db = await readDB();
  const budget = req.body;

  if (!db.budgets) db.budgets = [];

  const idx = db.budgets.findIndex((b) => b.category === budget.category);
  if (idx > -1) {
    db.budgets[idx] = budget;
  } else {
    db.budgets.push(budget);
  }

  await writeDB(db);
  res.status(200).json(budget);
});

app.delete("/api/budgets/:category", async (req, res) => {
  const db = await readDB();
  const { category } = req.params;

  db.budgets = (db.budgets || []).filter((b) => b.category !== category);
  await writeDB(db);
  res.status(200).json({ success: true });
});

// 3. Subscriptions
app.get("/api/subscriptions", async (req, res) => {
  const db = await readDB();
  res.json(db.subscriptions || []);
});

app.post("/api/subscriptions", async (req, res) => {
  const db = await readDB();
  const sub = req.body;

  if (!db.subscriptions) db.subscriptions = [];
  
  // Basic generate ID if not exists
  if (!sub.id) {
    sub.id = Math.random().toString(36).substring(2, 9);
  }

  const idx = db.subscriptions.findIndex((s) => s.id === sub.id);
  if (idx > -1) {
    db.subscriptions[idx] = sub;
  } else {
    db.subscriptions.push(sub);
  }

  await writeDB(db);
  res.status(200).json(sub);
});

app.delete("/api/subscriptions/:id", async (req, res) => {
  const db = await readDB();
  const { id } = req.params;

  db.subscriptions = (db.subscriptions || []).filter((s) => s.id !== id);
  await writeDB(db);
  res.status(200).json({ success: true });
});

// 4. Tax Calculations
app.get("/api/tax-calculations", async (req, res) => {
  const db = await readDB();
  res.json(db.taxCalculations || []);
});

app.post("/api/tax-calculations", async (req, res) => {
  const db = await readDB();
  const calc = req.body;

  if (!db.taxCalculations) db.taxCalculations = [];

  calc.id = Math.random().toString(36).substring(2, 9);
  db.taxCalculations.unshift(calc);

  await writeDB(db);
  res.status(200).json(calc);
});

app.delete("/api/tax-calculations/:id", async (req, res) => {
  const db = await readDB();
  const { id } = req.params;

  db.taxCalculations = (db.taxCalculations || []).filter((c) => c.id !== id);
  await writeDB(db);
  res.status(200).json({ success: true });
});

// Start Server
app.listen(PORT, () => {
  console.log(`Fortuna Server running at http://localhost:${PORT}`);
});
