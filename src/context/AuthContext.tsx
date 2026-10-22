import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useQueryClient } from "@tanstack/react-query";
import { authApi } from "@/lib/api/endpoints";
import { ApiError } from "@/lib/api/client";
import type { AuthResponse, User } from "@/lib/api/types";
import {
  AUTH_STORAGE_KEY,
  clearAuthStorage,
  clearLegacyDemoStorage,
  readAuthStorage,
  writeAuthStorage,
  type StoredAuth,
} from "@/lib/auth/storage";

interface LoginInput {
  email: string;
  password: string;
}

interface RegisterInput extends LoginInput {
  name: string;
  phone: string;
}

interface AuthContextValue {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (input: LoginInput) => Promise<AuthResponse>;
  register: (input: RegisterInput) => Promise<AuthResponse>;
  logout: () => void;
  updateUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const [auth, setAuth] = useState<StoredAuth | null>(() => readAuthStorage());
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    clearLegacyDemoStorage();

    if (auth?.token) {
      setIsLoading(true);
      authApi
        .me()
        .then((user) => {
          const next = { token: auth.token, user };
          writeAuthStorage(next);
          setAuth(next);
        })
        .catch((error: unknown) => {
          if (error instanceof ApiError && error.status === 401) {
            clearAuthStorage();
            setAuth(null);
          } else {
            console.error("Could not refresh the authenticated user", error);
          }
        })
        .finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }

    const handleStorage = (event: StorageEvent) => {
      if (event.key !== AUTH_STORAGE_KEY) return;
      setAuth(readAuthStorage());
    };

    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, [auth?.token]);

  const persist = useCallback((next: StoredAuth) => {
    writeAuthStorage(next);
    setAuth(next);
  }, []);

  const login = useCallback(
    async (input: LoginInput) => {
      const response = await authApi.login(input);
      persist({ token: response.token, user: response.user });
      return response;
    },
    [persist]
  );

  const register = useCallback(
    async (input: RegisterInput) => {
      const response = await authApi.register(input);
      persist({ token: response.token, user: response.user });
      return response;
    },
    [persist]
  );

  const logout = useCallback(() => {
    clearAuthStorage();
    setAuth(null);
    queryClient.clear();
  }, [queryClient]);

  const updateUser = useCallback(
    (user: User) => {
      setAuth((current) => {
        const next = { token: current?.token ?? "", user };
        writeAuthStorage(next);
        return next;
      });
    },
    []
  );

  const value = useMemo<AuthContextValue>(
    () => ({
      user: auth?.user ?? null,
      token: auth?.token ?? null,
      isAuthenticated: Boolean(auth?.token),
      isLoading,
      login,
      register,
      logout,
      updateUser,
    }),
    [auth, isLoading, login, register, logout, updateUser]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
