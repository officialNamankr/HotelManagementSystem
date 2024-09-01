import express, { Request, Response } from "express";
import { Reservation } from "../models/reservation";
import { requireAuth, requireRoles, UserType } from "@homestay.com/hms_common";
const router = express.Router();

router.get(
  "/api/reservations",
  requireAuth,
  requireRoles(UserType.HOTEL_ADMIN, UserType.HOTEL_OWNER),
  async (req: Request, res: Response) => {
    const reservations = await Reservation.find({});
    res.send(reservations);
  }
);

export { router as indexReservationsRouter };
