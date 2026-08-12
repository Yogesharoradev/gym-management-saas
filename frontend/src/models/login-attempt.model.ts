import mongoose, { Schema, type Model, type Types } from "mongoose";

export interface ILoginAttempt {
  _id: Types.ObjectId;
  identifier: string;
  count: number;
  lockedUntil: Date | null;
  updatedAt: Date;
  createdAt: Date;
}

const loginAttemptSchema = new Schema<ILoginAttempt>(
  {
    identifier: { type: String, required: true, unique: true },
    count: { type: Number, default: 0 },
    lockedUntil: { type: Date, default: null },
  },
  { timestamps: true },
);

// Auto-expire stale attempt records after 1 hour of inactivity.
loginAttemptSchema.index({ updatedAt: 1 }, { expireAfterSeconds: 3600 });

export const LoginAttemptModel: Model<ILoginAttempt> =
  (mongoose.models.LoginAttempt as Model<ILoginAttempt>) ??
  mongoose.model<ILoginAttempt>("LoginAttempt", loginAttemptSchema);
