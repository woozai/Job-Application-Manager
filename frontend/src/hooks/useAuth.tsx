import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";

import { ApiError } from "../api/client";
import { getCurrentUser, loginUser, refreshAccessToken } from "../api/users";

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
  refreshToken: string;
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

function getTokenExpirationMs(token: string) {
  const [, payload] = token.split(".");

  if (!payload) {
    return null;
  }

  try {
    const normalizedPayload = payload.replace(/-/g, "+").replace(/_/g, "/");
    const paddedPayload = normalizedPayload.padEnd(
      normalizedPayload.length + ((4 - (normalizedPayload.length % 4)) % 4),
      "=",
    );
    const decodedPayload = JSON.parse(window.atob(paddedPayload)) as { exp?: unknown };
    return typeof decodedPayload.exp === "number" ? decodedPayload.exp * 1000 : null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<UserSummary | null>(null);
  const [isLoadingSession, setIsLoadingSession] = useState(true);

  async function applySession(accessToken: string, nextRefreshToken: string) {
    const user = await getCurrentUser(accessToken);

    writeStoredSession({
      accessToken,
      refreshToken: nextRefreshToken,
    });
    setToken(accessToken);
    setRefreshToken(nextRefreshToken);
    setCurrentUser(user);
  }

  async function refreshSession(nextRefreshToken: string) {
    const refreshedSession = await refreshAccessToken(nextRefreshToken);
    await applySession(refreshedSession.access_token, refreshedSession.refresh_token);
  }

  function clearSession() {
    writeStoredSession(null);
    setToken(null);
    setRefreshToken(null);
    setCurrentUser(null);
  }

  useEffect(() => {
    async function hydrateSession() {
      const storedSession = readStoredSession();

      if (!storedSession?.accessToken || !storedSession.refreshToken) {
        setIsLoadingSession(false);
        return;
      }

      try {
        await applySession(storedSession.accessToken, storedSession.refreshToken);
      } catch {
        try {
          await refreshSession(storedSession.refreshToken);
        } catch {
          clearSession();
        }
      } finally {
        setIsLoadingSession(false);
      }
    }

    void hydrateSession();
  }, []);

  async function login(email: string, password: string) {
    const session = await loginUser({ email, password });
    await applySession(session.access_token, session.refresh_token);
  }

  function logout() {
    clearSession();
  }

  useEffect(() => {
    if (!token || !refreshToken) {
      return;
    }

    const expiresAt = getTokenExpirationMs(token);

    if (!expiresAt) {
      clearSession();
      return;
    }

    const oneMinuteBeforeExpiration = 60 * 1000;
    const refreshDelay = Math.max(expiresAt - Date.now() - oneMinuteBeforeExpiration, 0);
    const timeoutId = window.setTimeout(() => {
      void refreshSession(refreshToken).catch(() => {
        clearSession();
      });
    }, refreshDelay);

    return () => window.clearTimeout(timeoutId);
  }, [refreshToken, token]);

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
