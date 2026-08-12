import mongoose, { Schema, type Model, type Types } from "mongoose";
import { MEMBERSHIP_STATUS, type MembershipStatus } from "@/lib/constants";

export interface IMembership {
  _id: Types.ObjectId;
  gymId: Types.ObjectId;
  memberId: Types.ObjectId;
  planId: Types.ObjectId;
  startDate: Date;
  endDate: Date;
  amount: number;
  status: MembershipStatus;
  createdAt: Date;
  updatedAt: Date;
}

const membershipSchema = new Schema<IMembership>(
  {
    gymId: { type: Schema.Types.ObjectId, ref: "Gym", required: true, index: true },
    memberId: { type: Schema.Types.ObjectId, ref: "Member", required: true, index: true },
    planId: { type: Schema.Types.ObjectId, ref: "MembershipPlan", required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true, index: true },
    amount: { type: Number, required: true, min: 0 },
    status: {
      type: String,
      enum: Object.values(MEMBERSHIP_STATUS),
      default: MEMBERSHIP_STATUS.ACTIVE,
      index: true,
    },
  },
  { timestamps: true },
);

export const MembershipModel: Model<IMembership> =
  (mongoose.models.Membership as Model<IMembership>) ??
  mongoose.model<IMembership>("Membership", membershipSchema);
