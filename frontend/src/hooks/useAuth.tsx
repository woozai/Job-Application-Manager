import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";

import { ApiError } from "../api/client";
import { getCurrentUser, loginUser } from "../api/users";

import type { UserSummary } from "../types/auth";

const sessionStorageKey = "job-application-manager.session";

interface AuthContextValue {
  currentUser: UserSummary | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoadingSession: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

interface StoredSession {
  accessToken: string;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function readStoredSession(): StoredSession | null {
  const rawValue = window.localStorage.getItem(sessionStorageKey);

  if (!rawValue) {
    return null;
  }

  try {
    return JSON.parse(rawValue) as StoredSession;
  } catch {
    window.localStorage.removeItem(sessionStorageKey);
    return null;
  }
}

function writeStoredSession(session: StoredSession | null) {
  if (session) {
    window.localStorage.setItem(sessionStorageKey, JSON.stringify(session));
    return;
  }

  window.localStorage.removeItem(sessionStorageKey);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<UserSummary | null>(null);
  const [isLoadingSession, setIsLoadingSession] = useState(true);

  useEffect(() => {
    async function hydrateSession() {
      const storedSession = readStoredSession();

      if (!storedSession?.accessToken) {
        setIsLoadingSession(false);
        return;
      }

      try {
        const user = await getCurrentUser(storedSession.accessToken);
        setToken(storedSession.accessToken);
        setCurrentUser(user);
      } catch {
        writeStoredSession(null);
        setToken(null);
        setCurrentUser(null);
      } finally {
        setIsLoadingSession(false);
      }
    }

    void hydrateSession();
  }, []);

  async function login(email: string, password: string) {
    const session = await loginUser({ email, password });
    const user = await getCurrentUser(session.access_token);

    writeStoredSession({ accessToken: session.access_token });
    setToken(session.access_token);
    setCurrentUser(user);
  }

  function logout() {
    writeStoredSession(null);
    setToken(null);
    setCurrentUser(null);
  }

  const value: AuthContextValue = {
    currentUser,
    token,
    isAuthenticated: Boolean(token && currentUser),
    isLoadingSession,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
}

export function isUnauthorizedError(error: unknown) {
  return error instanceof ApiError && error.status === 401;
}
