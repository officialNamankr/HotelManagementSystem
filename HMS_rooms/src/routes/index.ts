import express, { Request, Response } from "express";
import { Room } from "../models/room";
const router = express.Router();

router.get("/api/rooms", async (req: Request, res: Response) => {
  const rooms = await Room.find({});
  res.send(rooms);
});

export { router as indexRoomsRouter };
