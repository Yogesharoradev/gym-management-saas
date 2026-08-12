import {
  LayoutDashboard,
  Users,
  CreditCard,
  CalendarCheck,
  IndianRupee,
  Clock,
  BarChart3,
  Megaphone,
  Settings,
  Building2,
  Receipt,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
}

export const GYM_NAV: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Members", href: "/members", icon: Users },
  { label: "Memberships", href: "/memberships", icon: CreditCard },
  { label: "Attendance", href: "/attendance", icon: CalendarCheck },
  { label: "Payments", href: "/payments", icon: IndianRupee },
  { label: "Expiry", href: "/expiry", icon: Clock },
  { label: "Reports", href: "/reports", icon: BarChart3 },
  { label: "Announcements", href: "/announcements", icon: Megaphone },
  { label: "Settings", href: "/settings", icon: Settings },
];

export const SUPER_NAV: NavItem[] = [
  { label: "Overview", href: "/super-admin", icon: LayoutDashboard },
  { label: "Gyms", href: "/super-admin/gyms", icon: Building2 },
  { label: "Subscriptions", href: "/super-admin/subscriptions", icon: Receipt },
];
