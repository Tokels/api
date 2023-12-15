import { NextFunction, Request, Response } from "express";
import Logging from "../lib/Logging";
import { readUsersFile } from "../lib/Filesystem";
import { validateID } from "../utils/validators";
import { Card } from "../models/Users";

const createUserObj = (id: string): any => {
  const dataPointers = readUsersFile();
  const cardsData = dataPointers.cards;
  const userData = dataPointers.private.find((user) => user.id === id);
  if (userData) Logging.process("🎉 [server]: Found User");

  const card = cardsData.find((card) => card.id === id);
  if (card) Logging.process("🎉 [server]: Found User Card");

  const userCardsPointers = userData?.cards;
  const cards = cardsData.filter(
    (card: Card) =>
      card.id !== id && userCardsPointers?.filter(() => card.id === id)
  );
  if (cards) Logging.process("🎉 [server]: Found User Cards");

  const userCardGroupsPointers = userData?.card_groups;
  const card_groups = userCardGroupsPointers?.map((pointersArray) =>
    pointersArray.map((pointer) =>
      cardsData.find((cardID) => cardID.id === pointer)
    )
  );
  if (card_groups) Logging.process("🎉 [server]: Found User Cards Group");

  Logging.process("🚀 [server]: User data sent to client");
  return { ...userData, card, cards, card_groups };
};

const readUser = (req: Request, res: Response, next: NextFunction) => {
  const { _id: id } = req.params;
  Logging.process("🔍 [server]: Searching for User data");
  try {
    validateID(id);
    return res.json(createUserObj(id));
  } catch (err: any) {
    if (err && err.code === "ENOENT") {
      Logging.error(`[server]: ${err.message}`);
      return res.status(500).json(err.message).end();
    }
    Logging.warning(`[server]: ${err.message}`);
    return res.status(400).json(err.message).end();
  }
};

export default {
  readUser,
};
