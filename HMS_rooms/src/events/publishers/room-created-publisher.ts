import {
  RoomCreatedEvent,
  Subjects,
  Publisher,
} from "@homestay.com/hms_common";

export class RoomCreatedPublisher extends Publisher<RoomCreatedEvent> {
  readonly subject = Subjects.RoomCreated;
}
