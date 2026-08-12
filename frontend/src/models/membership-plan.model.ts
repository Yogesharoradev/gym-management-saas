import mongoose, { Schema, type Model, type Types } from "mongoose";
import { DURATION_UNIT, type DurationUnit } from "@/lib/constants";

export interface IMembershipPlan {
  _id: Types.ObjectId;
  gymId: Types.ObjectId;
  name: string;
  duration: number;
  durationUnit: DurationUnit;
  price: number;
  description: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const membershipPlanSchema = new Schema<IMembershipPlan>(
  {
    gymId: { type: Schema.Types.ObjectId, ref: "Gym", required: true, index: true },
    name: { type: String, required: true, trim: true },
    duration: { type: Number, required: true, min: 1 },
    durationUnit: {
      type: String,
      enum: Object.values(DURATION_UNIT),
      default: DURATION_UNIT.MONTH,
    },
    price: { type: Number, required: true, min: 0 },
    description: { type: String, default: "" },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

export const MembershipPlanModel: Model<IMembershipPlan> =
  (mongoose.models.MembershipPlan as Model<IMembershipPlan>) ??
  mongoose.model<IMembershipPlan>("MembershipPlan", membershipPlanSchema);
