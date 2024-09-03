import {
  Listener,
  Subjects,
  ReservationCreatedEvent,
  RoomStatus,
} from "@homestay.com/hms_common";

import { Message } from "node-nats-streaming";
import { Maintainance } from "../models/maintainance";
import { queueGroupName } from "./queue-group-name";

export class ReservationCreatedListener extends Listener<ReservationCreatedEvent> {
  subject: Subjects.ReservationCreated = Subjects.ReservationCreated;
  queueGroupName = queueGroupName;

  async onMessage(data: ReservationCreatedEvent["data"], msg: Message) {
    const { id, roomId, checkIn, checkOut, status } = data;

    const currentDate = new Date(checkIn);
    const endDate = new Date(checkOut);

    while (currentDate <= endDate) {
      const maintainance = Maintainance.build({
        reservationId: id,
        roomId: roomId,
        maintainanceDate: currentDate,
        maintananceStatus: RoomStatus.MAINTAINANCE_PENDING,
      });
      await maintainance.save();
      currentDate.setDate(currentDate.getDate() + 1);
    }

    msg.ack();
  }
}
