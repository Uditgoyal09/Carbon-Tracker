const PROD_API_BASE_URL = "https://carbon-tracker-1-xqwt.onrender.com";

const isLocalHost =
  typeof window !== "undefined" &&
  /^(localhost|127\.0\.0\.1)$/i.test(window.location.hostname);

const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  (isLocalHost ? "http://localhost:3000" : PROD_API_BASE_URL);

export const API_TIMEOUT_MS = 15000;
export const OTP_TIMEOUT_MS = 0;
export const API_WARMUP_TIMEOUT_MS = 25000;

let lastWarmupAt = 0;
let warmupPromise = null;

export const warmUpApi = async () => {
  if (isLocalHost) {
    return;
  }

  const now = Date.now();
  if (now - lastWarmupAt < 60000) {
    return;
  }

  if (!warmupPromise) {
    warmupPromise = fetch(`${API_BASE_URL}/healthz`, {
      method: "GET",
    })
      .then(() => {
        lastWarmupAt = Date.now();
      })
      .catch((error) => {
        console.error("[API] Warmup failed", error);
      })
      .finally(() => {
        warmupPromise = null;
      });
  }

  await warmupPromise;
};

export default API_BASE_URL;
