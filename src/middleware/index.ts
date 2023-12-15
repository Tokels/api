import { Express } from "express";
import Logging from "../lib/Logging";

export const logRequest = (app: Express) => {
  try {
    app.use((req, res, next) => {
      Logging.info(`❔ Req METHOD: [${req.method}] - URL: [${req.url}]`);

      res.on("finish", () => {
        Logging.info(`❕ Res METHOD: [${req.method}] - URL: [${req.url}]`);
      });

      next();
    });
  } catch (err) {
    Logging.error(err);
  }
};
