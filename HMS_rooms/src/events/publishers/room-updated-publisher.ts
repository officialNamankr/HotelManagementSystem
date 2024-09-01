import {
  RoomUpdatedEvent,
  Subjects,
  Publisher,
} from "@homestay.com/hms_common";

export class RoomUpdatedPublisher extends Publisher<RoomUpdatedEvent> {
  readonly subject = Subjects.RoomUpdated;
}
