import { useSelector, useDispatch } from 'react-redux';
import { loginSuccess, hydrateAuth, markAuthInitialized, logout } from './slices/authSlice';

// Custom hooks for typed Redux usage
export const useAppDispatch = () => useDispatch();
export const useAppSelector = useSelector;

// Auth-specific hooks for convenience
export const useAuth = () => {
  return useAppSelector((state) => state.auth);
};

export const useAuthActions = () => {
  const dispatch = useAppDispatch();
  
  return {
    loginSuccess: (token) => dispatch(loginSuccess(token)),
    hydrateAuth: (token) => dispatch(hydrateAuth(token)),
    markAuthInitialized: () => dispatch(markAuthInitialized()),
    logout: () => dispatch(logout()),
  };
};