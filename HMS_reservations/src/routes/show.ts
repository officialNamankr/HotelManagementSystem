import express, { Request, Response } from "express";
import { param } from "express-validator";
import mongoose from "mongoose";
import {
  requireAuth,
  requireRoles,
  validateRequest,
} from "@homestay.com/hms_common";
import { Reservation } from "../models/reservation";
import { BadRequestError, UserType } from "@homestay.com/hms_common";

const router = express.Router();

router.get(
  "/api/reservations/:id",
  requireAuth,
  requireRoles(UserType.HOTEL_ADMIN, UserType.HOTEL_OWNER),
  [
    param("id")
      .not()
      .isEmpty()
      .custom((value) => {
        if (!mongoose.Types.ObjectId.isValid(value)) {
          throw new BadRequestError("Invalid reservation id provided");
        }
        return true;
      })
      .withMessage("Invalid reservation id provided"),
  ],
  async (req: Request, res: Response) => {
    const reservation = await Reservation.findById(req.params.id).populate(
      "room"
    );
    if (!reservation) {
      throw new BadRequestError("Reservation not found");
    }
    res.send(reservation);
  }
);

export { router as showReservationRouter };
