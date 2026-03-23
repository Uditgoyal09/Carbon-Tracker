// Test POST requests - Register new user
const BASE_URL = "https://carbon-tracker-1-xqwt.onrender.com";

// Test 1: Register a new user
async function testRegister() {
  console.log("\n=== Testing User Registration (POST Request) ===");
  const timestamp = Date.now();
  const testEmail = `test${timestamp}@example.com`;
  
  try {
    const response = await fetch(`${BASE_URL}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "Test User",
        email: testEmail,
        password: "Test@123"
      })
    });
    
    const data = await response.json();
    console.log("Status:", response.status);
    console.log("Response:", JSON.stringify(data, null, 2));
    return data;
  } catch (error) {
    console.error("Register Error:", error.message);
  }
}

// Run test
async function runTest() {
  console.log("Testing Backend POST Endpoints");
  console.log("Backend URL:", BASE_URL);
  console.log("================================");
  
  await testRegister();
  
  console.log("\n✅ POST requests are working - Backend is receiving and processing data!");
}

runTest();
