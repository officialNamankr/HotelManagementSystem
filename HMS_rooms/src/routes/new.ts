import express, { Request, Response } from "express";
import { body } from "express-validator";
import {
  BadRequestError,
  NotAuthorizeError,
  requireAuth,
  requireRoles,
  validateRequest,
  UserType,
  RoomStatus,
  RoomType,
} from "@homestay.com/hms_common";
import { Room } from "../models/room";
import { natsWrapper } from "../nats-wrapper";
import { RoomCreatedPublisher } from "../events/publishers/room-created-publisher";

const router = express.Router();

router.post(
  "/api/rooms",
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
  validateRequest,
  async (req: Request, res: Response) => {
    console.log(req.body);
    const {
      name,
      description,
      roomPrice,
      roomType,
      roomCapacity,
      roomView,
      roomFloor,
      roomBedType,
      roomBedCount,
      roomWifi,
      roomAC,
      roomOccupancy,
    } = req.body;
    const room = Room.build({
      name,
      description,
      roomPrice,
      roomType,
      roomCapacity,
      roomView,
      roomFloor,
      roomBedType,
      roomBedCount,
      roomWifi,
      roomAC,
      roomOccupancy,
      roomStatus: RoomStatus.VACANT,
      createdBy: req.currentUser!.id,
    });
    await room.save();
    await new RoomCreatedPublisher(natsWrapper.client).publish({
      id: room.id,
      name: room.name,
      description: room.description,
      roomPrice: room.roomPrice,
      version: room.version,
    });
    res.status(201).send(room);
  }
);

export { router as newRoomRouter };
