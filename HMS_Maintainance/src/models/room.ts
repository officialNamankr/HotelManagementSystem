import mongoose from "mongoose";
import { updateIfCurrentPlugin } from "mongoose-update-if-current";
import { RoomStatus } from "@homestay.com/hms_common";

interface roomAttrs {
  id: string;
  name: string;
  description: string;
  roomStatus: string;
}

interface roomDoc extends mongoose.Document {
  name: string;
  description: string;
  roomStatus: string;
  version: number;
}

interface roomModel extends mongoose.Model<roomDoc> {
  build(attrs: roomAttrs): roomDoc;
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
    roomStatus: {
      type: String,
      required: true,
      enum: Object.values(RoomStatus),
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
  return new Room(attrs);
};

const Room = mongoose.model<roomDoc, roomModel>("Room", roomSchema);

export { Room };
