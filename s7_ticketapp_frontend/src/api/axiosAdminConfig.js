import axios from "axios";

// keep if you already have this file
import { ADMIN_STORAGE_KEY } from "../auth/useAdminAuth";

const baseUrl =
  import.meta.env.VITE_API_URL ??
  "/api"; // fallback to /api if no .env configured

const adminClient = axios.create({
  baseURL: baseUrl,
  withCredentials: false,
  timeout: 15000,
});

// attach admin JWT automatically
adminClient.interceptors.request.use((config) => {
  const token = localStorage.getItem(ADMIN_STORAGE_KEY);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// handle 401/403 globally
adminClient.interceptors.response.use(
  (res) => res,
  (err) => {
    const status = err.response?.status;
    if (status === 401 || status === 403) {
      localStorage.removeItem(ADMIN_STORAGE_KEY);
      // force logout and redirect
      window.location.href = "/login?admin=1";
    }
    return Promise.reject(err);
  }
);

export default adminClient;
