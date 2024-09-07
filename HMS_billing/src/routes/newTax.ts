import express, { Request, Response } from "express";
import { body } from "express-validator";
import {
  requireAuth,
  validateRequest,
  UserType,
  requireRoles,
} from "@homestay.com/hms_common";
import { setTaxRate } from "../helper/TaxRateHelper";

const router = express.Router();

router.post(
  "/api/billing/tax",
  requireAuth,
  requireRoles(UserType.HOTEL_ADMIN, UserType.HOTEL_OWNER),
  [
    body("taxName").not().isEmpty().withMessage("Tax name is required"),
    body("taxRate").not().isEmpty().withMessage("Tax rate is required"),
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    const { taxName, taxRate } = req.body;
    const tax = await setTaxRate(taxName, taxRate);
    res.status(201).send(tax);
  }
);

export { router as newTaxRouter };
