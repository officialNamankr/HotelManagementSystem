import {
  Publisher,
  Subjects,
  ReservationStatus,
  ReservationCheckoutEvent,
} from "@homestay.com/hms_common";

export class ReservationCheckoutPublisher extends Publisher<ReservationCheckoutEvent> {
  readonly subject = Subjects.ReservationUpdated;
}
