import { isTokenExpired } from "../helpers/jwt";

const KEY = "access_token";

export const getAccessToken = () => localStorage.getItem(KEY);

export const isAuthenticated = () => {
  const t = getAccessToken();
  return !!t && !isTokenExpired(t);
};

export const signOut = () => localStorage.removeItem(KEY);

export const signOutAndRedirect = () => {
  signOut();
  window.location.replace("/login");
};

