import mongoose from "mongoose";
import { RoomStatus, RoomType } from "@homestay.com/hms_common";

interface RoomAttrs {
  name: string;
  description: string;
  createdBy: string;
  roomType: RoomType;
  roomPrice: number;
  roomStatus?: RoomStatus;
  roomImage?: string;
  roomCapacity: number;
  roomBedType: string;
  roomBedCount: number;
  roomWifi: boolean;
  roomAC: boolean;
  roomView: string;
  roomFloor: number;
  roomOccupancy: number;
}

interface RoomDoc extends mongoose.Document {
  name: string;
  description: string;
  createdBy: string;
  roomType: RoomType;
  roomPrice: number;
  roomStatus: RoomStatus;
  roomImage: string;
  roomCapacity: number;
  roomBedType: string;
  roomBedCount: number;
  roomWifi: boolean;
  roomAC: boolean;
  roomView: string;
  roomFloor: number;
  roomOccupancy: number;
  createDate: Date;
  updateDate: Date;
  OrderId?: string;
}

interface RoomModel extends mongoose.Model<RoomDoc> {
  build(attrs: RoomAttrs): RoomDoc;
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
    createdBy: {
      type: String,
      required: true,
      select: false,
    },
    roomType: {
      type: String,
      required: true,
      enum: Object.values(RoomType),
    },
    roomPrice: {
      type: Number,
      required: true,
    },
    roomStatus: {
      type: String,
      required: true,
      enum: Object.values(RoomStatus),
      default: RoomStatus.VACANT,
    },
    roomImage: {
      type: String,
    },
    roomCapacity: {
      type: Number,
      required: true,
    },
    roomBedType: {
      type: String,
      required: true,
    },
    roomBedCount: {
      type: Number,
      required: true,
    },
    roomWifi: {
      type: Boolean,
      required: true,
    },
    roomAC: {
      type: Boolean,
      required: true,
    },
    roomView: {
      type: String,
      required: true,
    },
    roomFloor: {
      type: Number,
      required: true,
    },
    roomOccupancy: {
      type: Number,
      required: true,
    },
    createDate: {
      type: mongoose.Schema.Types.Date,
      required: true,
      default: Date.now(),
      select: false,
    },
    updateDate: {
      type: mongoose.Schema.Types.Date,
      required: true,
      default: Date.now(),
      select: false,
    },
    OrderId: {
      type: String,
      select: false,
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

roomSchema.statics.build = (attrs: RoomAttrs) => {
  return new Room(attrs);
};

const Room = mongoose.model<RoomDoc, RoomModel>("Room", roomSchema);

export { Room };
