import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";
import fs from "fs";
import { createClient } from "@supabase/supabase-js";

dotenv.config();

const STORE_FILE = path.join(process.cwd(), "db_store.json");

const supabaseUrl = process.env.VITE_SUPABASE_URL || "https://xhikheavlrgpidnxrnpr.supabase.co/";
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || "sb_publishable_0rMWELXhxpM7Ms1r0twRWQ_REJ3gDUi";

// Initialize Supabase client
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Helper to read database store from disk (local fallback)
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

// Try to sync key-value store with Supabase
async function fetchAllFromSupabase(): Promise<Record<string, any> | null> {
  try {
    const { data, error } = await supabase
      .from("sppi_store")
      .select("key, value");

    if (error) {
      // Table might not exist or auth failed
      console.warn("Supabase fetch failed (table might not exist yet):", error.message);
      return null;
    }

    const store: Record<string, any> = {};
    if (data) {
      data.forEach((row: any) => {
        store[row.key] = row.value;
      });
    }
    return store;
  } catch (err) {
    console.error("Supabase connection error:", err);
    return null;
  }
}

async function upsertToSupabase(key: string, value: any) {
  try {
    const { error } = await supabase
      .from("sppi_store")
      .upsert({ key, value, updated_at: new Date().toISOString() }, { onConflict: "key" });

    if (error) {
      console.warn(`Supabase upsert failed for key ${key}:`, error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.error(`Supabase connection error on upsert for key ${key}:`, err);
    return false;
  }
}

async function upsertBulkToSupabase(data: Record<string, any>) {
  try {
    const rows = Object.entries(data).map(([key, value]) => ({
      key,
      value,
      updated_at: new Date().toISOString()
    }));

    if (rows.length === 0) return true;

    const { error } = await supabase
      .from("sppi_store")
      .upsert(rows, { onConflict: "key" });

    if (error) {
      console.warn("Supabase bulk upsert failed:", error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.error("Supabase connection error on bulk upsert:", err);
    return false;
  }
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '10mb' }));

  // Status check endpoint for Supabase connection
  app.get("/api/supabase-status", async (req, res) => {
    try {
      const { error } = await supabase.from("sppi_store").select("key").limit(1);
      if (error) {
        if (error.code === "PGRST116" || error.code === "42P01") {
          return res.json({
            connected: true,
            tableExists: false,
            url: supabaseUrl,
            message: "Terhubung ke Supabase! Namun tabel 'sppi_store' belum dibuat. Gunakan petunjuk SQL untuk menginisialisasinya."
          });
        }
        return res.json({
          connected: false,
          tableExists: false,
          url: supabaseUrl,
          message: `Gagal terhubung: ${error.message}`
        });
      }
      return res.json({
        connected: true,
        tableExists: true,
        url: supabaseUrl,
        message: "Supabase terhubung sepenuhnya dan siap sinkronisasi!"
      });
    } catch (err: any) {
      res.json({
        connected: false,
        tableExists: false,
        url: supabaseUrl,
        message: `Koneksi error: ${err?.message || err}`
      });
    }
  });

  // REST API endpoints for persistent key-value store (cross-device sync)
  app.get("/api/store", async (req, res) => {
    // 1. Try to read from Supabase
    const supabaseStore = await fetchAllFromSupabase();
    
    // 2. Read local disk store
    const localStore = readStore();

    if (supabaseStore) {
      // Merge: Let Supabase values override local fallback, but preserve local keys if Supabase lacks them
      const mergedStore = { ...localStore, ...supabaseStore };
      // Keep local store file in sync
      writeStore(mergedStore);
      return res.json(mergedStore);
    }

    // Fallback to local store if Supabase not configured/available
    res.json(localStore);
  });

  app.post("/api/store", async (req, res) => {
    const { key, value } = req.body;
    if (!key) {
      return res.status(400).json({ error: "Key is required" });
    }

    // 1. Write to local fallback
    const store = readStore();
    store[key] = value;
    writeStore(store);

    // 2. Try saving to Supabase
    const supabaseSuccess = await upsertToSupabase(key, value);

    res.json({ 
      success: true, 
      supabaseSynced: supabaseSuccess,
      storage: supabaseSuccess ? "supabase" : "local_disk"
    });
  });

  app.post("/api/store/bulk", async (req, res) => {
    const { data } = req.body;
    if (!data || typeof data !== "object") {
      return res.status(400).json({ error: "Invalid data object" });
    }

    // 1. Write to local fallback
    const store = readStore();
    Object.assign(store, data);
    writeStore(store);

    // 2. Try saving to Supabase
    const supabaseSuccess = await upsertBulkToSupabase(data);

    res.json({ 
      success: true, 
      supabaseSynced: supabaseSuccess,
      storage: supabaseSuccess ? "supabase" : "local_disk"
    });
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
