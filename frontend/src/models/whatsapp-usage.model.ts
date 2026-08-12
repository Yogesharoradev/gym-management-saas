import mongoose, { Schema, type Model, type Types } from "mongoose";

export interface IWhatsAppUsage {
  _id: Types.ObjectId;
  gymId: Types.ObjectId;
  month: string;
  messagesSent: number;
  messagesIncluded: number;
  extraMessages: number;
  createdAt: Date;
  updatedAt: Date;
}

const whatsAppUsageSchema = new Schema<IWhatsAppUsage>(
  {
    gymId: { type: Schema.Types.ObjectId, ref: "Gym", required: true, index: true },
    month: { type: String, required: true },
    messagesSent: { type: Number, default: 0 },
    messagesIncluded: { type: Number, default: 0 },
    extraMessages: { type: Number, default: 0 },
  },
  { timestamps: true },
);

whatsAppUsageSchema.index({ gymId: 1, month: 1 }, { unique: true });

export const WhatsAppUsageModel: Model<IWhatsAppUsage> =
  (mongoose.models.WhatsAppUsage as Model<IWhatsAppUsage>) ??
  mongoose.model<IWhatsAppUsage>("WhatsAppUsage", whatsAppUsageSchema);
