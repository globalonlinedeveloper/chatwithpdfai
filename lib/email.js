// =================================================================
// SMTP sender via Hostinger mail server.
// Reads from process.env (set in Hostinger Environment variables).
// =================================================================

import nodemailer from 'nodemailer';

let transporter;

export function getTransporter() {
  if (!transporter) {
    const {
      SMTP_HOST = 'smtp.hostinger.com',
      SMTP_PORT = '465',
      SMTP_SECURE = 'true',
      SMTP_USER,
      SMTP_PASSWORD,
    } = process.env;

    if (!SMTP_USER || !SMTP_PASSWORD) {
      throw new Error('SMTP env vars missing: SMTP_USER and SMTP_PASSWORD required.');
    }

    transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: Number(SMTP_PORT),
      secure: String(SMTP_SECURE).toLowerCase() === 'true',
      auth: {
        user: SMTP_USER,
        pass: SMTP_PASSWORD,
      },
    });
  }
  return transporter;
}

export async function sendMail({ to, subject, text, html, replyTo }) {
  const from = process.env.SMTP_FROM || `CHATWITHPDFAI <${process.env.SMTP_USER}>`;
  return getTransporter().sendMail({ from, to, subject, text, html, replyTo });
}
