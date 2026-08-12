import mongoose, { Schema, type Model, type Types } from "mongoose";
import {
  ATTENDANCE_SOURCE,
  ATTENDANCE_STATUS,
  type AttendanceSource,
  type AttendanceStatus,
} from "@/lib/constants";

export interface IAttendance {
  _id: Types.ObjectId;
  gymId: Types.ObjectId;
  memberId: Types.ObjectId;
  date: Date;
  checkInTime: Date | null;
  status: AttendanceStatus;
  markedBy: Types.ObjectId | null;
  source: AttendanceSource;
  createdAt: Date;
  updatedAt: Date;
}

const attendanceSchema = new Schema<IAttendance>(
  {
    gymId: { type: Schema.Types.ObjectId, ref: "Gym", required: true, index: true },
    memberId: { type: Schema.Types.ObjectId, ref: "Member", required: true, index: true },
    date: { type: Date, required: true, index: true },
    checkInTime: { type: Date, default: null },
    status: {
      type: String,
      enum: Object.values(ATTENDANCE_STATUS),
      default: ATTENDANCE_STATUS.PRESENT,
    },
    markedBy: { type: Schema.Types.ObjectId, ref: "User", default: null },
    source: {
      type: String,
      enum: Object.values(ATTENDANCE_SOURCE),
      default: ATTENDANCE_SOURCE.MANUAL,
    },
  },
  { timestamps: true },
);

attendanceSchema.index({ gymId: 1, memberId: 1, date: 1 }, { unique: true });

export const AttendanceModel: Model<IAttendance> =
  (mongoose.models.Attendance as Model<IAttendance>) ??
  mongoose.model<IAttendance>("Attendance", attendanceSchema);
