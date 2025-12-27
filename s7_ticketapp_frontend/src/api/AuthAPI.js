import client from "./AxiosConfig";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const AuthAPI = {
  async login({ schoolEmail, password }) {
    if (!schoolEmail || !emailRegex.test(schoolEmail)) {
      throw new Error("Enter a valid school email (e.g. s1@fontys.nl).");
    }
    if (!password || password.length < 8) {
      throw new Error("Password must be at least 8 characters.");
    }

    try {
      const { data } = await client.post("/auth/login", { schoolEmail, password });

      // normal login, no MFA
      if (data?.accessToken && typeof data.accessToken === "string") {
        localStorage.setItem("access_token", data.accessToken);
        return { status: "OK", accessToken: data.accessToken };
      }

      throw new Error("Login failed: invalid server response.");
    } catch (e) {
      const status = e.response?.status;
      const body = e.response?.data;

      // this is your MFA case: 409 + { mfaToken }
      if (status === 409 && body?.mfaToken) {
        return { status: "MFA_REQUIRED", mfaToken: body.mfaToken };
      }

      throw new Error(e.message || "Login failed");
    }
  },

  async verifyMfaLogin({ mfaToken, code }) {
    const { data } = await client.post(
      "/auth/mfa/verify",
      { code },                                // body = TotpVerifyRequest
      {
        headers: {
          Authorization: `Bearer ${mfaToken}`, // mfaToken in header
        },
      }
    );
  
    if (!data?.accessToken) {
      throw new Error("MFA verification failed: no access token");
    }
    localStorage.setItem("access_token", data.accessToken);
    return data;
  },

  logout() {
    localStorage.removeItem("access_token");
  },

  isAuthenticated() {
    return !!localStorage.getItem("access_token");
  },
};

export default AuthAPI;
