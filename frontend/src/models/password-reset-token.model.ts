import mongoose, { Schema, type Model, type Types } from "mongoose";

export interface IPasswordResetToken {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  tokenHash: string;
  expiresAt: Date;
  usedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const passwordResetTokenSchema = new Schema<IPasswordResetToken>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    tokenHash: { type: String, required: true, unique: true },
    expiresAt: { type: Date, required: true },
    usedAt: { type: Date, default: null },
  },
  { timestamps: true },
);

// Auto-remove expired tokens.
passwordResetTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const PasswordResetTokenModel: Model<IPasswordResetToken> =
  (mongoose.models.PasswordResetToken as Model<IPasswordResetToken>) ??
  mongoose.model<IPasswordResetToken>("PasswordResetToken", passwordResetTokenSchema);
