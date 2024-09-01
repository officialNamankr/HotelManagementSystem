import {
  Listener,
  Subjects,
  RoomUpdatedEvent,
  RoomStatus,
} from "@homestay.com/hms_common";
import { Room } from "../../models/room";
import { queueGroupName } from "./queue-group-name";
import { Message } from "node-nats-streaming";

export class RoomUpdatedListener extends Listener<RoomUpdatedEvent> {
  readonly subject = Subjects.RoomUpdated;
  queueGroupName = queueGroupName;

  async onMessage(data: RoomUpdatedEvent["data"], msg: Message) {
    const { id, name, description, roomPrice } = data;

    const room = await Room.findByEvent(data);

    if (!room) {
      throw new Error("Room not found");
    }

    room.set({ name, description, roomPrice });

    await room.save();
    msg.ack();
  }
}
