import urls from "./urls";
import axios from "axios";

// keep if you already have this file
import { ADMIN_STORAGE_KEY } from "../auth/useAdminAuth";

const client = axios.create({
  baseURL: import.meta?.env?.VITE_API_URL ?? urls?.base_url ?? "/api",
  withCredentials: true,
  timeout: 15000,
});

// attach token automatically if present
client.interceptors.request.use((config) => {
  const token = localStorage.getItem(ADMIN_STORAGE_KEY) 
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// normalize errors
client.interceptors.response.use(
  (res) => res,
  (err) => {
    const status = err.response?.status;
    if (status === 401 || status === 403) {
      // Token invalid/expired or no longer allowed
      localStorage.removeItem(ADMIN_STORAGE_KEY);
      // optional: force a reload or route change
      // window.location.href = "/login?admin=1";
    }
    return Promise.reject(err);
  }
);

export default client;
