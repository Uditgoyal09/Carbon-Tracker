// Test OTP sending through actual API
const BASE_URL = "https://carbon-tracker-1-xqwt.onrender.com";

async function testOtpSending() {
  console.log("=== Testing OTP Endpoint ===");
  const testEmail = `testuser${Date.now()}@example.com`;
  
  try {
    console.log(`Sending OTP to: ${testEmail}`);
    const response = await fetch(`${BASE_URL}/api/auth/send-otp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: testEmail })
    });
    
    const data = await response.json();
    console.log(`Status: ${response.status}`);
    console.log("Response:", JSON.stringify(data, null, 2));
    
    if (response.status === 200) {
      console.log("\n✅ OTP was sent successfully!");
      console.log(`Check your email (${testEmail}) for the OTP.`);
    }
  } catch (error) {
    console.error("❌ Error testing OTP:", error.message);
  }
}

testOtpSending();
