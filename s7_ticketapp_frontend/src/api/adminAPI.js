import client from "./client";

const adminAPI = {
  getPostById: (postId) =>
    client.get(`/posts/${postId}`).then(r => r.data),
  

  createStudent: (student) =>
    client.post(`/posts`, student).then(r => r.data),

  // If you want to override the token for some reason, you can still pass a header;
  // otherwise rely on the interceptor using localStorage's access_token.
  updateStudentStatus: (studentId, body = {}, adminJWT) =>
    client.put(
      `/posts/${studentId}`,
      body,
      adminJWT ? { headers: { Authorization: `Bearer ${adminJWT}` } } : undefined
    ).then(r => r.data),

  getRecentPosts: (userId) =>
    client.get(`/posts/recentPosts/${userId}`).then(r => r.data),
};

export default adminAPI;
