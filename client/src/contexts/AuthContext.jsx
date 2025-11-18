import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import {
  login as loginRequest,
  register as registerRequest,
  setAuthToken,
} from '../services/api';

const STORAGE_KEY = 'transit-auth';

const AuthContext = createContext({
  user: null,
  token: null,
  login: async () => {},
  register: async () => {},
  logout: () => {},
});

function getInitialAuth() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return { user: null, token: null };
    return JSON.parse(stored);
  } catch (error) {
    return { user: null, token: null };
  }
}

export function AuthProvider({ children }) {
  const [authState, setAuthState] = useState(getInitialAuth);

  useEffect(() => {
    if (authState.token) {
      setAuthToken(authState.token);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(authState));
    } else {
      setAuthToken(null);
      localStorage.removeItem(STORAGE_KEY);
    }
  }, [authState]);

  const login = useCallback(async (credentials) => {
    const response = await loginRequest(credentials);
    setAuthState({
      user: response.user,
      token: response.token,
    });
    return response;
  }, []);

  const register = useCallback(async (payload) => {
    const response = await registerRequest(payload);
    setAuthState({
      user: response.user,
      token: response.token,
    });
    return response;
  }, []);

  const logout = useCallback(() => setAuthState({ user: null, token: null }), []);

  const value = useMemo(
    () => ({
      user: authState.user,
      token: authState.token,
      login,
      register,
      logout,
      isAuthenticated: Boolean(authState.token),
    }),
    [authState, login, register, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);

