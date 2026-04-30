import nodemailer from "nodemailer";

let transporter = null;

function getMailerConfig() {
  const user = process.env.MAIL_USER || process.env.GMAIL_USER;
  const pass = process.env.MAIL_PASS || process.env.GMAIL_APP_PASSWORD;

  if (!user || !pass) {
    return null;
  }

  return {
    service: "gmail",
    auth: { user, pass },
  };
}

export function getMailer() {
  if (transporter) return transporter;

  const config = getMailerConfig();
  if (!config) {
    throw new Error("MAIL_USER/MAIL_PASS or GMAIL_USER/GMAIL_APP_PASSWORD is not configured");
  }

  transporter = nodemailer.createTransport(config);
  return transporter;
}

export async function sendMailAsync({ to, subject, html, text }) {
  const mailer = getMailer();
  const from = process.env.MAIL_FROM || process.env.MAIL_USER || process.env.GMAIL_USER;

  return mailer.sendMail({
    from,
    to,
    subject,
    html,
    text,
  });
}

export async function verifyMailer() {
  try {
    await getMailer().verify();
    console.log("Mailer ready");
  } catch (err) {
    console.warn("Mailer unavailable:", err.message);
  }
}
