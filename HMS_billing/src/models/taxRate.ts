import mongoose from "mongoose";
import { updateIfCurrentPlugin } from "mongoose-update-if-current";
interface taxAttrs {
  taxName: string;
  taxRate: number;
}

export interface taxDoc extends mongoose.Document {
  taxName: string;
  taxRate: number;
  updatedDate: Date;
  version: number;
}

interface taxModel extends mongoose.Model<taxDoc> {
  build(attrs: taxAttrs): taxDoc;
}

const taxSchema = new mongoose.Schema(
  {
    taxName: {
      type: String,
      required: true,
      unique: true,
    },
    taxRate: {
      type: Number,
      required: true,
    },
    updatedDate: {
      type: Date,
      default: Date.now,
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

taxSchema.statics.build = (attrs: taxAttrs) => {
  return new Tax(attrs);
};

taxSchema.set("versionKey", "version");
taxSchema.plugin(updateIfCurrentPlugin);

const Tax = mongoose.model<taxDoc, taxModel>("Tax", taxSchema);

export { Tax };
