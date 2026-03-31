export type Role = "admin" | "supervisor" | "technician" | "sales" | "finance" | "hr";

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  companyId: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}
