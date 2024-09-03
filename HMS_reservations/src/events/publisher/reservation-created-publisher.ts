import {
  Publisher,
  Subjects,
  ReservationStatus,
  ReservationCreatedEvent,
} from "@homestay.com/hms_common";

export class ReservationCreatedPublisher extends Publisher<ReservationCreatedEvent> {
  readonly subject = Subjects.ReservationCreated;
}
