import mongoose, { Schema, type Model, type Types } from "mongoose";
import {
  GYM_STATUS,
  SUBSCRIPTION_STATUS,
  type GymStatus,
  type SubscriptionStatus,
} from "@/lib/constants";

export interface IGym {
  _id: Types.ObjectId;
  name: string;
  logo: string | null;
  phone: string;
  email: string;
  address: string;
  status: GymStatus;
  subscriptionStatus: SubscriptionStatus;
  subscriptionStartDate: Date | null;
  subscriptionEndDate: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const gymSchema = new Schema<IGym>(
  {
    name: { type: String, required: true, trim: true },
    logo: { type: String, default: null },
    phone: { type: String, default: "" },
    email: { type: String, default: "", lowercase: true, trim: true },
    address: { type: String, default: "" },
    status: {
      type: String,
      enum: Object.values(GYM_STATUS),
      default: GYM_STATUS.ACTIVE,
      index: true,
    },
    subscriptionStatus: {
      type: String,
      enum: Object.values(SUBSCRIPTION_STATUS),
      default: SUBSCRIPTION_STATUS.ACTIVE,
      index: true,
    },
    subscriptionStartDate: { type: Date, default: null },
    subscriptionEndDate: { type: Date, default: null },
  },
  { timestamps: true },
);

export const GymModel: Model<IGym> =
  (mongoose.models.Gym as Model<IGym>) ?? mongoose.model<IGym>("Gym", gymSchema);
