import mongoose from "mongoose";
import { updateIfCurrentPlugin } from "mongoose-update-if-current";
import { roomDoc } from "./room";
import { ReservationStatus } from "@homestay.com/hms_common";
interface reservationAttrs {
  userId: string;
  room: roomDoc;
  checkIn: Date;
  checkOut: Date;
  status: ReservationStatus;
  roomPrice: number;
  totalPrice: number;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
}

interface reservationDoc extends mongoose.Document {
  userId: string;
  room: roomDoc;
  checkIn: Date;
  checkOut: Date;
  roomPrice: number;
  totalPrice: number;
  status: ReservationStatus;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  version: number;
}

interface reservationModel extends mongoose.Model<reservationDoc> {
  build(attrs: reservationAttrs): reservationDoc;
}

const reservationSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
    },
    room: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Room",
    },
    checkIn: {
      type: mongoose.Schema.Types.Date,
      required: true,
    },
    checkOut: {
      type: mongoose.Schema.Types.Date,
      required: true,
    },
    status: {
      type: String,
      required: true,
      enum: Object.values(ReservationStatus),
      default: ReservationStatus.CREATED,
    },
    roomPrice: {
      type: Number,
      required: true,
    },
    totalPrice: {
      type: Number,
      required: true,
    },
    customerName: {
      type: String,
      required: true,
    },
    customerEmail: {
      type: String,
      required: true,
    },
    customerPhone: {
      type: String,
      required: true,
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

reservationSchema.set("versionKey", "version");
reservationSchema.plugin(updateIfCurrentPlugin);

reservationSchema.statics.build = (attrs: reservationAttrs) => {
  return new Reservation(attrs);
};

const Reservation = mongoose.model<reservationDoc, reservationModel>(
  "Reservation",
  reservationSchema
);

export { Reservation };
