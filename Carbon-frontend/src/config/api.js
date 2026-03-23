const PROD_API_BASE_URL = "https://carbon-tracker-1-xqwt.onrender.com";

const isLocalHost =
  typeof window !== "undefined" &&
  /^(localhost|127\.0\.0\.1)$/i.test(window.location.hostname);

const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  (isLocalHost ? "http://localhost:3000" : PROD_API_BASE_URL);

export const API_TIMEOUT_MS = 10000;

export default API_BASE_URL;
