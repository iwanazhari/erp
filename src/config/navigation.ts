export interface NavItem {
  label: string;
  path: string;
  icon?: string;
  children?: NavItem[];
  roles?: string[];
}

export const NAVIGATION: NavItem[] = [
  { label: "Dashboard", path: "/", roles: ["admin", "supervisor", "technician", "sales", "finance", "hr", "manager"] },
  { label: "Attendance", path: "/attendance", roles: ["admin", "supervisor", "technician", "sales", "finance", "hr", "manager"] },
  { label: "Leave", path: "/leave", roles: ["admin", "supervisor", "technician", "sales", "finance", "hr", "manager"] },
  { label: "Overtime", path: "/overtime", roles: ["admin", "supervisor", "technician", "sales", "finance", "hr", "manager"] },
  {
    label: "Calendar & Holidays",
    path: "/calendar",
    roles: ["admin", "supervisor", "technician", "sales", "finance", "hr", "manager"],
    children: [
      { label: "Kalender", path: "/calendar", roles: ["admin", "supervisor", "technician", "sales", "finance", "hr", "manager"] },
      { label: "Kelola Hari Libur", path: "/custom-holidays", roles: ["admin", "supervisor", "hr", "manager"] },
    ]
  },
  {
    label: "Schedule",
    path: "/schedule",
    roles: ["admin", "supervisor", "technician", "sales", "finance", "hr", "manager"],
    children: [
      { label: "Technician Schedule", path: "/schedule", roles: ["admin", "supervisor", "hr", "manager"] },
      { label: "My Schedule", path: "/schedule/my", roles: ["technician", "sales", "finance", "manager"] },
      { label: "Sales Schedule", path: "/schedule/sales", roles: ["admin", "supervisor", "sales", "hr", "manager"] },
    ]
  },
  { label: "Reports", path: "/reports", roles: ["admin", "supervisor", "sales", "finance", "hr", "manager"] },
  { label: "User Management", path: "/users", roles: ["admin", "hr"] },
  { label: "Panduan", path: "/help", roles: ["admin", "supervisor", "technician", "sales", "finance", "hr", "manager"] },
];
