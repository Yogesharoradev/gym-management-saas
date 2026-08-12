import {
  Users,
  UserCheck,
  Clock,
  UserX,
  CalendarCheck,
  IndianRupee,
  Wallet,
  type LucideIcon,
} from "lucide-react";

export const IS_MOCK_DATA = true;

export interface DashboardStat {
  key: string;
  label: string;
  value: string;
  helper: string;
  icon: LucideIcon;
  accent?: boolean;
}

export const dashboardStats: DashboardStat[] = [
  { key: "total-members", label: "Total Members", value: "248", helper: "All registered members", icon: Users },
  { key: "active-members", label: "Active Members", value: "213", helper: "Currently active memberships", icon: UserCheck, accent: true },
  { key: "expiring-soon", label: "Expiring Soon", value: "18", helper: "Renewals due in 7 days", icon: Clock },
  { key: "expired-members", label: "Expired Members", value: "27", helper: "Lapsed memberships", icon: UserX },
  { key: "today-attendance", label: "Today's Attendance", value: "96", helper: "Check-ins recorded today", icon: CalendarCheck },
  { key: "today-collection", label: "Today's Collection", value: "₹42,500", helper: "Payments received today", icon: IndianRupee, accent: true },
  { key: "pending-payments", label: "Pending Payments", value: "₹78,000", helper: "Outstanding dues", icon: Wallet },
];

export const revenueSeries = [
  { day: "Mon", revenue: 12500 },
  { day: "Tue", revenue: 18200 },
  { day: "Wed", revenue: 9800 },
  { day: "Thu", revenue: 22400 },
  { day: "Fri", revenue: 31500 },
  { day: "Sat", revenue: 42500 },
  { day: "Sun", revenue: 15600 },
];

export interface ExpiringMember {
  id: string;
  name: string;
  plan: string;
  endsIn: string;
}

export const expiringMembers: ExpiringMember[] = [
  { id: "1", name: "Aditya Nair", plan: "Quarterly", endsIn: "2 days" },
  { id: "2", name: "Sneha Kulkarni", plan: "Monthly", endsIn: "3 days" },
  { id: "3", name: "Vikram Reddy", plan: "Annual", endsIn: "5 days" },
  { id: "4", name: "Priya Menon", plan: "Monthly", endsIn: "6 days" },
];
