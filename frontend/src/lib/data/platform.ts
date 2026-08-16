import "server-only";
import { connectToDatabase } from "@/lib/db";
import { GymModel } from "@/models/gym.model";
import {
  SUBSCRIPTION_STATUS,
  GYM_STATUS,
  type SubscriptionStatus,
  type GymStatus,
} from "@/lib/constants";

export interface PlatformGym {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: GymStatus;
  subscriptionStatus: SubscriptionStatus;
  subscriptionEndDate: string | null;
  createdAt: string;
}

export interface PlatformOverview {
  totalGyms: number;
  activeGyms: number;
  pastDueGyms: number;
  suspendedGyms: number;
  cancelledGyms: number;
  gyms: PlatformGym[];
}

export async function getPlatformOverview(): Promise<PlatformOverview> {
  await connectToDatabase();

  const gymDocs = await GymModel.find().sort({ createdAt: -1 }).lean<
    Array<{
      _id: unknown;
      name: string;
      email: string;
      phone: string;
      status: GymStatus;
      subscriptionStatus: SubscriptionStatus;
      subscriptionEndDate: Date | null;
      createdAt: Date;
    }>
  >();

  const gyms: PlatformGym[] = gymDocs.map((gym) => ({
    id: String(gym._id),
    name: gym.name,
    email: gym.email,
    phone: gym.phone,
    status: gym.status,
    subscriptionStatus: gym.subscriptionStatus,
    subscriptionEndDate: gym.subscriptionEndDate
      ? gym.subscriptionEndDate.toISOString()
      : null,
    createdAt: gym.createdAt.toISOString(),
  }));

  const countBy = (status: SubscriptionStatus): number =>
    gyms.filter((gym) => gym.subscriptionStatus === status).length;

  return {
    totalGyms: gyms.length,
    activeGyms: countBy(SUBSCRIPTION_STATUS.ACTIVE),
    pastDueGyms: countBy(SUBSCRIPTION_STATUS.PAST_DUE),
    suspendedGyms: countBy(SUBSCRIPTION_STATUS.SUSPENDED),
    cancelledGyms: countBy(SUBSCRIPTION_STATUS.CANCELLED),
    gyms,
  };
}
