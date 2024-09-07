import express, { Request, Response } from "express";
import { body } from "express-validator";
import mongoose from "mongoose";
import {
  requireAuth,
  requireRoles,
  validateRequest,
  BadRequestError,
  UserType,
  NotAuthorizeError,
  ReservationStatus,
} from "@homestay.com/hms_common";
import { Reservation } from "../models/reservation";
import { natsWrapper } from "../nats-wrapper";
import { ReservationCheckoutPublisher } from "../events/publisher/reservation-checkout-publisher";

const router = express.Router();

router.patch(
  "/api/reservations/checkout/:reservationId",
  requireAuth,
  requireRoles(UserType.HOTEL_ADMIN, UserType.HOTEL_OWNER, UserType.CUSTOMER),
  async (req: Request, res: Response) => {
    const reservation = await Reservation.findById(req.params.reservationId);
    if (!reservation) {
      throw new BadRequestError("Reservation not found");
    }
    console.log(req.currentUser!.role);

    if (req.currentUser!.role === UserType.CUSTOMER) {
      if (reservation.userId.toString() !== req.currentUser!.id) {
        throw new NotAuthorizeError();
      }
    }
    reservation.set({
      status: ReservationStatus.CHECKED_OUT,
      checkOut: new Date(),
      updatedAt: new Date(),
      updatedBy: req.currentUser!.id,
    });
    await reservation.save();
    await new ReservationCheckoutPublisher(natsWrapper.client).publish({
      id: reservation.id,
      checkIn: reservation.checkIn,
      checkOut: reservation.checkOut,
      status: reservation.status,
      roomPrice: reservation.roomPrice,
      version: reservation.version,
    });

    res.status(200).send(reservation);
  }
);

export { router as checkOutRouter };
