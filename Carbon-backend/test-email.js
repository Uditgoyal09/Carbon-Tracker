// Diagnostic test for email sending
const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, ".env") });
const nodemailer = require("nodemailer");

const emailUser = process.env.EMAIL_USER?.trim();
const emailPass = process.env.EMAIL_PASS?.trim();

console.log("=== Email Configuration Check ===");
console.log("EMAIL_USER:", emailUser ? "✓ Set" : "✗ Missing");
console.log("EMAIL_PASS:", emailPass ? "✓ Set" : "✗ Missing");
console.log("");

if (!emailUser || !emailPass) {
  console.error("❌ Email credentials are missing in .env");
  process.exit(1);
}

// Test transporter
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: emailUser,
    pass: emailPass
  },
  connectionTimeout: 15000,
  greetingTimeout: 15000,
  socketTimeout: 20000
});

// Verify transporter
transporter.verify((error, success) => {
  if (error) {
    console.error("❌ Email Configuration Failed:");
    console.error("Error:", error.message);
    console.error("Code:", error.code);
    console.log("\n📋 Troubleshooting:");
    console.log("1. Ensure 2-Step Verification is enabled on Gmail");
    console.log("2. Generate an App Password: https://myaccount.google.com/apppasswords");
    console.log("3. Use the 16-character password (remove spaces)");
    console.log("4. Update EMAIL_PASS in .env");
  } else {
    console.log("✅ Email Configuration is Valid!");
    console.log("Nodemailer is ready to send emails.");
    
    // Test sending
    const testEmail = {
      from: `"Carbon Tracker" <${emailUser}>`,
      to: emailUser, // Send to yourself for testing
      subject: "Carbon Tracker - OTP Test",
      text: "This is a test OTP: 123456\n\nIf you received this, email is working!"
    };
    
    transporter.sendMail(testEmail, (error, info) => {
      if (error) {
        console.error("❌ Failed to send test email:", error.message);
      } else {
        console.log("✅ Test email sent successfully!");
        console.log("Response:", info.response);
      }
    });
  }
});
