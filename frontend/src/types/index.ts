import type { Role, SubscriptionStatus, GymStatus } from "@/lib/constants";

export interface SessionUser {
  id: string;
  name: string;
  email: string;
  role: Role;
  gymId: string | null;
  mustChangePassword: boolean;
}

export interface GymSummary {
  id: string;
  name: string;
  logo: string | null;
  phone: string;
  email: string;
  status: GymStatus;
  subscriptionStatus: SubscriptionStatus;
  subscriptionEndDate: string | null;
}

export interface AuthContextValue {
  user: SessionUser;
  gym: GymSummary | null;
}
