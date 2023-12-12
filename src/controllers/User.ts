import { NextFunction, Request, Response } from "express";
import { Auth, Token, initAuth } from "../models/User";
import fs from "fs";
import path from "path";
import { v4 } from "uuid";
import { stringify } from "querystring";
import Logging from "../lib/Logging";
import { logRequest } from "../middleware";
import { Collections } from "../models/Collections";

const uuidRegex =
  /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;

const readFile = (collection: Collections): Array<Auth> => {
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

const writeFile = (collection: Collections, data: Auth[]) => {
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

const validateID = (id: string) => {
  if (!id) {
    throw Error("Please provide user ID as url params");
  }
  if (!uuidRegex.test(id)) {
    throw Error("Please provide valid ID");
  }
};

const findUser = (users: Auth[], id: string): Auth => {
  const user = users.find((user) => user.id === id);
  if (!user) {
    throw new Error("Invalid ID: Can't find user");
  }
  return user;
};

const authenticateUser = (req: Request, res: Response, next: NextFunction) => {
  const { email, password } = req.body;
  try {
    if (!email && !password) {
      Logging.warning(
        "[server]: Bad Request: missing email & password from client"
      );
      return res
        .status(400)
        .json({ err: "Please provide both email & passowrd" })
        .end();
    }
    Logging.process("👮 [server]: Authenticating User");
    const users = readFile("users");
    const user = users.find(
      (user) => user.email === email && user.password === password
    );
    if (user) {
      const token: Token = "valid-token";
      res.json({ token });
    } else {
      Logging.warning("[server]: Bad Request: credentials don't match");
      res.status(400).json({ err: "Credentials don't match" });
    }
    res.json(user);
  } catch {}
};

const createUser = async (req: Request, res: Response, next: NextFunction) => {
  const { email, password } = req.body;
  try {
    if (!email && !password) {
      Logging.warning(
        "[server]: Bad Request: missing email & password from client"
      );
      return res
        .status(400)
        .json({ err: "Please provide both email & passowrd" })
        .end();
    }
    Logging.process("🔍 [server]: Creating User");
    const users = readFile("users");
    if (users.find((user) => user.email === email)) {
      Logging.warning("[server]: Bad Request: email already exists");
      return res.status(400).json({ err: "Email already exists" }).end();
    }
    const id = v4();
    const token: Token = "valid-token";
    const newUser = { id, email, password };
    users.push(newUser);
    writeFile("users", users);
    Logging.process("🎉 [server]: User created");
    Logging.process("🚀 [server]: Valid token sent to client");
    return res.json({ token });
  } catch (err: any) {
    if (err && err.code === "ENOENT") {
      Logging.error(`[server]: ${err.message}`);
      return res.status(500).json({ err: err.message }).end();
    }
    Logging.warning(`[server]: ${err.message}`);
    return res.status(400).json({ err: err.message }).end();
  }
};

const readUser = (req: Request, res: Response, next: NextFunction) => {
  const { _id: id } = req.params;
  Logging.process("🔍 [server]: Searching for User");
  try {
    validateID(id);
    const data = readFile("users");
    const user = data.find((user) => user.id === id);
    if (!user) {
      throw new Error("Could'nt find User");
    }
    Logging.process("🎉 [server]: Found User");
    const { password: _, ...u } = user;
    Logging.process("🚀 [server]: User sent to client");
    return res.json(u);
  } catch (err: any) {
    if (err && err.code === "ENOENT") {
      Logging.error(`[server]: ${err.message}`);
      return res.status(500).json({ err: err.message }).end();
    }
    Logging.warning(`[server]: ${err.message}`);
    return res.status(400).json({ err: err.message }).end();
  }
};

const updateUser = async (req: Request, res: Response, next: NextFunction) => {
  const { _id: id } = req.params;
  const body = req.body;
  try {
    validateID(id);
    const initKeys = Object.keys(initAuth).map((key) => key);
    const keys = Object.keys(body).map((key) => key);
    keys.forEach((key) => {
      if (key === "token") {
        throw Error("Only server is allowed to update Token");
      }
      if (!initKeys.find((k) => key === k)) {
        throw Error(
          "The key you're trying to update does not exist on Auth model"
        );
      }
    });
    const users = readFile("users");
    const user = findUser(users, id);
    const newUsers = users.map((user) => {
      if (user.id === id) {
        if (users.find((u) => u.email === body.email && u.id !== id)) {
          throw new Error("Email already exists");
        }
        return { ...user, ...body };
      }
      return user;
    });
    writeFile("users", newUsers);
    const { password: _, ...u } = user;
    return res.json(u);
  } catch (err: any) {
    if (err && err.code === "ENOENT") {
      Logging.error(`[server]: ${err.message}`);
      return res.status(500).json({ err: err.message }).end();
    }
    Logging.warning(`[server]: ${err.message}`);
    return res.status(400).json({ err: err.message }).end();
  }
};

const deleteUser = (req: Request, res: Response, next: NextFunction) => {
  const { _id: id } = req.params;

  try {
    validateID(id);
    const users = readFile("users");
    const user = findUser(users, id);
    const index = users.indexOf(user);
    users.splice(index, 1);
    writeFile("users", users);
    return res.json({ msg: "Successfully deleted user" });
  } catch (err: any) {
    if (err && err.code === "ENOENT") {
      Logging.error(`[server]: ${err.message}`);
      return res.status(500).json({ err: err.message }).end();
    }
    Logging.warning(`[server]: ${err.message}`);
    return res.status(400).json({ err: err.message }).end();
  }
};

export default {
  createUser,
  readUser,
  updateUser,
  deleteUser,
  authenticateUser,
};
