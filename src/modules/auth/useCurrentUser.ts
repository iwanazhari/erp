import { useState, useCallback } from "react";
import type { User, Role } from "./types";

// Mock users for different roles
const mockUsers: Record<Role, User> = {
  admin: {
    id: "user-admin",
    name: "Admin User",
    email: "admin@company.com",
    role: "admin",
    companyId: "company-1",
  },
  supervisor: {
    id: "user-supervisor",
    name: "Supervisor User",
    email: "supervisor@company.com",
    role: "supervisor",
    companyId: "company-1",
  },
  technician: {
    id: "user-technician",
    name: "Technician User",
    email: "technician@company.com",
    role: "technician",
    companyId: "company-1",
  },
  sales: {
    id: "user-sales",
    name: "Sales User",
    email: "sales@company.com",
    role: "sales",
    companyId: "company-1",
  },
  finance: {
    id: "user-finance",
    name: "Finance User",
    email: "finance@company.com",
    role: "finance",
    companyId: "company-1",
  },
  hr: {
    id: "user-hr",
    name: "HR User",
    email: "hr@company.com",
    role: "hr",
    companyId: "company-1",
  },
};

/**
 * Hook to manage current user state
 * In production, replace with real auth logic
 */
export function useCurrentUser() {
  const [user, setUser] = useState<User>(mockUsers.admin);

  const switchRole = useCallback((role: Role) => {
    setUser(mockUsers[role]);
  }, []);

  const logout = useCallback(() => {
    // In production, clear auth tokens
    setUser(mockUsers.technician);
  }, []);

  return {
    user,
    isAuthenticated: true,
    isLoading: false,
    switchRole,
    logout,
  };
}
