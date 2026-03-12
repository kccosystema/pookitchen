import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import cors from "cors";
import bodyParser from "body-parser";
import multer from "multer";
import Database from "better-sqlite3";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const db = new Database("static_riot.db");

// Initialize Database
db.exec(`
  CREATE TABLE IF NOT EXISTS categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL
  );

  CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    category_id INTEGER,
    base_price REAL NOT NULL,
    compare_at_price REAL,
    status TEXT DEFAULT 'draft',
    featured_image TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(id)
  );

  CREATE TABLE IF NOT EXISTS variants (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    product_id INTEGER,
    size TEXT,
    color TEXT,
    sku TEXT,
    inventory INTEGER DEFAULT 0,
    price REAL,
    FOREIGN KEY (product_id) REFERENCES products(id)
  );

  CREATE TABLE IF NOT EXISTS model_images (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    url TEXT NOT NULL,
    name TEXT
  );

  CREATE TABLE IF NOT EXISTS design_assets (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    url TEXT NOT NULL,
    name TEXT
  );

  CREATE TABLE IF NOT EXISTS product_images (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    product_id INTEGER,
    url TEXT NOT NULL,
    is_mockup INTEGER DEFAULT 0,
    FOREIGN KEY (product_id) REFERENCES products(id)
  );
`);

  // Seed initial categories if empty
  const categoryCount = db.prepare("SELECT COUNT(*) as count FROM categories").get() as { count: number };
  if (categoryCount.count === 0) {
    const insertCategory = db.prepare("INSERT INTO categories (name, slug) VALUES (?, ?)");
    insertCategory.run("Band T-Shirts", "band-tees");
    insertCategory.run("Funny T-Shirts", "funny-tees");
    insertCategory.run("Graphic T-Shirts", "graphic-tees");

    // Seed initial model images
    const insertModel = db.prepare("INSERT INTO model_images (url, name) VALUES (?, ?)");
    insertModel.run("https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=1000&auto=format&fit=crop", "Male Model White Tee");
    insertModel.run("https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?q=80&w=1000&auto=format&fit=crop", "Female Model Black Tee");
    insertModel.run("https://images.unsplash.com/photo-1554568218-0f1715e72254?q=80&w=1000&auto=format&fit=crop", "Male Model Grey Tee");

    // Seed initial design assets
    const insertDesign = db.prepare("INSERT INTO design_assets (url, name) VALUES (?, ?)");
    insertDesign.run("https://cdn.pixabay.com/photo/2017/01/31/15/33/linux-2025079_1280.png", "Tux Design");
    insertDesign.run("https://cdn.pixabay.com/photo/2017/01/31/23/42/animal-2028258_1280.png", "Wolf Design");
    insertDesign.run("https://cdn.pixabay.com/photo/2016/03/31/18/31/skull-1294415_1280.png", "Skull Design");

    // Seed initial products
    const insertProduct = db.prepare(`
      INSERT INTO products (title, slug, description, category_id, base_price, compare_at_price, status, featured_image)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);
    insertProduct.run("Anarchy Logo Tee", "anarchy-logo-tee", "The classic riot statement. Heavyweight cotton.", 3, 35, 45, "published", "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=1000&auto=format&fit=crop");
    insertProduct.run("Death Metal Panda", "death-metal-panda", "Cute but deadly. For the soft-hearted metalhead.", 1, 32, 40, "published", "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?q=80&w=1000&auto=format&fit=crop");
    insertProduct.run("System Failure", "system-failure", "When everything goes wrong, wear it.", 3, 38, 50, "published", "https://images.unsplash.com/photo-1554568218-0f1715e72254?q=80&w=1000&auto=format&fit=crop");
    insertProduct.run("No Signal", "no-signal", "Static is the only truth.", 3, 30, 35, "published", "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=1000&auto=format&fit=crop");
  }

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(cors());
  app.use(bodyParser.json({ limit: '50mb' }));
  app.use(bodyParser.urlencoded({ extended: true, limit: '50mb' }));

  // API Routes
  app.get("/api/categories", (req, res) => {
    const categories = db.prepare("SELECT * FROM categories").all();
    res.json(categories);
  });

  app.get("/api/products", (req, res) => {
    const { status } = req.query;
    let query = "SELECT p.*, c.name as category_name FROM products p LEFT JOIN categories c ON p.category_id = c.id";
    if (status) {
      query += " WHERE p.status = ?";
      const products = db.prepare(query).all(status);
      res.json(products);
    } else {
      const products = db.prepare(query).all();
      res.json(products);
    }
  });

  app.get("/api/products/:slug", (req, res) => {
    const product = db.prepare("SELECT p.*, c.name as category_name FROM products p LEFT JOIN categories c ON p.category_id = c.id WHERE p.slug = ?").get(req.params.slug);
    if (!product) return res.status(404).json({ error: "Product not found" });
    
    const variants = db.prepare("SELECT * FROM variants WHERE product_id = ?").all((product as any).id);
    const images = db.prepare("SELECT * FROM product_images WHERE product_id = ?").all((product as any).id);
    
    res.json({ ...product, variants, images });
  });

  app.post("/api/products", (req, res) => {
    const { title, slug, description, category_id, base_price, compare_at_price, status } = req.body;
    try {
      const info = db.prepare(`
        INSERT INTO products (title, slug, description, category_id, base_price, compare_at_price, status)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `).run(title, slug, description, category_id, base_price, compare_at_price, status || 'draft');
      res.json({ id: info.lastInsertRowid });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  app.get("/api/model-images", (req, res) => {
    const images = db.prepare("SELECT * FROM model_images").all();
    res.json(images);
  });

  app.post("/api/model-images", (req, res) => {
    const { url, name } = req.body;
    const info = db.prepare("INSERT INTO model_images (url, name) VALUES (?, ?)").run(url, name);
    res.json({ id: info.lastInsertRowid });
  });

  app.get("/api/design-assets", (req, res) => {
    const designs = db.prepare("SELECT * FROM design_assets").all();
    res.json(designs);
  });

  app.post("/api/design-assets", (req, res) => {
    const { url, name } = req.body;
    const info = db.prepare("INSERT INTO design_assets (url, name) VALUES (?, ?)").run(url, name);
    res.json({ id: info.lastInsertRowid });
  });

  app.post("/api/products/:id/images", (req, res) => {
    const { url, is_mockup } = req.body;
    const info = db.prepare("INSERT INTO product_images (product_id, url, is_mockup) VALUES (?, ?, ?)").run(req.params.id, url, is_mockup ? 1 : 0);
    res.json({ id: info.lastInsertRowid });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
