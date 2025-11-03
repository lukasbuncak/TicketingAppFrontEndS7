import axios from "axios";
import urls from "./urls"; // keep if you already have this file

const client = axios.create({
  baseURL: import.meta?.env?.VITE_API_URL ?? urls?.base_url ?? "/api",
  withCredentials: true,
  timeout: 15000,
});

// attach token automatically if present
client.interceptors.request.use((config) => {
  const token = localStorage.getItem("access_token") || localStorage.getItem("admin_jwt");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// normalize errors
client.interceptors.response.use(
  (res) => res,
  (err) => Promise.reject(new Error(err.response?.data?.message || err.message))
);

export default client;
