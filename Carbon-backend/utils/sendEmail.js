const nodemailer = require("nodemailer");

const emailUser = process.env.EMAIL_USER?.trim();
const emailPass = process.env.EMAIL_PASS?.trim();

// Email validation regex
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Create reusable transporter using Gmail SMTP
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: emailUser,
    pass: emailPass
  }
});

// Verify transporter on startup
transporter.verify((error, success) => {
  if (error) {
    console.error("❌ Email transporter error:", error.message);
  } else {
    console.log("✅ Email transporter is ready");
  }
});

const sendEmail = async (to, subject, text) => {
  try {
    // Validate email configuration
    if (!emailUser || !emailPass) {
      const configError = new Error("Email configuration is missing. Set EMAIL_USER and EMAIL_PASS in .env file");
      configError.code = "EMAIL_CONFIG_MISSING";
      console.error("❌ Configuration Error:", configError.message);
      throw configError;
    }

    // Validate recipient email
    if (!to || !isValidEmail(to)) {
      const validationError = new Error(`Invalid recipient email: ${to}`);
      validationError.code = "INVALID_EMAIL";
      console.error("❌ Email Validation Error:", validationError.message);
      throw validationError;
    }

    // Validate subject and text
    if (!subject || !text) {
      const contentError = new Error("Email subject and text are required");
      contentError.code = "MISSING_CONTENT";
      console.error("❌ Content Error:", contentError.message);
      throw contentError;
    }

    const mailOptions = {
      from: `"Carbon Tracker" <${emailUser}>`,
      to,
      subject,
      text,
      replyTo: emailUser
    };

    console.log(`📧 Sending email to: ${to}`);
    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ Email sent successfully. Message ID: ${info.messageId}`);
    return info;
  } catch (error) {
    // Handle specific error codes
    if (error.code === "EAUTH") {
      console.error("❌ Authentication Error: Gmail rejected the login");
      const authError = new Error("Gmail authentication failed. Check your EMAIL_USER and EMAIL_PASS. Use an App Password, not your regular Gmail password.");
      authError.code = "EMAIL_AUTH_FAILED";
      throw authError;
    } else if (error.code === "INVALID_EMAIL") {
      console.error("❌ Validation Error:", error.message);
      throw error;
    } else if (error.code === "MISSING_CONTENT") {
      console.error("❌ Content Error:", error.message);
      throw error;
    } else if (error.code === "EMAIL_CONFIG_MISSING") {
      console.error("❌ Configuration Error:", error.message);
      throw error;
    } else if (error.code === "ENOTFOUND" || error.code === "ECONNREFUSED") {
      console.error("❌ Network Error: Could not connect to Gmail SMTP server");
      const networkError = new Error("Network error: Unable to connect to mail server. Please try again later.");
      networkError.code = "NETWORK_ERROR";
      throw networkError;
    } else if (error.response) {
      // SMTP error response
      console.error("❌ SMTP Error:", error.response);
      const smtpError = new Error(`SMTP Server Error: ${error.response}`);
      smtpError.code = "SMTP_ERROR";
      throw smtpError;
    } else {
      // Generic error
      console.error("❌ Unexpected Email Error:", error.message);
      const genericError = new Error(`Failed to send email: ${error.message}`);
      genericError.code = "EMAIL_SEND_FAILED";
      throw genericError;
    }
  }
};

module.exports = sendEmail;
