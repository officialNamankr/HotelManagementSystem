import { ReservationStatus } from "@homestay.com/hms_common";
import mongoose from "mongoose";
import { updateIfCurrentPlugin } from "mongoose-update-if-current";
interface BillingAttrs {
  reservationId: string;
  roomPrice: number;
  checkIn: Date;
  checkOut: Date;
  amountBeforeTax: number;
  tax: number;
  amountAfterTax: number;
  currency: string;
  paymentStatus: ReservationStatus;
  paymentMethod: string;
  paymentDate: Date;
}

interface BillingDoc extends mongoose.Document {
  reservationId: string;
  roomPrice: number;
  checkIn: Date;
  checkOut: Date;
  amountBeforeTax: number;
  tax: number;
  amountAfterTax: number;
  currency: string;
  paymentStatus: ReservationStatus;
  paymentMethod: string;
  paymentDate: Date;
  version: number;
}

interface BillingModel extends mongoose.Model<BillingDoc> {
  build(attrs: BillingAttrs): BillingDoc;
}

const billingSchema = new mongoose.Schema(
  {
    reservationId: {
      type: String,
      required: true,
    },
    roomPrice: {
      type: Number,
      required: true,
    },
    checkIn: {
      type: mongoose.Schema.Types.Date,
      required: true,
    },
    checkOut: {
      type: mongoose.Schema.Types.Date,
      required: true,
    },
    amountBeforeTax: {
      type: Number,
      required: true,
    },
    tax: {
      type: Number,
      required: true,
    },
    amountAfterTax: {
      type: Number,
      required: true,
    },
    currency: {
      type: String,
    },
    paymentStatus: {
      type: String,
      enum: Object.values(ReservationStatus),
    },
    paymentMethod: {
      type: String,
    },
    paymentDate: {
      type: Date,
    },
  },
  {
    toJSON: {
      transform(doc, ret) {
        ret.id = ret._id;
        delete ret._id;
      },
    },
  }
);

billingSchema.statics.build = (attrs: BillingAttrs) => {
  return new Billing(attrs);
};

billingSchema.set("versionKey", "version");
billingSchema.plugin(updateIfCurrentPlugin);

const Billing = mongoose.model<BillingDoc, BillingModel>(
  "Billing",
  billingSchema
);
export { Billing };
