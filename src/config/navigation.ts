export interface NavItem {
  label: string;
  path: string;
  icon?: string;
  children?: NavItem[];
  roles?: string[];
}

export const NAVIGATION: NavItem[] = [
  { label: "Dashboard", path: "/", roles: ["admin", "supervisor", "technician", "sales", "finance", "hr"] },
  { label: "Attendance", path: "/attendance", roles: ["admin", "supervisor", "technician", "sales", "finance", "hr"] },
  { label: "Leave", path: "/leave", roles: ["admin", "supervisor", "technician", "sales", "finance", "hr"] },
  { label: "Calendar", path: "/calendar", roles: ["admin", "supervisor", "technician", "sales", "finance", "hr"] },
  { label: "Custom Holidays", path: "/custom-holidays", roles: ["admin", "supervisor", "hr"] },
  {
    label: "Schedule",
    path: "/schedule",
    roles: ["admin", "supervisor", "technician", "sales", "finance", "hr"],
    children: [
      { label: "All Schedules", path: "/schedule", roles: ["admin", "supervisor", "hr"] },
      { label: "My Schedule", path: "/schedule/my", roles: ["technician", "sales", "finance"] },
      { label: "Sales Schedule", path: "/schedule/sales", roles: ["admin", "supervisor", "sales", "hr"] },
    ]
  },
  { label: "Reports", path: "/reports", roles: ["admin", "supervisor", "sales", "finance", "hr"] },
];
