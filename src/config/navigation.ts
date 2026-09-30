export interface NavItem {
  label: string;
  path: string;
  icon: string;
  children?: NavItem[];
  roles?: string[];
}

export const NAVIGATION: NavItem[] = [
  { label: "Dashboard", path: "/", icon: "LayoutDashboard", roles: ["admin", "supervisor", "technician", "sales", "finance", "hr", "manager"] },
  { label: "Attendance", path: "/attendance", icon: "ClipboardCheck", roles: ["admin", "supervisor", "technician", "sales", "finance", "hr", "manager"] },
  { label: "Leave", path: "/leave", icon: "CalendarOff", roles: ["admin", "supervisor", "technician", "sales", "finance", "hr", "manager"] },
  { label: "Overtime", path: "/overtime", icon: "Clock", roles: ["admin", "supervisor", "technician", "sales", "finance", "hr", "manager"] },
  {
    label: "Calendar & Holidays",
    path: "/calendar",
    icon: "Calendar",
    roles: ["admin", "supervisor", "technician", "sales", "finance", "hr", "manager"],
    children: [
      { label: "Kalender", path: "/calendar", icon: "CalendarDays", roles: ["admin", "supervisor", "technician", "sales", "finance", "hr", "manager"] },
      { label: "Kelola Hari Libur", path: "/custom-holidays", icon: "Flag", roles: ["admin", "supervisor", "hr", "manager"] },
    ]
  },
  {
    label: "Schedule",
    path: "/schedule",
    icon: "CalendarClock",
    roles: ["admin", "supervisor", "technician", "sales", "finance", "hr", "manager", "marketing"],
    children: [
      { label: "Technician Schedule", path: "/schedule", icon: "Wrench", roles: ["admin", "supervisor", "hr", "manager", "finance", "marketing"] },
      { label: "My Schedule", path: "/schedule/my", icon: "User", roles: ["technician", "sales", "finance", "manager"] },
      { label: "Sales Schedule", path: "/schedule/sales", icon: "TrendingUp", roles: ["admin", "supervisor", "sales", "hr", "manager"] },
    ]
  },
  { label: "Live Tracking", path: "/tracking", icon: "MapPin", roles: ["admin", "supervisor", "hr", "manager"] },
  { label: "Reports", path: "/reports", icon: "BarChart3", roles: ["admin", "supervisor", "sales", "finance", "hr", "manager"] },
  { label: "User Management", path: "/users", icon: "Users", roles: ["admin", "hr"] },
  { label: "Panduan", path: "/help", icon: "HelpCircle", roles: ["admin", "supervisor", "technician", "sales", "finance", "hr", "manager"] },
];
