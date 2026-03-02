import { createContext, useContext } from "react";
import { useCurrentUser } from "@/modules/auth/useCurrentUser";
import {
  canEditAttendance,
  canDeleteAttendance,
  canExportAttendance,
  canViewAudit,
  canQuickEditStatus,
} from "@/modules/auth/permissions";
import type { User } from "@/modules/auth/types";

interface UserContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  canEdit: boolean;
  canDelete: boolean;
  canExport: boolean;
  canViewAudit: boolean;
  canQuickEditStatus: boolean;
  switchRole: (role: "admin" | "supervisor" | "technician") => void;
  logout: () => void;
}

const UserContext = createContext<UserContextType | null>(null);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated, isLoading, switchRole, logout } = useCurrentUser();

  const value: UserContextType = {
    user,
    isAuthenticated,
    isLoading,
    canEdit: canEditAttendance(user?.role ?? "technician"),
    canDelete: canDeleteAttendance(user?.role ?? "technician"),
    canExport: canExportAttendance(user?.role ?? "technician"),
    canViewAudit: canViewAudit(user?.role ?? "technician"),
    canQuickEditStatus: canQuickEditStatus(user?.role ?? "technician"),
    switchRole,
    logout,
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

export function useUser() {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser must be used within UserProvider");
  }
  return context;
}
