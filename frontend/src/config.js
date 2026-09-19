export const API_URL =
  import.meta.env.VITE_API_URL ||
  (typeof window !== "undefined" && (window.location.port === "5173" || window.location.port === "5174" || window.location.port === "5175" || window.location.port === "3000")
    ? ""
    : "http://localhost:4000");

