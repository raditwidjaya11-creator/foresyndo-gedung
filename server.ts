import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";
import fs from "fs";

dotenv.config();

const STORE_FILE = path.join(process.cwd(), "db_store.json");

// Helper to read database store from disk
function readStore() {
  try {
    if (fs.existsSync(STORE_FILE)) {
      const content = fs.readFileSync(STORE_FILE, "utf-8");
      return JSON.parse(content);
    }
  } catch (err) {
    console.error("Error reading db_store.json:", err);
  }
  return {};
}

// Helper to write database store to disk
function writeStore(store: any) {
  try {
    fs.writeFileSync(STORE_FILE, JSON.stringify(store, null, 2), "utf-8");
  } catch (err) {
    console.error("Error writing db_store.json:", err);
  }
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '10mb' }));

  // REST API endpoints for persistent key-value store (cross-device sync)
  app.get("/api/store", (req, res) => {
    res.json(readStore());
  });

  app.post("/api/store", (req, res) => {
    const { key, value } = req.body;
    if (!key) {
      return res.status(400).json({ error: "Key is required" });
    }
    const store = readStore();
    store[key] = value;
    writeStore(store);
    res.json({ success: true });
  });

  app.post("/api/store/bulk", (req, res) => {
    const { data } = req.body;
    if (!data || typeof data !== "object") {
      return res.status(400).json({ error: "Invalid data object" });
    }
    const store = readStore();
    Object.assign(store, data);
    writeStore(store);
    res.json({ success: true });
  });

  // API Route for sending email via Resend
  app.post("/api/send-email", async (req, res) => {
    const { to, subject, text, html, attachments } = req.body;

    if (!to || !subject || !text) {
      return res.status(400).json({ error: "Missing required fields: to, subject, or text" });
    }

    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      console.warn("RESEND_API_KEY is not defined in environment variables. Simulating email sending.");
      return res.json({
        success: true,
        simulated: true,
        message: "Simulated: Email prepared and drafted. (RESEND_API_KEY missing, please configure it in Settings)."
      });
    }

    try {
      const { Resend } = await import("resend");
      const resend = new Resend(apiKey);

      const formattedAttachments = attachments && Array.isArray(attachments)
        ? attachments.map((att: any) => ({
            filename: att.filename,
            content: Buffer.from(att.content, "base64"),
          }))
        : undefined;

      const data = await resend.emails.send({
        from: "Foresyndo Projects <noreply@foresyndoglobalindonesia.my.id>",
        to: [to],
        subject: subject,
        text: text,
        html: html || text.replace(/\n/g, "<br/>"),
        attachments: formattedAttachments,
      });

      return res.json({ success: true, data });
    } catch (error: any) {
      console.error("Resend API error:", error);
      return res.status(500).json({ error: error.message || "Failed to send email via Resend" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
