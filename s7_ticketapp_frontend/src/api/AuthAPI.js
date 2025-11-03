import client from "./AxiosConfig";

// very light email format check (backend still validates)
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const AuthAPI = {
  /**
   * Login -> POST /auth/login
   * body: { schoolEmail, password }
   * returns: { accessToken }
   * stores 'access_token' in localStorage for interceptor
   */
  async login({ schoolEmail, password }) {
    if (!schoolEmail || !emailRegex.test(schoolEmail)) {
      throw new Error("Enter a valid school email (e.g. s1@fontys.nl).");
    }
    if (!password || password.length < 8) {
      throw new Error("Password must be at least 8 characters.");
    }

    const { data } = await client.post("/auth/login", { schoolEmail, password });

    if (!data?.accessToken || typeof data.accessToken !== "string") {
      throw new Error("Login failed: no access token returned.");
    }
    localStorage.setItem("access_token", data.accessToken);
    return data; // { accessToken }
  },

  logout() {
    localStorage.removeItem("access_token");
  },

  isAuthenticated() {
    return !!localStorage.getItem("access_token");
  },
};

export default AuthAPI;
