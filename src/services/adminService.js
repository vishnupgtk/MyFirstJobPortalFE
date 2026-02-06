import api from "../api/axios";
export const getAllUsers = () =>
  api.get("/admin/users");
export const updateUser = (data) =>
  api.put("/admin/users", data);
export const deleteUser = (id) =>
  api.delete(`/admin/users/${id}`);
