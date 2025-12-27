// src/api/mfaApi.js
import client from "./AxiosConfig";

const mfaApi = {
  async setup() {
    const { data } = await client.post("/mfa/setup");
    const otpAuthUrl = data?.otpauthUri;   // <--- use backend field name

    if (!otpAuthUrl) {
      console.error("MFA setup response:", data);
      throw new Error("Server did not return otpauthUri");
    }

    return { otpAuthUrl }; // return a consistent shape for the rest of the app
  },

  async confirm(code) {
    const { data } = await client.post("/mfa/confirm", { code });
    return data;
  },

  async verifyLogin({ mfaToken, code }) {
    const { data } = await client.post("/auth/mfa/verify", { mfaToken, code });
    if (!data?.accessToken) {
      throw new Error("MFA verification failed: no access token");
    }
    localStorage.setItem("access_token", data.accessToken);
    return data;
  },

  async status() {
    const { data } = await client.get("/mfa/status");
    return data; // { enabled, pending }
  },

  async disable() {
    await client.post("/mfa/disable");
  }
};

export default mfaApi;
