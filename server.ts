import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";
import { Resend } from "resend";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  const resend = new Resend(process.env.RESEND_API_KEY);

  app.use(express.json());

  // API Route for sending status emails
  app.post("/api/send-status-email", async (req, res) => {
    console.log("Received email request:", req.body);
    const { email, customerName, orderId, status, artist, track } = req.body;

    if (!process.env.RESEND_API_KEY) {
      console.error("RESEND_API_KEY is missing in environment variables");
      return res.status(500).json({ error: "Email service not configured" });
    }

    try {
      let subject = `Opdatering på din ordre ${orderId}`;
      let html = "";

      console.log(`Preparing email for status: ${status} to ${email}`);
      // --- REDIGER E-MAIL SKABELONER HERUNDER ---
      const dashboardUrl = "https://coverbywind.dk"; // Opdater dette hvis din URL ændrer sig
      const buttonStyle = "display: inline-block; background: #a855f7; color: #ffffff; padding: 12px 25px; text-decoration: none; border-radius: 10px; font-weight: bold; margin-top: 20px;";
      
      switch (status) {
        case "Afventer":
          subject = `Vi har modtaget din bestilling (${orderId})`;
          html = `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; background: #050505; color: #ffffff; padding: 40px; border-radius: 20px; border: 1px solid #333;">
              <h2 style="color: #a855f7;">Bestilling modtaget!</h2>
              <p>Hej ${customerName}, vi har modtaget din bestilling på <strong>${artist} - ${track}</strong>.</p>
              <p>Vi kigger på den hurtigst muligt. Du kan følge status direkte på dit dashboard.</p>
              <p style="background: rgba(168, 85, 247, 0.1); padding: 20px; border-radius: 10px; border: 1px solid rgba(168, 85, 247, 0.2);">
                Forventet leveringstid er op til 5 hverdage.
              </p>
              <a href="${dashboardUrl}" style="${buttonStyle}">Se dashboard</a>
              <p style="margin-top: 30px; font-size: 12px; color: #666;">Hilsen,<br>CoverByWind.dk-teamet</p>
            </div>
          `;
          break;
        case "Afventer betaling":
          subject = `Vi afventer betaling for din ordre ${orderId}`;
          html = `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; background: #050505; color: #ffffff; padding: 40px; border-radius: 20px; border: 1px solid #333;">
              <h2 style="color: #f59e0b;">Hej ${customerName}</h2>
              <p>Vi har modtaget din bestilling på <strong>${artist} - ${track}</strong>.</p>
              <p>Vi afventer dog betaling, før vi kan gå i gang med dit cover.</p>
              <p style="background: rgba(245, 158, 11, 0.1); padding: 20px; border-radius: 10px; border: 1px solid rgba(245, 158, 11, 0.2);">
                Betaling skal ske via MobilePay. Se detaljer i chatten på din profil.
              </p>
              <a href="${dashboardUrl}" style="${buttonStyle}">Gå til chat</a>
              <p style="margin-top: 30px; font-size: 12px; color: #666;">Hilsen,<br>CoverByWind.dk-teamet</p>
            </div>
          `;
          break;
        case "I gang":
          subject = `Vi er nu i gang med dit cover! (${orderId})`;
          html = `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; background: #050505; color: #ffffff; padding: 40px; border-radius: 20px; border: 1px solid #333;">
              <h2 style="color: #f97316;">Godt nyt, ${customerName}!</h2>
              <p>Vi er nu gået i gang med at designe dit cover til <strong>${artist} - ${track}</strong>.</p>
              <p>Du kan følge med i hele processen på dit dashboard.</p>
              <a href="${dashboardUrl}" style="${buttonStyle}">Se dashboard</a>
              <p style="margin-top: 30px; font-size: 12px; color: #666;">Hilsen,<br>CoverByWind.dk-teamet</p>
            </div>
          `;
          break;
        case "Gennemført":
          subject = `Dit cover er klar! (${orderId})`;
          html = `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; background: #050505; color: #ffffff; padding: 40px; border-radius: 20px; border: 1px solid #333;">
              <h2 style="color: #22c55e;">Dit cover er færdigt!</h2>
              <p>Hej ${customerName}, dit cover til <strong>${artist} - ${track}</strong> er nu færdigt og klart til download.</p>
              <p style="background: rgba(34, 197, 94, 0.1); padding: 20px; border-radius: 10px; border: 1px solid rgba(34, 197, 94, 0.2);">
                Log ind på din profil nu for at hente det færdige resultat.
              </p>
              <a href="${dashboardUrl}" style="${buttonStyle}; background: #22c55e;">Download nu</a>
              <p style="margin-top: 30px; font-size: 12px; color: #666;">Hilsen,<br>CoverByWind.dk-teamet</p>
            </div>
          `;
          break;
        case "Annulleret":
          subject = `Din ordre er blevet annulleret (${orderId})`;
          html = `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; background: #050505; color: #ffffff; padding: 40px; border-radius: 20px; border: 1px solid #333;">
              <h2 style="color: #ef4444;">Ordre annulleret</h2>
              <p>Hej ${customerName}, din ordre <strong>${orderId}</strong> er desværre blevet annulleret.</p>
              <p>Kontakt os venligst i chatten, hvis du har spørgsmål til din bestilling.</p>
              <a href="${dashboardUrl}" style="${buttonStyle}; background: #333;">Besøg portalen</a>
              <p style="margin-top: 30px; font-size: 12px; color: #666;">Hilsen,<br>CoverByWind.dk-teamet</p>
            </div>
          `;
          break;
        default:
          html = `<div style="font-family: sans-serif; padding: 20px; color: #fff; background: #000;"><p>Status på din ordre ${orderId} er nu: ${status}</p><a href="${dashboardUrl}" style="${buttonStyle}">Se dashboard</a></div>`;
      }
      // --- SLUT PÅ E-MAIL SKABELONER ---

      console.log("Sending email via Resend...");
      const { data, error } = await resend.emails.send({
        from: "CoverByWind.dk <noreply@coverbywind.dk>", 
        to: [email],
        subject: subject,
        html: html,
      });

      if (error) {
        console.error("Resend error details:", error);
        return res.status(400).json({ error });
      }

      console.log("Email sent successfully according to Resend:", data);
      res.status(200).json({ message: "Email sent successfully", data });
    } catch (err) {
      console.error("Error sending email:", err);
      res.status(500).json({ error: "Failed to send email" });
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
