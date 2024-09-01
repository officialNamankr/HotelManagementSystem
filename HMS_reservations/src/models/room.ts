import mongoose, { version } from "mongoose";
import { updateIfCurrentPlugin } from "mongoose-update-if-current";
import { Reservation } from "./reservation";
import { RoomStatus, ReservationStatus } from "@homestay.com/hms_common";

interface roomAttrs {
  id: string;
  name: string;
  description: string;
  // roomType: string;
  roomPrice: number;
  // roomStatus: RoomStatus;
  // roomCapacity: number;
  // roomBedType: string;
  // roomBedCount: number;
  // roomWifi: boolean;
  // roomAC: boolean;
  // roomView: string;
  // roomFloor: number;
  // roomOccupancy: number;
}

export interface roomDoc extends mongoose.Document {
  name: string;
  description: string;
  // roomType: string;
  roomPrice: number;
  // roomStatus: RoomStatus;
  // roomCapacity: number;
  // roomBedType: string;
  // roomBedCount: number;
  // roomWifi: boolean;
  // roomAC: boolean;
  // roomView: string;
  // roomFloor: number;
  // roomOccupancy: number;
  // createDate: Date;
  // updateDate: Date;
  version: number;
  isReserved(): Promise<boolean>;
}

interface roomModel extends mongoose.Model<roomDoc> {
  build(attrs: roomAttrs): roomDoc;
  findByEvent(event: { id: string; version: number }): Promise<roomDoc | null>;
}

const roomSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    roomPrice: {
      type: Number,
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

roomSchema.set("versionKey", "version");
roomSchema.plugin(updateIfCurrentPlugin);
roomSchema.statics.build = (attrs: roomAttrs) => {
  return new Room({
    _id: attrs.id,
    name: attrs.name,
    description: attrs.description,
    // roomType: attrs.roomType,
    roomPrice: attrs.roomPrice,
    // roomStatus: attrs.roomStatus,
    // roomCapacity: attrs.roomCapacity,
    // roomBedType: attrs.roomBedType,
    // roomBedCount: attrs.roomBedCount,
    // roomWifi: attrs.roomWifi,
    // roomAC: attrs.roomAC,
    // roomView: attrs.roomView,
    // roomFloor: attrs.roomFloor,
    // roomOccupancy: attrs.roomOccupancy,
  });
};

roomSchema.statics.findByEvent = (event: { id: string; version: number }) => {
  return Room.findOne({
    _id: event.id,
    version: event.version - 1,
  });
};

roomSchema.methods.isReserved = async function () {
  const existingReservation = await Reservation.findOne({
    room: this,
    status: {
      $in: [
        ReservationStatus.RESERVED,
        ReservationStatus.CHECKED_IN,
        ReservationStatus.CREATED,
        ReservationStatus.AWAITING_PAYMENT,
        ReservationStatus.PAYMENT_COMPLETED,
        ReservationStatus.WAITING,
        ReservationStatus.NO_SHOW,
      ],
    },
  });
  return !!existingReservation;
};

const Room = mongoose.model<roomDoc, roomModel>("Room", roomSchema);

export { Room };
