import mongoose, { Schema, type Model, type Types } from "mongoose";
import {
  GENDER,
  MEMBER_STATUS,
  type Gender,
  type MemberStatus,
} from "@/lib/constants";

export interface IMember {
  _id: Types.ObjectId;
  gymId: Types.ObjectId;
  name: string;
  phone: string;
  email: string;
  gender: Gender;
  dateOfBirth: Date | null;
  address: string;
  emergencyContact: string;
  photo: string | null;
  joiningDate: Date;
  status: MemberStatus;
  createdAt: Date;
  updatedAt: Date;
}

const memberSchema = new Schema<IMember>(
  {
    gymId: { type: Schema.Types.ObjectId, ref: "Gym", required: true, index: true },
    name: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    email: { type: String, default: "", lowercase: true, trim: true },
    gender: { type: String, enum: Object.values(GENDER), default: GENDER.MALE },
    dateOfBirth: { type: Date, default: null },
    address: { type: String, default: "" },
    emergencyContact: { type: String, default: "" },
    photo: { type: String, default: null },
    joiningDate: { type: Date, default: () => new Date() },
    status: {
      type: String,
      enum: Object.values(MEMBER_STATUS),
      default: MEMBER_STATUS.ACTIVE,
      index: true,
    },
  },
  { timestamps: true },
);

memberSchema.index({ gymId: 1, phone: 1 });

export const MemberModel: Model<IMember> =
  (mongoose.models.Member as Model<IMember>) ??
  mongoose.model<IMember>("Member", memberSchema);
