import { Message } from "node-nats-streaming";
import {
  Listener,
  RoomCreatedEvent,
  Subjects,
  RoomStatus,
} from "@homestay.com/hms_common";
import { Room } from "../models/room";
import { queueGroupName } from "./queue-group-name";

export class RoomCreatedListener extends Listener<RoomCreatedEvent> {
  subject: Subjects.RoomCreated = Subjects.RoomCreated;
  queueGroupName = queueGroupName;
  async onMessage(data: RoomCreatedEvent["data"], msg: Message) {
    const { id, name, description } = data;
    const room = Room.build({
      id,
      name,
      description,
      roomStatus: RoomStatus.VACANT,
    });
    await room.save();
    msg.ack();
  }
}
