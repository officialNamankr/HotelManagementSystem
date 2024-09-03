import express, { Request, Response } from "express";
import { body, param } from "express-validator";
import {
  requireAuth,
  requireRoles,
  validateRequest,
  UserType,
} from "@homestay.com/hms_common";
import { Maintainance } from "../models/maintainance";

const router = express.Router();

router.get(
  "/api/maintainance/:date",
  requireAuth,
  requireRoles(UserType.HOTEL_OWNER, UserType.HOTEL_ADMIN),
  [
    param("date")
      .not()
      .isEmpty()
      .custom((value) => {
        const date = new Date(value);
        if (isNaN(date.getTime())) {
          throw new Error("Invalid date provided");
        }
        return true;
      })
      .withMessage("Date must not be empty"),
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    const { date } = req.params;
    const maintainance = await Maintainance.find({
      maintainanceDate: date,
    });
    res.status(200).send(maintainance);
  }
);

export { router as indexDateWiseRouter };
