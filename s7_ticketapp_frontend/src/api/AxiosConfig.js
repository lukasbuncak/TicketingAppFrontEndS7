import axios from "axios";

import { signOutAndRedirect } from "../helpers/auth"
import { isTokenExpired } from "../helpers/jwt"

// Vite env: put VITE_API_URL in your .env (e.g. http://localhost:8081)
const client = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: false,   // JWT in header, not cookies
  timeout: 15000,
});

// Attach JWT automatically + check expiry
client.interceptors.request.use((config) => {
  const token = localStorage.getItem("access_token");
  if (token) {
    if (isTokenExpired(token)) {
      signOutAndRedirect();                            // remove & go to /login
      return Promise.reject(new axios.Cancel("Token expired"));
    }
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Normalize errors -> always throw Error(message)
client.interceptors.response.use(
  (res) => res,
  (err) => {
    const msg =
      err.response?.data?.message ||
      err.response?.data?.error ||
      err.message ||
      "Request failed";
    return Promise.reject(new Error(msg));
  }
);

export default client;
