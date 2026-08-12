import mongoose, { Schema, type Model, type Types } from "mongoose";

export interface IWeightRecord {
  _id: Types.ObjectId;
  gymId: Types.ObjectId;
  memberId: Types.ObjectId;
  weight: number;
  recordedAt: Date;
  recordedBy: Types.ObjectId | null;
  notes: string;
  createdAt: Date;
  updatedAt: Date;
}

const weightRecordSchema = new Schema<IWeightRecord>(
  {
    gymId: { type: Schema.Types.ObjectId, ref: "Gym", required: true, index: true },
    memberId: { type: Schema.Types.ObjectId, ref: "Member", required: true, index: true },
    weight: { type: Number, required: true, min: 0 },
    recordedAt: { type: Date, default: () => new Date() },
    recordedBy: { type: Schema.Types.ObjectId, ref: "User", default: null },
    notes: { type: String, default: "" },
  },
  { timestamps: true },
);

export const WeightRecordModel: Model<IWeightRecord> =
  (mongoose.models.WeightRecord as Model<IWeightRecord>) ??
  mongoose.model<IWeightRecord>("WeightRecord", weightRecordSchema);
