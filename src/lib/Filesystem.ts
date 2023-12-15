import { Auth } from "../models/Auth";
import fs from "fs";
import path from "path";
import Logging from "./Logging";
import { DataPointers } from "../models/Users";

export const readAuthFile = (): Array<Auth> => {
  const data = fs.readFileSync(
    path.join(__dirname, `../../src/data/auth.json`),
    "utf8"
  );
  Logging.process("📖 [server]: Reading database");
  if (data) {
    return JSON.parse(data);
  } else {
    throw new Error("Database is empty");
  }
};

export const writeAuthFile = (data: Array<Auth>) => {
  try {
    if (!fs.existsSync(path.join(__dirname, `../../src/data/auth.json`))) {
      throw new Error(
        `Internal servor error: the auth collection does not exist`
      );
    }
    fs.writeFileSync(
      path.join(__dirname, `../../src/data/auth.json`),
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

export const readUsersFile = (): DataPointers => {
  const data = fs.readFileSync(
    path.join(__dirname, `../../src/data/users.json`),
    "utf8"
  );
  Logging.process("📖 [server]: Reading database");
  if (data) {
    return JSON.parse(data);
  } else {
    throw new Error("Database is empty");
  }
};
