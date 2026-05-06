import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { type, customerName, details } = req.body;

  if (!process.env.RESEND_API_KEY) {
    console.error("RESEND_API_KEY is missing in environment variables");
    return res.status(500).json({ error: "Email service not configured" });
  }

  try {
    let subject = "Ny notifikation";
    let html = "";
    const adminEmail = "lucas.foss.sylow@gmail.com";

    if (type === "new_order") {
      subject = `Ny ordre fra ${customerName}`;
      html = `
        <div style="font-family: sans-serif; padding: 20px; background: #f9f9f9; color: #333; border: 1px solid #eee; border-radius: 8px;">
          <h2 style="color: #a855f7;">Ny Ordre!</h2>
          <p><strong>Kunde:</strong> ${customerName}</p>
          <p><strong>Detaljer:</strong> ${details}</p>
          <br/>
          <p>Tjek admin panelet for at se ordren.</p>
        </div>
      `;
    } else if (type === "new_message") {
      subject = `Ny besked fra ${customerName}`;
      html = `
        <div style="font-family: sans-serif; padding: 20px; background: #f9f9f9; color: #333; border: 1px solid #eee; border-radius: 8px;">
          <h2 style="color: #3b82f6;">Ny Besked!</h2>
          <p><strong>Kunde:</strong> ${customerName}</p>
          <p><strong>Besked:</strong> ${details}</p>
          <br/>
          <p>Tjek admin panelet for at svare.</p>
        </div>
      `;
    }

    const { data, error } = await resend.emails.send({
      from: "CoverByWind System <noreply@coverbywind.dk>",
      to: [adminEmail],
      subject: subject,
      html: html,
    });

    if (error) {
      console.error("Resend error details (admin):", error);
      return res.status(400).json({ error });
    }

    return res.status(200).json({ message: "Admin notification sent", data });
  } catch (err: any) {
    console.error("Error sending admin email:", err);
    return res.status(500).json({ error: "Failed to send admin email", details: err.message });
  }
}
