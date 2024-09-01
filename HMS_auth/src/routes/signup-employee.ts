import express, { Request, Response } from "express";
import { body } from "express-validator";
import { User } from "../models/user";
import {
  NotAuthorizeError,
  requireAuth,
  UserType,
  requireRoles,
} from "@homestay.com/hms_common";
import { BadRequestError, validateRequest } from "@homestay.com/hms_common";

const router = express.Router();

router.post(
  "/api/users/signup-employee",
  requireAuth,
  requireRoles(UserType.HOTEL_OWNER, UserType.HOTEL_ADMIN),
  [
    body("email")
      .toLowerCase()
      .not()
      .isEmpty()
      .withMessage("Email must not be empty"),
    body("password")
      .trim()
      .isLength({ min: 4, max: 20 })
      .withMessage("Password must be between 4 and 20 characters"),
    body("name").not().isEmpty().withMessage("Name must not be empty"),
    body("mobile")
      .not()
      .isEmpty()
      .isLength({ min: 10, max: 10 })
      .withMessage("Invalid mobile number"),
    body("role")
      .custom((value) => {
        if (!Object.values(UserType).includes(value)) {
          throw new BadRequestError("Invalid role value provided");
        }
        return true;
      })
      .withMessage("Invalid role value"),
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    const { email, password, name, mobile, role } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new BadRequestError("Email in use");
    }

    if (
      req.currentUser!.role == UserType.HOTEL_ADMIN &&
      ![UserType.HOTEL_STAFF, UserType.CUSTOMER].includes(role as UserType)
    ) {
      throw new BadRequestError("Invalid role");
    }

    const user = User.build({
      email,
      password,
      name,
      mobile,
      role,
      createdBy: req.currentUser!.id,
    });
    await user.save();

    res.status(201).send(user);
  }
);

export { router as EmployeeSignUpRouter };
