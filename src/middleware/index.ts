import { Express } from "express";
import Logging from "../lib/Logging";
import cors from "cors";
import cookieParser from "cookie-parser";

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

export const setCors = (app: Express) => {
  const CLIENT_URL = <string>process.env.CLIENT_URL;
  const allowedOrigins = CLIENT_URL
    ? [CLIENT_URL]
    : ["http://127.0.0.1:5173", "http://localhost:5173"];
  const options: cors.CorsOptions = {
    origin: allowedOrigins,
  };

  app.use(cors(options));
};

export const listen = (app: Express) => {
  const port = process.env.PORT || 8080;
  app.listen(port, () => {
    Logging.info(`💻 [server]: Running on port ${port}`);
  });
};

export const useCookies = (app: Express) => {
  app.use(cookieParser());
};
