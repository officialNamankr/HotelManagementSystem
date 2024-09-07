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
import { newTaxRouter } from "./routes/newTax";
import { updateTaxRouter } from "./routes/updateTax";
import { indexBillRouter } from "./routes/indexBill";

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
app.use(indexBillRouter);
app.use(newTaxRouter);
app.use(updateTaxRouter);

app.all("*", async (req, res) => {
  throw new NotFoundError();
});

app.use(errorHandler);

export { app };
