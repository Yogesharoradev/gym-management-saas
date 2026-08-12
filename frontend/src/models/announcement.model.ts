import mongoose, { Schema, type Model, type Types } from "mongoose";
import {
  ANNOUNCEMENT_RECIPIENT,
  ANNOUNCEMENT_STATUS,
  type AnnouncementRecipient,
  type AnnouncementStatus,
} from "@/lib/constants";

export interface IAnnouncement {
  _id: Types.ObjectId;
  gymId: Types.ObjectId;
  title: string;
  message: string;
  recipientType: AnnouncementRecipient;
  scheduledAt: Date | null;
  sentAt: Date | null;
  createdBy: Types.ObjectId | null;
  status: AnnouncementStatus;
  createdAt: Date;
  updatedAt: Date;
}

const announcementSchema = new Schema<IAnnouncement>(
  {
    gymId: { type: Schema.Types.ObjectId, ref: "Gym", required: true, index: true },
    title: { type: String, required: true, trim: true },
    message: { type: String, required: true },
    recipientType: {
      type: String,
      enum: Object.values(ANNOUNCEMENT_RECIPIENT),
      default: ANNOUNCEMENT_RECIPIENT.ALL,
    },
    scheduledAt: { type: Date, default: null },
    sentAt: { type: Date, default: null },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", default: null },
    status: {
      type: String,
      enum: Object.values(ANNOUNCEMENT_STATUS),
      default: ANNOUNCEMENT_STATUS.DRAFT,
      index: true,
    },
  },
  { timestamps: true },
);

export const AnnouncementModel: Model<IAnnouncement> =
  (mongoose.models.Announcement as Model<IAnnouncement>) ??
  mongoose.model<IAnnouncement>("Announcement", announcementSchema);
