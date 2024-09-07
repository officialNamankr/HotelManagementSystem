import express, { Request, Response } from "express";
import { body } from "express-validator";
import {
  requireAuth,
  validateRequest,
  UserType,
  requireRoles,
} from "@homestay.com/hms_common";
import { updateTaxRate } from "../helper/TaxRateHelper";

const router = express.Router();

router.put(
  "/api/billing/tax/:id",
  requireAuth,
  requireRoles(UserType.HOTEL_ADMIN, UserType.HOTEL_OWNER),
  [body("taxRate").not().isEmpty().withMessage("taxRate is Mandatory")],
  validateRequest,
  async (req: Request, res: Response) => {
    const { taxRate } = req.body;
    const taxId = req.params.id;
    const tax = await updateTaxRate(taxId, taxRate);
    res.status(200).send(tax);
  }
);

export { router as updateTaxRouter };
