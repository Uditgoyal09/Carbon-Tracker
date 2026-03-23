// Send OTP to jaiswalsrijan91@gmail.com
const BASE_URL = "https://carbon-tracker-1-xqwt.onrender.com";

async function sendOtp() {
  try {
    const response = await fetch(`${BASE_URL}/api/auth/send-otp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "jaiswalsrijan91@gmail.com" })
    });
    
    const data = await response.json();
    console.log("Status:", response.status);
    console.log("Response:", JSON.stringify(data, null, 2));
    
    if (response.status === 200) {
      console.log("\n✅ OTP sent successfully to jaiswalsrijan91@gmail.com!");
    }
  } catch (error) {
    console.error("Error:", error.message);
  }
}

sendOtp();
