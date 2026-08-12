import mongoose, { Schema, type Model, type Types } from "mongoose";
import { PAYMENT_METHOD, type PaymentMethod } from "@/lib/constants";

export interface IPayment {
  _id: Types.ObjectId;
  gymId: Types.ObjectId;
  memberId: Types.ObjectId;
  membershipId: Types.ObjectId | null;
  amount: number;
  paymentMethod: PaymentMethod;
  paymentDate: Date;
  transactionReference: string;
  notes: string;
  createdAt: Date;
  updatedAt: Date;
}

const paymentSchema = new Schema<IPayment>(
  {
    gymId: { type: Schema.Types.ObjectId, ref: "Gym", required: true, index: true },
    memberId: { type: Schema.Types.ObjectId, ref: "Member", required: true, index: true },
    membershipId: { type: Schema.Types.ObjectId, ref: "Membership", default: null },
    amount: { type: Number, required: true, min: 0 },
    paymentMethod: {
      type: String,
      enum: Object.values(PAYMENT_METHOD),
      default: PAYMENT_METHOD.CASH,
    },
    paymentDate: { type: Date, default: () => new Date(), index: true },
    transactionReference: { type: String, default: "" },
    notes: { type: String, default: "" },
  },
  { timestamps: true },
);

export const PaymentModel: Model<IPayment> =
  (mongoose.models.Payment as Model<IPayment>) ??
  mongoose.model<IPayment>("Payment", paymentSchema);
