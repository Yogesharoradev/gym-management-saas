import mongoose, { Schema, type Model, type Types } from "mongoose";
import { ROLES, type Role } from "@/lib/constants";

export interface IUser {
  _id: Types.ObjectId;
  gymId: Types.ObjectId | null;
  name: string;
  email: string;
  passwordHash: string;
  role: Role;
  isActive: boolean;
  mustChangePassword: boolean;
  passwordChangedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    gymId: { type: Schema.Types.ObjectId, ref: "Gym", default: null, index: true },
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: Object.values(ROLES), required: true },
    isActive: { type: Boolean, default: true },
    mustChangePassword: { type: Boolean, default: false },
    passwordChangedAt: { type: Date, default: null },
  },
  { timestamps: true },
);

export const UserModel: Model<IUser> =
  (mongoose.models.User as Model<IUser>) ?? mongoose.model<IUser>("User", userSchema);
