import api from "../api/axios";
export const login = (email, password) =>
  api.post("/auth/login", { email, password });
export const register = (data) =>
  api.post("/auth/register", data);
export const resetPassword = (email, newPassword) =>
  api.post("/auth/reset-password", { email, newPassword });
