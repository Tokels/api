import { NextFunction, Request, Response } from "express";
import { Auth, initAuth } from "../models/Auth";
import { v4 } from "uuid";
import Logging from "../lib/Logging";
import { readFile, writeFile } from "../lib/Filesystem";
import { validateID } from "../utils/validators";

const findAuth = (users: Auth[], id: string): Auth => {
  const auth = users.find((auth) => auth.id === id);
  if (!auth) {
    throw new Error("Invalid ID: Can't find auth");
  }
  return auth;
};

const authenticateAuth = (req: Request, res: Response, next: NextFunction) => {
  const { email, password } = req.body;
  try {
    if (!email && !password) {
      Logging.warning(
        "[server]: Bad Request: missing email & password from client"
      );
      return res.status(400).json("Please provide both email & passowrd").end();
    }
    Logging.process("👮 [server]: Authenticating Auth");
    const users = readFile("users");
    const auth = users.find(
      (auth) => auth.email === email && auth.password === password
    );
    if (auth) {
      Logging.process("🎉 [server]: Credentials matched!");
      Logging.process("🚀 [server]: Sending token to client");
      return res.json("valid-token");
    } else {
      Logging.warning("[server]: Bad Request: credentials don't match");
      return res.status(400).json("Credentials don't match");
    }
  } catch (err: any) {
    Logging.error(err.message);
    return res.status(500).json(err.message).end();
  }
};

const createAuth = async (req: Request, res: Response, next: NextFunction) => {
  const { email, password } = req.body;
  try {
    if (!email && !password) {
      Logging.warning(
        "[server]: Bad Request: missing email & password from client"
      );
      return res.status(400).json("Please provide both email & passowrd").end();
    }
    Logging.process("🔍 [server]: Creating Auth");
    const users = readFile("users");
    if (users.find((auth) => auth.email === email)) {
      Logging.warning("[server]: Bad Request: email already exists");
      return res.status(400).json("Email already exists").end();
    }
    const id = v4();
    const newAuth = { id, email, password };
    users.push(newAuth);
    writeFile("users", users);
    Logging.process("🎉 [server]: Auth created");
    Logging.process("🚀 [server]: Valid token sent to client");
    return res.json("valid-token");
  } catch (err: any) {
    if (err && err.code === "ENOENT") {
      Logging.error(`[server]: ${err.message}`);
      return res.status(500).json(err.message).end();
    }
    Logging.warning(`[server]: ${err.message}`);
    return res.status(400).json(err.message).end();
  }
};

const readAuth = (req: Request, res: Response, next: NextFunction) => {
  const { _id: id } = req.params;
  Logging.process("🔍 [server]: Searching for Auth");
  try {
    validateID(id);
    const data = readFile("users");
    const auth = data.find((auth) => auth.id === id);
    if (!auth) {
      throw new Error("Could'nt find Auth");
    }
    Logging.process("🎉 [server]: Found Auth");
    const { password: _, ...u } = auth;
    Logging.process("🚀 [server]: Auth sent to client");
    return res.json(u);
  } catch (err: any) {
    if (err && err.code === "ENOENT") {
      Logging.error(`[server]: ${err.message}`);
      return res.status(500).json(err.message).end();
    }
    Logging.warning(`[server]: ${err.message}`);
    return res.status(400).json(err.message).end();
  }
};

const updateAuth = async (req: Request, res: Response, next: NextFunction) => {
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
    const auth = findAuth(users, id);
    const newAuths = users.map((auth) => {
      if (auth.id === id) {
        if (users.find((u) => u.email === body.email && u.id !== id)) {
          throw new Error("Email already exists");
        }
        return { ...auth, ...body };
      }
      return auth;
    });
    writeFile("users", newAuths);
    const { password: _, ...u } = auth;
    return res.json(u);
  } catch (err: any) {
    if (err && err.code === "ENOENT") {
      Logging.error(`[server]: ${err.message}`);
      return res.status(500).json(err.message).end();
    }
    Logging.warning(`[server]: ${err.message}`);
    return res.status(400).json(err.message).end();
  }
};

const deleteAuth = (req: Request, res: Response, next: NextFunction) => {
  const { _id: id } = req.params;
  try {
    validateID(id);
    const users = readFile("users");
    const auth = findAuth(users, id);
    const index = users.indexOf(auth);
    users.splice(index, 1);
    writeFile("users", users);
    return res.json({ msg: "Successfully deleted auth" });
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
  createAuth,
  readAuth,
  updateAuth,
  deleteAuth,
  authenticateAuth,
};
