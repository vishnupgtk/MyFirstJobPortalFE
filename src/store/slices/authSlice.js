import { createSlice } from '@reduxjs/toolkit';
import { jwtDecode } from 'jwt-decode';
import config from '../../config/env';

const initialState = {
  isAuthenticated: false,
  isAuthInitialized: false,
  user: null,
  role: null,
  token: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginSuccess: (state, action) => {
      const token = action.payload;
      
      try {
        const decoded = jwtDecode(token);
        const role = decoded["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"];
        
        state.isAuthenticated = true;
        state.isAuthInitialized = true;
        state.token = token;
        state.role = role;
        state.user = {
          email: decoded.email || "",
          fullName: `${decoded.firstName || ""} ${decoded.lastName || ""}`.trim(),
        };
        
        localStorage.setItem(config.security.tokenStorageKey, token);
      } catch (error) {
        console.error("Login token decode failed:", error);
        // Reset state on decode failure
        state.isAuthenticated = false;
        state.isAuthInitialized = true;
        state.user = null;
        state.role = null;
        state.token = null;
        localStorage.removeItem(config.security.tokenStorageKey);
      }
    },
    
    hydrateAuth: (state, action) => {
      const token = action.payload;
      
      try {
        const decoded = jwtDecode(token);
        const role = decoded["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"];
        
        state.isAuthenticated = true;
        state.isAuthInitialized = true;
        state.token = token;
        state.role = role;
        state.user = {
          email: decoded.email || "",
          fullName: `${decoded.firstName || ""} ${decoded.lastName || ""}`.trim(),
        };
      } catch (error) {
        console.error("Token hydration failed:", error);
        // Reset state on decode failure
        state.isAuthenticated = false;
        state.isAuthInitialized = true;
        state.user = null;
        state.role = null;
        state.token = null;
        localStorage.removeItem(config.security.tokenStorageKey);
      }
    },
    
    markAuthInitialized: (state) => {
      state.isAuthInitialized = true;
    },
    
    logout: (state) => {
      localStorage.removeItem(config.security.tokenStorageKey);
      state.isAuthenticated = false;
      state.isAuthInitialized = true;
      state.user = null;
      state.role = null;
      state.token = null;
    },
  },
});

export const { loginSuccess, hydrateAuth, markAuthInitialized, logout } = authSlice.actions;
export default authSlice.reducer;