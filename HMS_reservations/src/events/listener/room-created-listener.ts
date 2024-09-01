import {
  Listener,
  Subjects,
  RoomCreatedEvent,
  RoomStatus,
} from "@homestay.com/hms_common";
import { Room } from "../../models/room";
import { queueGroupName } from "./queue-group-name";
import { Message } from "node-nats-streaming";

export class RoomCreatedListener extends Listener<RoomCreatedEvent> {
  readonly subject = Subjects.RoomCreated;
  queueGroupName = queueGroupName;

  async onMessage(data: RoomCreatedEvent["data"], msg: Message) {
    const { id, name, description, roomPrice } = data;

    const room = Room.build({
      id: id,
      name: name,
      description: description,
      roomPrice: roomPrice,
    });
    await room.save();
    msg.ack();
  }
}
