const nodemailer = require("nodemailer");

const emailUser = process.env.EMAIL_USER?.trim();
const emailPass = process.env.EMAIL_PASS?.trim();

// Create reusable transporter using Gmail SMTP
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: emailUser,
    pass: emailPass
  }
});


const sendEmail = async (to, subject, text) => {
  try {
    if (!emailUser || !emailPass) {
      const configError = new Error("Email configuration is missing. Set EMAIL_USER and EMAIL_PASS in Carbon-backend/.env");
      configError.code = "EMAIL_CONFIG_MISSING";
      throw configError;
    }

    const mailOptions = {
      from: `"Carbon Tracker" <${emailUser}>`,
      to,
      subject,
      text
    };

    const info = await transporter.sendMail(mailOptions);
    return info;
  } catch (error) {
    if (error.code === "EAUTH") {
      console.error("Email sending failed: Gmail rejected the login. Check EMAIL_USER, EMAIL_PASS, and whether EMAIL_PASS is an App Password.");
      const authError = new Error("OTP email could not be sent. Gmail rejected the login. Update EMAIL_USER and EMAIL_PASS with a valid Gmail App Password.");
      authError.code = "EMAIL_AUTH_FAILED";
      throw authError;
    } else {
      console.error("Email sending failed:", error.message);
    }
    throw error;
  }
};

module.exports = sendEmail;
