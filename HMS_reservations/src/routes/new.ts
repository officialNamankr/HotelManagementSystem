import express, { Request, Response } from "express";
import mongoose from "mongoose";
import { body } from "express-validator";
import {
  requireAuth,
  validateRequest,
  BadRequestError,
  ReservationStatus,
  UserType,
  requireRoles,
} from "@homestay.com/hms_common";
import { Reservation } from "../models/reservation";
import { Room } from "../models/room";

const router = express.Router();

router.post(
  "/api/reservations",
  requireAuth,
  requireRoles(UserType.HOTEL_OWNER, UserType.HOTEL_ADMIN, UserType.CUSTOMER),
  [
    body("checkIn").not().isEmpty().withMessage("CheckIn must not be empty"),
    body("checkOut").not().isEmpty().withMessage("CheckOut must not be empty"),
    body("checkOut").custom((value, { req }) => {
      if (new Date(value) <= new Date(req.body.checkIn)) {
        throw new BadRequestError(
          "CheckOut date must be later than CheckIn date"
        );
      }
      return true;
    }),
    body("roomId")
      .not()
      .isEmpty()
      .custom((value) => {
        if (!mongoose.Types.ObjectId.isValid(value)) {
          throw new BadRequestError("Invalid room id provided");
        }
        return true;
      })
      .withMessage("Invalid room id provided"),
    body("customerName")
      .not()
      .isEmpty()
      .withMessage("Customer Name must not be empty"),
    body("customerEmail")
      .not()
      .isEmpty()
      .isEmail()
      .withMessage("Enter valid email"),
    body("customerMobile")
      .not()
      .isEmpty()
      .isLength({ min: 10, max: 10 })
      .withMessage("Customer Mobile must not be empty"),
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    const {
      checkIn,
      checkOut,
      roomId,
      customerName,
      customerMobile,
      customerEmail,
    } = req.body;
    const room = await Room.findById(roomId);
    if (!room) {
      throw new BadRequestError("Room not found");
    }
    const existingReservation = await Reservation.findOne({
      room: room,

      $or: [
        {
          checkIn: { $lt: checkOut },
          checkOut: { $gt: checkIn },
        },
        {
          checkIn: { $gte: checkIn, $lt: checkOut },
        },
        {
          checkOut: { $gt: checkIn, $lte: checkOut },
        },
      ],

      status: {
        $in: [
          ReservationStatus.RESERVED,
          ReservationStatus.CHECKED_IN,
          ReservationStatus.CREATED,
          ReservationStatus.AWAITING_PAYMENT,
          ReservationStatus.PAYMENT_COMPLETED,
          ReservationStatus.WAITING,
          ReservationStatus.NO_SHOW,
        ],
      },
    });

    if (existingReservation) {
      throw new BadRequestError("Room is already reserved");
    }

    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);
    var days = Math.ceil(
      Math.abs(checkOutDate.getTime() - checkInDate.getTime()) /
        (1000 * 60 * 60 * 24)
    );
    const totalPrice = room.roomPrice * days;

    const reservation = Reservation.build({
      userId: req.currentUser!.id,
      room: room,
      checkIn: checkInDate,
      checkOut: checkOutDate,
      status: ReservationStatus.CREATED,
      roomPrice: room.roomPrice,
      totalPrice: totalPrice,
      customerName: customerName,
      customerEmail: customerEmail,
      customerPhone: customerMobile,
    });
    await reservation.save();
    res.status(201).send(reservation);
  }
);

export { router as newReservationRouter };
