import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { email, customerName } = req.body;
  if (!email) return res.status(400).json({ error: "Email mangler" });

  try {
    const { data, error } = await resend.emails.send({
      from: "CoverByWind.dk <noreply@coverbywind.dk>",
      to: [email],
      subject: "Ny besked fra CoverByWind",
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; background-color: #f8fafc; padding: 40px 20px;">
          <div style="background-color: #ffffff; border-radius: 16px; padding: 40px; text-align: center; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);">
            <h1 style="color: #0f172a; font-size: 24px; margin-bottom: 20px;">Hej ${customerName || 'kunde'}</h1>
            <p style="color: #64748b; font-size: 16px; line-height: 1.6; margin-bottom: 30px;">
              Du har modtaget en ny besked fra CoverByWind. Åben din kundeside for at læse den og besvare.
            </p>
            <a href="https://coverbywind.dk/login" style="display: inline-block; background-color: #10b981; color: #ffffff; padding: 14px 30px; text-decoration: none; border-radius: 99px; font-weight: 600; font-size: 16px;">
              Gå til Kundeside
            </a>
          </div>
          <div style="text-align: center; margin-top: 20px; color: #94a3b8; font-size: 12px;">
            &copy; 2024 CoverByWind.dk
          </div>
        </div>
      `,
    });

    if (error) throw error;

    return res.status(200).json({ message: "Notifikation sendt" });
  } catch (err: any) {
    console.error("Email error:", err);
    return res.status(500).json({ error: "Kunne ikke sende mail", details: err.message });
  }
}
