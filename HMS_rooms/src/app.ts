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
import { newRoomRouter } from "./routes/new";
import { indexRoomsRouter } from "./routes";

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
app.use(newRoomRouter);
app.use(indexRoomsRouter);

app.all("*", async (req, res) => {
  throw new NotFoundError();
});

app.use(errorHandler);

export { app };
