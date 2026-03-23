const path = require("path");
const nodemailer = require("nodemailer");

require("dotenv").config({ path: path.resolve(__dirname, "../.env") });

let transporter;

const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const getEmailConfig = () => ({
  emailUser: process.env.EMAIL_USER?.trim(),
  emailPass: process.env.EMAIL_PASS?.trim(),
  resendApiKey: process.env.RESEND_API_KEY?.trim(),
  resendFromEmail: process.env.RESEND_FROM_EMAIL?.trim(),
});

const getTransporter = () => {
  if (transporter) {
    return transporter;
  }

  const { emailUser, emailPass } = getEmailConfig();

  transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
      user: emailUser,
      pass: emailPass,
    },
    connectionTimeout: 7000,
    greetingTimeout: 7000,
    socketTimeout: 9000,
  });

  return transporter;
};

const sendWithResend = async ({ to, subject, text, resendApiKey, resendFromEmail }) => {
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${resendApiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: resendFromEmail,
      to: [to],
      subject,
      text,
    }),
  });

  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    const error = new Error(payload?.message || "Resend API request failed");
    error.code = "EMAIL_API_FAILED";
    error.response = payload;
    throw error;
  }

  return payload;
};

const sendWithSmtp = async ({ to, subject, text, emailUser }) => {
  const mailOptions = {
    from: `"Carbon Tracker" <${emailUser}>`,
    to,
    subject,
    text,
    replyTo: emailUser,
  };

  console.log(`[Mailer] Sending SMTP email to ${to}`);
  const info = await getTransporter().sendMail(mailOptions);
  console.log(`[Mailer] SMTP email sent successfully. Message ID: ${info.messageId}`);
  return info;
};

const sendEmail = async (to, subject, text) => {
  try {
    const { emailUser, emailPass, resendApiKey, resendFromEmail } = getEmailConfig();

    if (!to || !isValidEmail(to)) {
      const validationError = new Error(`Invalid recipient email: ${to}`);
      validationError.code = "INVALID_EMAIL";
      throw validationError;
    }

    if (!subject || !text) {
      const contentError = new Error("Email subject and text are required");
      contentError.code = "MISSING_CONTENT";
      throw contentError;
    }

    if (resendApiKey && resendFromEmail) {
      console.log(`[Mailer] Using Resend API for ${to}`);
      const result = await sendWithResend({ to, subject, text, resendApiKey, resendFromEmail });
      console.log("[Mailer] Resend API email sent successfully", result);
      return result;
    }

    if (!emailUser || !emailPass) {
      const configError = new Error(
        "Email configuration is missing. Set RESEND_API_KEY and RESEND_FROM_EMAIL, or EMAIL_USER and EMAIL_PASS."
      );
      configError.code = "EMAIL_CONFIG_MISSING";
      throw configError;
    }

    return await sendWithSmtp({ to, subject, text, emailUser });
  } catch (error) {
    console.error("[Mailer] send failed", {
      code: error.code,
      message: error.message,
      response: error.response,
    });

    if (error.code === "EAUTH") {
      const authError = new Error(
        "Gmail authentication failed. Check your EMAIL_USER and EMAIL_PASS. Use an App Password, not your regular Gmail password."
      );
      authError.code = "EMAIL_AUTH_FAILED";
      throw authError;
    }

    if (error.code === "INVALID_EMAIL" || error.code === "MISSING_CONTENT" || error.code === "EMAIL_CONFIG_MISSING") {
      throw error;
    }

    if (error.code === "EMAIL_API_FAILED") {
      const apiError = new Error("Email API failed to send the message.");
      apiError.code = "EMAIL_API_FAILED";
      apiError.response = error.response;
      throw apiError;
    }

    if (
      error.code === "ENOTFOUND" ||
      error.code === "ECONNREFUSED" ||
      error.code === "ETIMEDOUT" ||
      error.code === "ESOCKET"
    ) {
      const networkError = new Error(
        "Network error: Unable to connect to mail server. On Render free tier, outbound SMTP ports may be blocked. Use a paid instance or configure RESEND_API_KEY and RESEND_FROM_EMAIL."
      );
      networkError.code = "NETWORK_ERROR";
      throw networkError;
    }

    if (error.response) {
      const smtpError = new Error(
        `Email provider error: ${typeof error.response === "string" ? error.response : JSON.stringify(error.response)}`
      );
      smtpError.code = "SMTP_ERROR";
      throw smtpError;
    }

    const genericError = new Error(`Failed to send email: ${error.message}`);
    genericError.code = "EMAIL_SEND_FAILED";
    throw genericError;
  }
};

module.exports = sendEmail;
