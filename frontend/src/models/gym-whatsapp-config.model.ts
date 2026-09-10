import mongoose, { Schema, type Model, type Types } from "mongoose";

export interface IGymWhatsAppConfig {
  _id: Types.ObjectId;
  gymId: Types.ObjectId;
  enabled: boolean;
  phoneNumberId: string;
  businessAccountId: string;
  accessToken: string;
  createdAt: Date;
  updatedAt: Date;
}

const gymWhatsAppConfigSchema = new Schema<IGymWhatsAppConfig>(
  {
    gymId: {
      type: Schema.Types.ObjectId,
      ref: "Gym",
      required: true,
      unique: true,
      index: true,
    },
    enabled: { type: Boolean, default: false },
    phoneNumberId: { type: String, default: "", trim: true },
    businessAccountId: { type: String, default: "", trim: true },
    accessToken: { type: String, default: "" },
  },
  { timestamps: true },
);

export const GymWhatsAppConfigModel: Model<IGymWhatsAppConfig> =
  (mongoose.models.GymWhatsAppConfig as Model<IGymWhatsAppConfig>) ??
  mongoose.model<IGymWhatsAppConfig>("GymWhatsAppConfig", gymWhatsAppConfigSchema);
