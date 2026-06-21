import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '10mb' }));

  // API Route for sending email via Resend
  app.post("/api/send-email", async (req, res) => {
    const { to, subject, text, html } = req.body;

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
      const data = await resend.emails.send({
        from: "Foresyndo Projects <noreply@foresyndoglobalindonesia.my.id>",
        to: [to],
        subject: subject,
        text: text,
        html: html || text.replace(/\n/g, "<br/>"),
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
