// src/api/adminAPI.js
import client from "./axiosAdminConfig";

// Helper to safely build displayName
const buildDisplayName = (firstName, lastName) =>
  `${(firstName || "").trim()} ${(lastName || "").trim()}`.trim();

const adminAPI = {
  // POST /admin/create/student_user
  async createStudent({ personalMail, firstName, lastName }) {
    const body = {
      personalEmail: personalMail,
      displayName: buildDisplayName(firstName, lastName),
    };

    const { data } = await client.post(
      "/admin/create/student_user",
      body
    );
    // data is AdminUserResponse
    return data;
  },

  // GET /admin/users/{id}
  async getStudentById(id) {
    const { data } = await client.get(`/admin/users/${id}`);
    // data is AdminGetUser
    return data;
  },

  // PATCH /admin/update/user_status
  async updateStudentStatus(userId, status) {
    const body = { userId, status };
    const { data } = await client.patch(
      "/admin/update/user_status",
      body
    );
    // data is AdminUserResponse
    return data;
  },

  // Very simple “search”: treat query as numeric student ID and try to load it
  async searchStudents(query) {
    const trimmed = query.trim();
    if (!trimmed) return [];

    const id = Number(trimmed);
    if (!Number.isInteger(id)) {
      // for now we only support searching by numeric userId
      return [];
    }

    try {
      const user = await this.getStudentById(id);
      return [
        {
          id,
          label: `${user.displayName} — ${user.schoolEmail}`,
        },
      ];
    } catch (e) {
      // user not found => no results
      return [];
    }
  },
};

export default adminAPI;
