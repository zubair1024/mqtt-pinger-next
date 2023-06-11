import mongoose, { Schema, model } from "mongoose";

export interface IPing {
  eventTime: Date;
  message: string;
}

const PingSchema = new Schema<IPing>(
  {
    eventTime: Date,
    message: String,
  },
  {
    timeseries: {
      timeField: "eventTime",
    },
  }
);
export const Ping = mongoose.models.Ping || model<IPing>("Ping", PingSchema);
