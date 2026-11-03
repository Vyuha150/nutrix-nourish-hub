import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { authApi, onUnauthorized, setAuthToken } from "@/lib/api";
import type { AuthUser } from "@/lib/types";

interface AuthContextValue {
  user: AuthUser | null;
  token: string | null;
  loading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isCustomer: boolean;
  signIn: (email: string, password: string) => Promise<AuthUser>;
  signUp: (name: string, email: string, password: string) => Promise<AuthUser>;
  signOut: () => void;
  refreshUser: () => Promise<AuthUser | null>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const USER_STORAGE_KEY = "nutrix_auth_user";

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [token, setTokenState] = useState<string | null>(() => {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("nutrix_auth_token");
  });

  const [user, setUser] = useState<AuthUser | null>(() => {
    if (typeof window === "undefined") return null;
    const raw = localStorage.getItem(USER_STORAGE_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as AuthUser;
    } catch {
      localStorage.removeItem(USER_STORAGE_KEY);
      return null;
    }
  });

  const [loading, setLoading] = useState(true);

  const clearAuth = useCallback(() => {
    setUser(null);
    setTokenState(null);
    setAuthToken(null);
    if (typeof window !== "undefined") {
      localStorage.removeItem(USER_STORAGE_KEY);
    }
  }, []);

  const refreshUser = useCallback(async (): Promise<AuthUser | null> => {
    const currentToken = localStorage.getItem("nutrix_auth_token");
    if (!currentToken) {
      clearAuth();
      setLoading(false);
      return null;
    }

    try {
      setAuthToken(currentToken);
      const res = await authApi.me();
      if (res?.user) {
        setUser(res.user);
        setTokenState(currentToken);
        localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(res.user));
        return res.user;
      } else {
        clearAuth();
        return null;
      }
    } catch {
      clearAuth();
      return null;
    } finally {
      setLoading(false);
    }
  }, [clearAuth]);

  // Initial load verification
  useEffect(() => {
    void refreshUser();
  }, [refreshUser]);

  // Listen to 401s from the api client
  useEffect(() => {
    onUnauthorized(() => {
      clearAuth();
    });
    return () => {
      onUnauthorized(null);
    };
  }, [clearAuth]);

  const signIn = useCallback(
    async (email: string, password: string): Promise<AuthUser> => {
      const res = await authApi.login({
        email: email.trim().toLowerCase(),
        password,
      });

      const { user: loggedInUser, token: receivedToken } = res;
      setAuthToken(receivedToken);
      setTokenState(receivedToken);
      setUser(loggedInUser);
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(loggedInUser));
      return loggedInUser;
    },
    [],
  );

  const signUp = useCallback(
    async (name: string, email: string, password: string): Promise<AuthUser> => {
      const res = await authApi.register({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password,
      });

      const { user: registeredUser, token: receivedToken } = res;
      setAuthToken(receivedToken);
      setTokenState(receivedToken);
      setUser(registeredUser);
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(registeredUser));
      return registeredUser;
    },
    [],
  );

  const signOut = useCallback(() => {
    clearAuth();
  }, [clearAuth]);

  const isAuthenticated = Boolean(user && token);
  const isAdmin = user?.role === "admin";
  const isCustomer = user?.role === "customer";

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      token,
      loading,
      isAuthenticated,
      isAdmin,
      isCustomer,
      signIn,
      signUp,
      signOut,
      refreshUser,
    }),
    [user, token, loading, isAuthenticated, isAdmin, isCustomer, signIn, signUp, signOut, refreshUser],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
