import type { VercelRequest, VercelResponse } from "@vercel/node";
import { Resend } from "resend";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS configuration
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS,PATCH,DELETE,POST,PUT");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version"
  );

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed. Use POST." });
  }

  const { to, subject, text, html, attachments } = req.body;

  if (!to || !subject || !text) {
    return res.status(400).json({ error: "Missing required fields: to, subject, or text" });
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.warn("RESEND_API_KEY is not defined in Vercel environment variables. Simulating email sending.");
    return res.json({
      success: true,
      simulated: true,
      message: "Simulated: Email prepared and drafted. (RESEND_API_KEY missing on Vercel, please configure it in Vercel Project Settings)."
    });
  }

  try {
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
    console.error("Resend Vercel API error:", error);
    return res.status(500).json({ error: error.message || "Failed to send email via Resend on Vercel" });
  }
}
