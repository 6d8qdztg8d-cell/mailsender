import nodemailer from 'nodemailer';
import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    const { recipient, subject, message, footer } = await req.json();

    if (!recipient || !subject || !message || !footer) {
      return NextResponse.json({ error: 'Bitte füllen Sie alle Felder aus.' }, { status: 400 });
    }

    // Configure Nodemailer transporter
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    const formatText = (text) => {
      // Split by newline and wrap in <p> tags. Respect multiple line breaks.
      return text.split('\n').map(p => {
        if (p.trim() === '') return '<div style="height: 15px;"></div>';
        return `<p style="margin: 0 0 10px 0; line-height: 1.6; color: #333333; font-size: 15px;">${p}</p>`;
      }).join('');
    };

    const renderSignature = (footerText) => {
      const lines = footerText.split('\n').map(l => l.trim()).filter(l => l !== '');
      if (lines.length < 3) {
        return lines.map(l => `<p style="margin: 0 0 4px 0; font-size: 14px; color: #111;">${l}</p>`).join('');
      }

      const greeting = lines[0];
      const name = lines[1];
      const title = lines[2];
      const rest = lines.slice(3).map(l => `<p style="margin: 0 0 2px 0; font-size: 13px; color: #555555;">${l}</p>`).join('');

      return `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
          <p style="margin: 0 0 20px 0; color: #555555; font-size: 15px;">${greeting}</p>
          <div style="margin-top: 15px; border-left: 3px solid #daff00; padding-left: 15px;">
            <p style="margin: 0 0 4px 0; font-size: 16px; font-weight: 700; color: #111111;">${name}</p>
            <p style="margin: 0 0 8px 0; font-size: 13px; color: #376616; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em;">${title}</p>
            ${rest}
          </div>
        </div>
      `;
    };

    // Construct the elegant DigitalFrame Email Layout based on new Light Theme
    const htmlTemplate = `
      <!DOCTYPE html>
      <html lang="de">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${subject}</title>
      </head>
      <body style="margin: 0; padding: 0; background-color: #ffffff; color: #111111; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px;">
          <tr>
            <td style="padding: 40px 40px 20px 40px; font-size: 15px; line-height: 1.7; color: #333333;">
              ${message}
            </td>
          </tr>
          <tr>
            <td style="padding: 0px 40px 40px 40px;">
              <div style="border-top: 2px solid #e2e2e2; width: 40px; margin: 20px 0;"></div>
              ${renderSignature(footer)}
            </td>
          </tr>
          <tr>
            <td style="padding: 30px 40px; border-top: 1px solid #eeeeee;">
              <p style="margin: 0 0 15px 0; font-size: 14px; color: #376616; font-weight: 600; text-transform: uppercase; letter-spacing: 0.1em;">DigitalFrame</p>
              <h3 style="margin: 0 0 20px 0; font-size: 20px; font-weight: 700; color: #111111; letter-spacing: -0.02em;">Websites die <span style="color: #376616;">bewegen.</span></h3>
              <table cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" bgcolor="#daff00">
                    <a href="https://www.digitalframe.ch" style="display: inline-block; padding: 12px 24px; color: #111111; text-decoration: none; font-size: 13px; font-weight: 700; letter-spacing: 0.05em; font-family: sans-serif;">PROJEKT STARTEN ➔</a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `;

    const mailOptions = {
      from: `"DigitalFrame" <${process.env.SMTP_USER}>`,
      to: recipient,
      subject: subject,
      html: htmlTemplate,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Message sent: %s', info.messageId);

    return NextResponse.json({ success: true, messageId: info.messageId });
  } catch (error) {
    console.error('Error sending email:', error);
    return NextResponse.json({ error: 'Ein Fehler ist aufgetreten: ' + error.message }, { status: 500 });
  }
}
