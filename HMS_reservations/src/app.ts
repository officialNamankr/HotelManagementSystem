import express from "express";
import "express-async-errors";
import { json } from "body-parser";
import cookieSession from "cookie-session";
import cors from "cors";
import {
  currentUser,
  errorHandler,
  NotFoundError,
} from "@homestay.com/hms_common";
import { newReservationRouter } from "./routes/new";
import { indexReservationsRouter } from "./routes/index";
import { showReservationRouter } from "./routes/show";
import { checkOutRouter } from "./routes/checkout";

const app = express();
app.set("trust proxy", true);
app.use(json());
app.use(
  cookieSession({
    signed: false,
    secure: true,
  })
);
app.use(cors());
app.use(currentUser);
app.use(newReservationRouter);
app.use(indexReservationsRouter);
app.use(showReservationRouter);
app.use(checkOutRouter);

app.all("*", async (req, res) => {
  throw new NotFoundError();
});

app.use(errorHandler);

export { app };
