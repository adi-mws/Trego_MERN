import nodemailer from "nodemailer";
import { logger } from "./logger.js";

if (!process.env.MAIL_USER || !process.env.MAIL_PASS) {
  throw new Error("MAIL_USER / MAIL_PASS missing");
}

export const mailer = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
});

mailer.verify()
  .then(() => logger.info("Mailer ready"))
  .catch(err => logger.error("Mailer error", err));
