import { BadRequestError, validateRequest } from "@homestay.com/hms_common";
import express, { Request, Response } from "express";
import { body } from "express-validator";
import { User } from "../models/user";
import jwt from "jsonwebtoken";
import { UserType } from "@homestay.com/hms_common";

const router = express.Router();

router.post(
  "/api/users/signup",
  [
    body("email").not().isEmpty().withMessage("Email must not be empty"),
    body("password")
      .trim()
      .isLength({ min: 4, max: 20 })
      .withMessage("Password must be between 4 and 20 characters"),
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
    const { email, password, role } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new BadRequestError("Email in use");
    }
    let userRole = role || UserType.CUSTOMER;

    const user = User.build({
      email,
      password,
      role: userRole,
      createdBy: "SELF",
    });
    await user.save();
    const userJwt = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
      },
      process.env.JWT_KEY!
    );

    req.session = {
      jwt: userJwt,
    };
    res.status(201).send(user);
  }
);

export { router as signupRouter };
