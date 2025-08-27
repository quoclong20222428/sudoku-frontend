import axios from "axios";

const baseURL =
  import.meta.env.MODE === "development"
    ? "http://localhost:8000"
    : import.meta.env.VITE_API_BASE_URL;

console.log("🌍 API Base URL:", baseURL);

export const api = axios.create({ baseURL });