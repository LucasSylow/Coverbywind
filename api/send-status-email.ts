import { Resend } from "resend";
import type { VercelRequest, VercelResponse } from "@vercel/node";

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Kun tillad POST requests
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { email, customerName, orderId, status, artist, track } = req.body;

  if (!process.env.RESEND_API_KEY) {
    return res.status(500).json({ error: "Email service not configured (API key missing)" });
  }

  try {
    let subject = `Opdatering på din ordre ${orderId}`;
    let html = "";    const dashboardUrl = "https://coverbywind.dk";
    const primaryGreen = "#10b981";
    const lightGreen = "#f0fdf4";
    const darkText = "#0f172a";
    const lightText = "#64748b";
    const shadow = "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)";

    const containerStyle = `font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f8fafc; padding: 40px 20px; color: ${darkText};`;
    const cardStyle = `max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: ${shadow};`;
    const headerStyle = `padding: 30px; text-align: center; border-bottom: 1px solid #f1f5f9;`;
    const bannerStyle = `background-color: ${lightGreen}; padding: 40px 30px; text-align: center;`;
    const bodyStyle = `padding: 40px 30px; text-align: center;`;
    const footerStyle = `padding: 30px; text-align: center; font-size: 14px; color: ${lightText}; border-top: 1px solid #f1f5f9;`;
    const buttonStyle = `display: inline-block; background-color: ${primaryGreen}; color: #ffffff; padding: 14px 30px; text-decoration: none; border-radius: 99px; font-weight: 600; margin-top: 10px; font-size: 16px;`;

    const getBaseTemplate = (title: string, message: string, buttonText: string, accentColor = primaryGreen) => `
      <div style="${containerStyle}">
        <div style="${cardStyle}">
          <div style="${headerStyle}">
            <h1 style="margin: 0; font-size: 20px; letter-spacing: -0.5px; color: ${darkText};">CoverByWind</h1>
          </div>
          <div style="${bannerStyle}">
            <h2 style="margin: 0 0 10px 0; font-size: 28px; font-weight: 800; color: ${darkText};">${title}</h2>
            <p style="margin: 0; font-size: 16px; color: ${lightText};">${customerName}, tak for din bestilling!</p>
          </div>
          <div style="${bodyStyle}">
            <p style="margin: 0 0 25px 0; font-size: 16px; line-height: 1.6; color: ${lightText};">${message}</p>
            <div style="margin-bottom: 30px;">
              <p style="margin: 0 0 5px 0; font-size: 14px; font-weight: 600; text-transform: uppercase; color: ${lightText}; letter-spacing: 1px;">Ordre Oversigt</p>
              <p style="margin: 0; font-size: 18px; font-weight: 700; color: ${darkText};">${artist} - ${track}</p>
            </div>
            <a href="${dashboardUrl}" style="${buttonStyle}; background-color: ${accentColor};">${buttonText}</a>
          </div>
          <div style="${footerStyle}">
            <p style="margin: 0;">&copy; 2024 CoverByWind.dk</p>
          </div>
        </div>
      </div>
    `;

    switch (status) {
      case "Afventer":
        subject = `Vi har modtaget din bestilling (${orderId})`;
        html = getBaseTemplate(
          "Ordre Bekræftelse",
          "Vi har modtaget din ordre og kontakter dig så snart vi går i gang. Du kan finde din købsinformation herunder.",
          "Gå til Dashboard"
        );
        break;
      case "Afventer betaling":
        subject = `Afventer betaling for ${orderId}`;
        html = getBaseTemplate(
          "Betaling Mangler",
          "Vi har modtaget din bestilling, men vi mangler din betaling via MobilePay før vi kan starte designprocessen.",
          "Gå til Betaling",
          "#f59e0b"
        );
        break;
      case "I gang":
        subject = `Vi arbejder på dit cover! (${orderId})`;
        html = getBaseTemplate(
          "Vi er i gang",
          "Godt nyt! Vi er nu i fuld gang med at designe dit unikke cover. Følg processen live på dit dashboard.",
          "Se Status",
          "#3b82f6"
        );
        break;
      case "Gennemført":
        subject = `Dit cover er klar til download! (${orderId})`;
        html = getBaseTemplate(
          "Ordre Fuldført",
          "Dit nye cover er færdigt! Du kan nu downloade det i høj kvalitet direkte fra din profil.",
          "Download Nu"
        );
        break;
      case "Annulleret":
        subject = `Din ordre er annulleret (${orderId})`;
        html = getBaseTemplate(
          "Ordre Annulleret",
          "Din ordre er desværre blevet annulleret. Hvis du har spørgsmål, er du velkommen til at kontakte os i chatten.",
          "Kontakt Support",
          "#ef4444"
        );
        break;
      default:
        html = getBaseTemplate(
          "Status Opdatering",
          `Status på din ordre er nu opdateret til: <strong>${status}</strong>.`,
          "Se Dashboard"
        );
    }

    const { data, error } = await resend.emails.send({
      from: "CoverByWind.dk <noreply@coverbywind.dk>",
      to: [email],
      subject: subject,
      html: html,
    });

    if (error) {
      return res.status(400).json({ error });
    }

    return res.status(200).json({ message: "Email sent successfully", data });
  } catch (err: any) {
    return res.status(500).json({ error: "Failed to send email", details: err.message });
  }
}
