import axios from "axios";
import { store } from "../store/store";
import { logout } from "../store/slices/authSlice";
import config from "../config/env";

let isLoggingOut = false;

const api = axios.create({
  baseURL: config.api.baseURL,
  timeout: config.api.timeout,
});

// Request interceptor
api.interceptors.request.use(
  (req) => {
    const token = localStorage.getItem(config.security.tokenStorageKey);
    if (token) {
      req.headers.Authorization = `Bearer ${token}`;
    }

    if (config.features.apiLogging && config.app.isDevelopment) {
      console.log("API Request:", {
        method: req.method?.toUpperCase(),
        url: req.url,
      });
    }

    return req;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
api.interceptors.response.use(
  (res) => {
    if (config.features.apiLogging && config.app.isDevelopment) {
      console.log("API Response:", {
        status: res.status,
        url: res.config.url,
      });
    }
    return res;
  },
  (error) => {
    const status = error.response?.status;

    // Network error
    if (!error.response && error.message === "Network Error") {
      console.error("Network Error: Server unreachable");
    }

    // Timeout
    if (error.code === "ECONNABORTED") {
      console.error("Request Timeout");
    }

    // Auth error
    if (status === 401 && !isLoggingOut) {
      isLoggingOut = true;

      localStorage.removeItem(config.security.tokenStorageKey);
      store.dispatch(logout());

      window.location.href = "/";
    }

    // Client errors
    if (status === 400) console.warn("Bad Request");
    if (status === 403) console.warn("Forbidden");
    if (status === 404) console.warn("Not Found");

    // Server errors
    if (status >= 500) console.error("Server Error");

    return Promise.reject(error);
  }
);

export default api;
