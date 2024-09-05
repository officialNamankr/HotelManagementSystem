import mongoose from "mongoose";
import { updateIfCurrentPlugin } from "mongoose-update-if-current";
import { RoomStatus } from "@homestay.com/hms_common";
interface maintainanceAttrs {
  reservationId: string;
  roomId: string;
  maintainanceDate: Date;
  maintananceStatus?: RoomStatus;
  maintananceDescription?: string;
  updtedBy?: string;
  assignedBy?: string;
  assignedTo?: string;
  updatedAt?: Date;
}

interface maintainanceDoc extends mongoose.Document {
  reservationId: string;
  roomId: string;
  maintainanceDate: Date;
  maintananceStatus?: RoomStatus;
  maintananceDescription?: string;
  updtedBy?: string;
  assignedBy?: string;
  assignedTo?: string;
  updatedAt?: Date;
  version?: number;
}

interface maintainanceModel extends mongoose.Model<maintainanceDoc> {
  build(attrs: maintainanceAttrs): maintainanceDoc;
}

const maintainanceSchema = new mongoose.Schema(
  {
    reservationId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    roomId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    maintainanceDate: {
      type: mongoose.Schema.Types.Date,
      required: true,
    },
    maintananceStatus: {
      type: String,
      enum: Object.values(RoomStatus),
    },
    maintananceDescription: {
      type: String,
    },
    updtedBy: {
      type: String,
    },
    assignedBy: {
      type: mongoose.Schema.Types.ObjectId,
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
    },

    updatedAt: {
      type: mongoose.Schema.Types.Date,
      required: true,
      default: new Date(),
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

maintainanceSchema.set("versionKey", "version");
maintainanceSchema.plugin(updateIfCurrentPlugin);

maintainanceSchema.statics.build = (attrs: maintainanceAttrs) => {
  return new Maintainance(attrs);
};

const Maintainance = mongoose.model<maintainanceDoc, maintainanceModel>(
  "Maintainance",
  maintainanceSchema
);

export { Maintainance };
