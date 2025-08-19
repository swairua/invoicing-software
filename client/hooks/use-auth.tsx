import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { User, AuthState, UserRole } from "@shared/types";

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  hasRole: (role: UserRole) => boolean;
  hasPermission: (permission: string) => boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const ROLE_PERMISSIONS = {
  admin: ["*"],
  sales: [
    "invoices:read",
    "invoices:write",
    "customers:read",
    "customers:write",
    "quotations:read",
    "quotations:write",
  ],
  accountant: [
    "invoices:read",
    "payments:read",
    "payments:write",
    "reports:read",
    "customers:read",
  ],
  viewer: ["invoices:read", "customers:read", "reports:read"],
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    token: null,
    isAuthenticated: false,
  });
  const [isLoading, setIsLoading] = useState(true);

  // No mock data - authentication must work with real API

  useEffect(() => {
    // Check for existing session
    const token = localStorage.getItem("auth_token");
    const userData = localStorage.getItem("user_data");

    if (token && userData) {
      try {
        const user = JSON.parse(userData);
        setAuthState({
          user,
          token,
          isAuthenticated: true,
        });
      } catch (error) {
        // Clear invalid data
        localStorage.removeItem("auth_token");
        localStorage.removeItem("user_data");
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      // Real authentication API call - no fallback
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        throw new Error('Authentication failed');
      }

      const { user, token } = await response.json();

      localStorage.setItem("auth_token", token);
      localStorage.setItem("user_data", JSON.stringify(user));

      setAuthState({
        user,
        token,
        isAuthenticated: true,
      });
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("user_data");
    setAuthState({
      user: null,
      token: null,
      isAuthenticated: false,
    });
  };

  const hasRole = (role: UserRole): boolean => {
    if (!authState.user) return false;
    return authState.user.role === role || authState.user.role === "admin";
  };

  const hasPermission = (permission: string): boolean => {
    if (!authState.user) return false;

    const userPermissions =
      ROLE_PERMISSIONS[authState.user.role as keyof typeof ROLE_PERMISSIONS] ||
      [];
    return (
      userPermissions.includes("*") || userPermissions.includes(permission)
    );
  };

  return (
    <AuthContext.Provider
      value={{
        ...authState,
        login,
        logout,
        hasRole,
        hasPermission,
        isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

export function RequireAuth({
  children,
  role,
  permission,
}: {
  children: ReactNode;
  role?: UserRole;
  permission?: string;
}) {
  const { isAuthenticated, hasRole, hasPermission } = useAuth();

  if (!isAuthenticated) {
    return <div>Please log in to access this page.</div>;
  }

  if (role && !hasRole(role)) {
    return <div>You don't have permission to access this page.</div>;
  }

  if (permission && !hasPermission(permission)) {
    return <div>You don't have permission to access this feature.</div>;
  }

  return <>{children}</>;
}
