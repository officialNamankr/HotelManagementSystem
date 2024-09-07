import {
  Listener,
  Subjects,
  ReservationCheckoutEvent,
  ReservationStatus,
} from "@homestay.com/hms_common";
import { Message } from "node-nats-streaming";
import { queueGroupName } from "./queue-group-name";
import { Billing } from "../../models/billing";
import { getTaxRate } from "../../helper/TaxRateHelper";

export class ReservationCheckoutListener extends Listener<ReservationCheckoutEvent> {
  readonly subject = Subjects.ReservationUpdated;
  queueGroupName = queueGroupName;
  async onMessage(data: ReservationCheckoutEvent["data"], msg: Message) {
    console.log(`Message received: ${this.subject} / ${this.queueGroupName}`);

    const { id, checkIn, checkOut, status, version, roomPrice } = data;
    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);
    var days = Math.ceil(
      Math.abs(checkOutDate.getTime() - checkInDate.getTime()) /
        (1000 * 60 * 60 * 24)
    );
    const totalAmountBeforeTax = roomPrice * days;
    const taxRate = await getTaxRate("gstRate");
    const taxAmount = totalAmountBeforeTax * (taxRate / 100);
    const totalAmountAfterTax = totalAmountBeforeTax + taxAmount;

    const billing = Billing.build({
      reservationId: id,
      checkIn: checkIn,
      checkOut: checkOut,
      amountBeforeTax: totalAmountBeforeTax,
      tax: taxAmount,
      amountAfterTax: totalAmountAfterTax,
      paymentStatus: ReservationStatus.PAYMENT_COMPLETED,
      paymentMethod: "Cash",
      paymentDate: new Date(),
      roomPrice: roomPrice,
      currency: "INR",
    });
    await billing.save();
    msg.ack();
  }
}
