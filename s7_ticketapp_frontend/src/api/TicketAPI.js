import client from "./AxiosConfig";

const TicketAPI = {
  listMine: (page = 0, size = 10) =>
    client.get(`/tickets`, { params: { page, size } }).then(r => r.data), // expect Spring Page<TicketObject>

  getById: (id) =>
    client.get(`/tickets/${id}`).then(r => r.data),

  create: (body /* { title, description } */) =>
    client.post(`/tickets`, body).then(r => r.data),

  // later:
  // uploadAttachment: (ticketId, file) => {
  //   const fd = new FormData();
  //   fd.append("file", file);
  //   return client.post(`/tickets/${ticketId}/attachments`, fd, {
  //     headers: { "Content-Type": "multipart/form-data" },
  //   }).then(r => r.data);
  // },

  // download if CLEAN (backend should enforce scan_status=CLEAN):
  // downloadAttachment: (ticketId, attachmentId) =>
  //   client.get(`/tickets/${ticketId}/attachments/${attachmentId}/download`, { responseType: "blob" }),
};

export default TicketAPI;
