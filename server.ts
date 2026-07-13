import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import fs from "fs";
import crypto from "crypto";
import cors from "cors";
import multer from "multer";
import Database from "better-sqlite3";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT) || 3000;
const UPLOAD_DIR = process.env.UPLOAD_DIR
  ? path.resolve(process.env.UPLOAD_DIR)
  : path.join(__dirname, "uploads");
const PUBLIC_BASE_URL = process.env.PUBLIC_BASE_URL || ""; // e.g. https://cdn.example.com
const MAX_FILE_SIZE = Number(process.env.MAX_FILE_SIZE) || 25 * 1024 * 1024; // 25MB

// The token that guards uploads / deletes. Serving images is always public.
const CDN_TOKEN = process.env.CDN_TOKEN || "dev-token-change-me";
if (CDN_TOKEN === "dev-token-change-me") {
  console.warn(
    "\n\x1b[33m⚠  CDN_TOKEN is not set. Using the default dev token 'dev-token-change-me'.\n" +
      "   Set CDN_TOKEN in your environment before exposing this publicly.\x1b[0m\n"
  );
}

// Ensure the upload directory exists.
fs.mkdirSync(UPLOAD_DIR, { recursive: true });

// ---------------------------------------------------------------------------
// Database
// ---------------------------------------------------------------------------
const db = new Database(path.join(__dirname, "pooki_cdn.db"));
db.pragma("journal_mode = WAL");
db.exec(`
  CREATE TABLE IF NOT EXISTS images (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    filename      TEXT UNIQUE NOT NULL,   -- stored name on disk (also the public path)
    original_name TEXT,                   -- human friendly label
    mimetype      TEXT NOT NULL,
    size          INTEGER NOT NULL,       -- bytes
    created_at    DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

// ---------------------------------------------------------------------------
// Upload handling
// ---------------------------------------------------------------------------
const ALLOWED_EXT: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/gif": ".gif",
  "image/webp": ".webp",
  "image/avif": ".avif",
  "image/svg+xml": ".svg",
  "image/bmp": ".bmp",
  "image/tiff": ".tiff",
  "image/x-icon": ".ico",
};

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOAD_DIR),
  filename: (_req, file, cb) => {
    const id = crypto.randomBytes(8).toString("hex");
    const ext =
      ALLOWED_EXT[file.mimetype] ||
      path.extname(file.originalname).toLowerCase() ||
      "";
    cb(null, `${id}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: MAX_FILE_SIZE },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith("image/")) return cb(null, true);
    cb(new Error("Only image files are allowed."));
  },
});

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function baseUrl(req: express.Request): string {
  if (PUBLIC_BASE_URL) return PUBLIC_BASE_URL.replace(/\/$/, "");
  const proto = (req.headers["x-forwarded-proto"] as string) || req.protocol;
  const host = req.headers["x-forwarded-host"] || req.get("host");
  return `${proto}://${host}`;
}

function toPublic(req: express.Request, row: any) {
  return {
    id: row.id,
    filename: row.filename,
    original_name: row.original_name,
    mimetype: row.mimetype,
    size: row.size,
    created_at: row.created_at,
    url: `${baseUrl(req)}/cdn/${row.filename}`,
  };
}

// Bearer-token auth for write operations.
function requireAuth(
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ")
    ? header.slice(7)
    : (req.headers["x-api-key"] as string) || "";
  // Constant-time comparison to avoid leaking timing information.
  const a = Buffer.from(token);
  const b = Buffer.from(CDN_TOKEN);
  if (a.length === b.length && crypto.timingSafeEqual(a, b)) return next();
  res.status(401).json({ error: "Invalid or missing API token." });
}

// ---------------------------------------------------------------------------
// Server
// ---------------------------------------------------------------------------
async function startServer() {
  const app = express();
  app.set("trust proxy", true);
  app.use(cors());
  app.use(express.json());

  // --- Public: serve the actual image files with long-lived immutable cache.
  // Filenames contain a random hash, so a given URL never changes contents.
  app.use(
    "/cdn",
    express.static(UPLOAD_DIR, {
      immutable: true,
      maxAge: "1y",
      // A missing image must 404, not fall through to the SPA index.html.
      fallthrough: false,
      setHeaders: (res) => {
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
      },
    })
  );

  // --- Public: health + image count.
  app.get("/api/health", (_req, res) => {
    res.json({
      ok: true,
      images: (db.prepare("SELECT COUNT(*) AS n FROM images").get() as any).n,
    });
  });

  // --- Auth check endpoint (used by the dashboard to validate a token).
  app.get("/api/auth", requireAuth, (_req, res) => res.json({ ok: true }));

  // --- List images (protected: this is your library index).
  app.get("/api/images", requireAuth, (req, res) => {
    const q = ((req.query.q as string) || "").trim().toLowerCase();
    let rows: any[];
    if (q) {
      rows = db
        .prepare(
          "SELECT * FROM images WHERE lower(original_name) LIKE ? OR lower(filename) LIKE ? ORDER BY id DESC"
        )
        .all(`%${q}%`, `%${q}%`);
    } else {
      rows = db.prepare("SELECT * FROM images ORDER BY id DESC").all();
    }
    res.json(rows.map((r) => toPublic(req, r)));
  });

  // --- Upload one or more images.
  app.post("/api/upload", requireAuth, (req, res) => {
    upload.array("files", 50)(req, res, (err: any) => {
      if (err) return res.status(400).json({ error: err.message });
      const files = (req.files as Express.Multer.File[]) || [];
      if (files.length === 0)
        return res.status(400).json({ error: "No files uploaded." });

      const insert = db.prepare(
        "INSERT INTO images (filename, original_name, mimetype, size) VALUES (?, ?, ?, ?)"
      );
      const created = files.map((f) => {
        const info = insert.run(
          f.filename,
          f.originalname || f.filename,
          f.mimetype,
          f.size
        );
        const row = db
          .prepare("SELECT * FROM images WHERE id = ?")
          .get(info.lastInsertRowid);
        return toPublic(req, row);
      });
      res.json(created);
    });
  });

  // --- Rename (update the human-friendly label).
  app.patch("/api/images/:id", requireAuth, (req, res) => {
    const { original_name } = req.body || {};
    if (typeof original_name !== "string" || !original_name.trim())
      return res.status(400).json({ error: "original_name is required." });
    const info = db
      .prepare("UPDATE images SET original_name = ? WHERE id = ?")
      .run(original_name.trim(), req.params.id);
    if (info.changes === 0)
      return res.status(404).json({ error: "Image not found." });
    const row = db
      .prepare("SELECT * FROM images WHERE id = ?")
      .get(req.params.id);
    res.json(toPublic(req, row));
  });

  // --- Delete an image (record + file on disk).
  app.delete("/api/images/:id", requireAuth, (req, res) => {
    const row = db
      .prepare("SELECT * FROM images WHERE id = ?")
      .get(req.params.id) as any;
    if (!row) return res.status(404).json({ error: "Image not found." });
    db.prepare("DELETE FROM images WHERE id = ?").run(req.params.id);
    fs.promises
      .unlink(path.join(UPLOAD_DIR, row.filename))
      .catch(() => {}); // file may already be gone; the record is what matters
    res.json({ ok: true });
  });

  // --- Frontend (Vite in dev, static build in prod).
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`\n📷 Pooki CDN running on http://localhost:${PORT}`);
    console.log(`   Images served from ${UPLOAD_DIR}`);
    console.log(`   Public image path:  /cdn/<filename>\n`);
  });
}

startServer();
