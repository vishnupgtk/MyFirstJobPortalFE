import api from "../api/axios";

export const sendChatbotMessage = async (payload) => {
  const response = await api.post("/chatbot/message", payload);
  return response.data;
};

export const getChatbotHistory = async (sessionId) => {
  const response = await api.get("/chatbot/history", {
    params: sessionId ? { sessionId } : {},
  });

  return response.data;
};
