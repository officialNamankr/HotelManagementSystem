import express, { Request, Response } from "express";
import { requireAuth } from "@homestay.com/hms_common";

const router = express.Router();

router.post(
  "/api/users/signout",
  requireAuth,
  (req: Request, res: Response) => {
    req.session = null;

    res.status(200).send({
      status: "success",
      message: "Logged out successfully",
    });
  }
);

export { router as SignOutRouter };
