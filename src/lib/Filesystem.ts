import { Auth } from "../models/Auth";
import { Collections } from "../models/Collections";
import fs from "fs";
import path from "path";
import Logging from "./Logging";

export const readFile = (collection: Collections): Array<Auth> => {
  const data = fs.readFileSync(
    path.join(__dirname, `../../src/data/${collection}.json`),
    "utf8"
  );
  Logging.process("📖 [server]: Reading database");
  if (data) {
    return JSON.parse(data);
  } else {
    throw new Error("Database is empty");
  }
};

export const writeFile = (collection: Collections, data: Array<Auth>) => {
  try {
    if (
      !fs.existsSync(path.join(__dirname, `../../src/data/${collection}.json`))
    ) {
      throw new Error(
        `Internal servor error: the ${collection} collection does not exist`
      );
    }
    fs.writeFileSync(
      path.join(__dirname, `../../src/data/${collection}.json`),
      JSON.stringify(data),
      "utf8"
    );
    Logging.process("📝 [server]: Writing in database");
    return;
  } catch (err: any) {
    Logging.error(err.message);
    throw err;
  }
};
