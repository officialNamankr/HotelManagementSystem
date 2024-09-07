import express, { Request, Response } from "express";
import { body } from "express-validator";
import { requireAuth, UserType, requireRoles } from "@homestay.com/hms_common";
import { Billing } from "../models/billing";

const router = express.Router();

router.get(
  "/api/billing",
  requireAuth,
  requireRoles(UserType.HOTEL_OWNER, UserType.HOTEL_ADMIN),
  async (req: Request, res: Response) => {
    const billings = await Billing.find({}).sort({ createdAt: -1 });
    res.status(200).send(billings);
  }
);

export { router as indexBillRouter };
