const path = require("path");
const nodemailer = require("nodemailer");

require("dotenv").config({ path: path.resolve(__dirname, "../.env") });

let transporter;

// Email validation regex
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const getEmailConfig = () => ({
  emailUser: process.env.EMAIL_USER?.trim(),
  emailPass: process.env.EMAIL_PASS?.trim(),
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
    connectionTimeout: 15000,
    greetingTimeout: 15000,
    socketTimeout: 20000,
  });

  return transporter;
};

const sendEmail = async (to, subject, text) => {
  try {
    const { emailUser, emailPass } = getEmailConfig();

    // Validate email configuration before opening an SMTP connection.
    if (!emailUser || !emailPass) {
      const configError = new Error("Email configuration is missing. Set EMAIL_USER and EMAIL_PASS in .env file");
      configError.code = "EMAIL_CONFIG_MISSING";
      console.error("Configuration Error:", configError.message);
      throw configError;
    }

    if (!to || !isValidEmail(to)) {
      const validationError = new Error(`Invalid recipient email: ${to}`);
      validationError.code = "INVALID_EMAIL";
      console.error("Email Validation Error:", validationError.message);
      throw validationError;
    }

    if (!subject || !text) {
      const contentError = new Error("Email subject and text are required");
      contentError.code = "MISSING_CONTENT";
      console.error("Content Error:", contentError.message);
      throw contentError;
    }

    const mailOptions = {
      from: `"Carbon Tracker" <${emailUser}>`,
      to,
      subject,
      text,
      replyTo: emailUser,
    };

    console.log(`Sending email to: ${to}`);
    const info = await getTransporter().sendMail(mailOptions);
    console.log(`Email sent successfully. Message ID: ${info.messageId}`);
    return info;
  } catch (error) {
    if (error.code === "EAUTH") {
      console.error("Authentication Error: Gmail rejected the login");
      const authError = new Error("Gmail authentication failed. Check your EMAIL_USER and EMAIL_PASS. Use an App Password, not your regular Gmail password.");
      authError.code = "EMAIL_AUTH_FAILED";
      throw authError;
    }

    if (error.code === "INVALID_EMAIL" || error.code === "MISSING_CONTENT" || error.code === "EMAIL_CONFIG_MISSING") {
      throw error;
    }

    if (
      error.code === "ENOTFOUND" ||
      error.code === "ECONNREFUSED" ||
      error.code === "ETIMEDOUT" ||
      error.code === "ESOCKET"
    ) {
      console.error("Network Error: Could not connect to Gmail SMTP server");
      const networkError = new Error("Network error: Unable to connect to mail server. Please try again later.");
      networkError.code = "NETWORK_ERROR";
      throw networkError;
    }

    if (error.response) {
      console.error("SMTP Error:", error.response);
      const smtpError = new Error(`SMTP Server Error: ${error.response}`);
      smtpError.code = "SMTP_ERROR";
      throw smtpError;
    }

    console.error("Unexpected Email Error:", error.message);
    const genericError = new Error(`Failed to send email: ${error.message}`);
    genericError.code = "EMAIL_SEND_FAILED";
    throw genericError;
  }
};

module.exports = sendEmail;
