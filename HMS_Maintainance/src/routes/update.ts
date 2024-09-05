import express, { Request, Response } from "express";
import { body, param } from "express-validator";
import mongoose from "mongoose";
import {
  requireAuth,
  requireRoles,
  validateRequest,
  UserType,
  BadRequestError,
  RoomStatus,
} from "@homestay.com/hms_common";
import { Maintainance } from "../models/maintainance";
const router = express.Router();
router.patch(
  "/api/maintainance/:id",
  requireAuth,
  requireRoles(
    UserType.HOTEL_OWNER,
    UserType.HOTEL_ADMIN,
    UserType.HOTEL_STAFF
  ),
  [
    param("id")
      .not()
      .isEmpty()
      .custom((value) => {
        if (!mongoose.Types.ObjectId.isValid(value)) {
          throw new BadRequestError("Invalid maintainance id provided");
        }
        return true;
      })
      .withMessage("Date must not be empty"),
    body("maintananceStatus")
      .optional()
      .custom((value) => {
        if (!Object.values(RoomStatus).includes(value)) {
          throw new BadRequestError("Invalid maintainance status provided");
        }
      })
      .withMessage("Invalid maintainance status provided"),
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    const { data } = req.body;
    console.log(req.body);

    if (!req.body) {
      throw new BadRequestError("No data provided");
    }

    const maintainance = await Maintainance.findById(req.params.id);
    if (!maintainance) {
      throw new BadRequestError("Maintainance not found");
    }
    if (req.body && (req.body.reservationId || req.body.roomId)) {
      throw new BadRequestError("Permission denied for this action");
    }
    if (
      req.body &&
      req.body.assignedTo &&
      ![UserType.HOTEL_OWNER, UserType.HOTEL_ADMIN].includes(
        req.currentUser!.role
      )
    ) {
      throw new BadRequestError(
        `Permission denied for this action for ${req.currentUser!.role}`
      );
    }

    if (
      req.body &&
      (req.body.maintananceDescription || req.body.maintananceStatus) &&
      ![
        UserType.HOTEL_OWNER,
        UserType.HOTEL_ADMIN,
        UserType.HOTEL_STAFF,
      ].includes(req.currentUser!.role)
    ) {
      throw new BadRequestError(
        `Permission denied for this action for ${req.currentUser!.role}`
      );
    }

    if (req.body && req.body.assignedTo) {
      maintainance.set({
        assignedTo: req.body.assignedTo,
        assignedBy: req.currentUser!.id,
      });
    }

    if (req.body && req.body.maintananceDescription) {
      maintainance.set({
        maintananceDescription: req.body.maintananceDescription,
      });
    }

    if (req.body && req.body.maintananceStatus) {
      maintainance.set({ maintananceStatus: req.body.maintananceStatus });
    }
    maintainance.set({ updatedAt: new Date() });
    maintainance.set({ updtedBy: req.currentUser!.id });
    await maintainance.save();

    res.status(200).send(maintainance);
  }
);

export { router as updateMaintainanceRouter };
