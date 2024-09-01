import express, { Request, Response } from "express";
import { body } from "express-validator";
import {
  BadRequestError,
  NotAuthorizeError,
  requireAuth,
  requireRoles,
  validateRequest,
  UserType,
  RoomType,
  RoomStatus,
} from "@homestay.com/hms_common";
import { Room } from "../models/room";
import { RoomUpdatedPublisher } from "../events/publishers/room-updated-publisher";
import { natsWrapper } from "../nats-wrapper";

const router = express.Router();

router.put(
  "/api/rooms/:id",
  requireAuth,
  requireRoles(UserType.HOTEL_OWNER, UserType.HOTEL_ADMIN),
  [
    body("name").not().isEmpty().withMessage("Name must not be empty"),
    body("description")
      .not()
      .isEmpty()
      .withMessage("Description must not be empty"),
    body("roomPrice")
      .isFloat({ gt: 0 })
      .withMessage("Price must be greater than 0"),
    body("roomType")
      .custom((value) => {
        if (!Object.values(RoomType).includes(value)) {
          throw new BadRequestError("Invalid room type provided");
        }
        return true;
      })
      .withMessage("Invalid room type provided"),
    body("roomStatus")
      .custom((value) => {
        if (!Object.values(RoomStatus).includes(value)) {
          throw new BadRequestError("Invalid room status provided");
        }
        return true;
      })
      .withMessage("Invalid room type provided"),
    body("roomCapacity")
      .isFloat({ gt: 0 })
      .withMessage("Capacity must be greater than 0"),
    body("roomBedCount")
      .isFloat({ gt: 0 })
      .withMessage("Bed count must be greater than 0"),
    body("roomBedType")
      .not()
      .isEmpty()
      .withMessage("Bed type must not be empty"),
    body("roomWifi")
      .isBoolean()
      .not()
      .isEmpty()
      .withMessage("Wifi status must be provided"),
    body("roomAC")
      .isBoolean()
      .not()
      .isEmpty()
      .withMessage("AC status must be provided"),
    body("roomView").not().isEmpty().withMessage("View must not be empty"),
    body("roomFloor")
      .isFloat({ gt: 0 })
      .not()
      .isEmpty()
      .withMessage("Floor must provided"),
    body("roomOccupancy")
      .isFloat({ gt: 0 })
      .withMessage("Occupancy must be greater than 0"),
  ],
  async (req: Request, res: Response) => {
    const room = await Room.findById(req.params.id);
    if (!room) {
      throw new BadRequestError("Room not found");
    }
    if (room.OrderId) {
      throw new BadRequestError("Room is occupied");
    }

    room.set({
      name: req.body.name,
      description: req.body.description,
      roomPrice: req.body.roomPrice,
      roomType: req.body.roomType,
      roomStatus: req.body.roomStatus,
      roomCapacity: req.body.roomCapacity,
      roomBedCount: req.body.roomBedCount,
      roomBedType: req.body.roomBedType,
      roomWifi: req.body.roomWifi,
      roomAC: req.body.roomAC,
      roomView: req.body.roomView,
      roomFloor: req.body.roomFloor,
      roomOccupancy: req.body.roomOccupancy,
      updatedAt: new Date(),
    });

    await room.save();
    await new RoomUpdatedPublisher(natsWrapper.client).publish({
      id: room.id,
      name: room.name,
      description: room.description,
      roomPrice: room.roomPrice,
      version: room.version,
    });
    res.status(200).send(room);
  }
);

export { router as updateRoomRouter };
