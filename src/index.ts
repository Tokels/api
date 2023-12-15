import express, { Express, Request, Response } from "express";
import dotenv from "dotenv";
import Logging from "./lib/Logging";
import cors from "cors";
import cookieParser from "cookie-parser";
import { logRequest } from "./middleware";
import userRoutes from "./routes/User";

dotenv.config();

const app: Express = express();

/** Connect to Server */
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

/** Middlewares */
logRequest(app);
const CLIENT_URL = <string>process.env.CLIENT_URL;
const allowedOrigins = CLIENT_URL
  ? [CLIENT_URL]
  : ["http://127.0.0.1:8081", "http://localhost:8081"];
const options: cors.CorsOptions = {
  origin: allowedOrigins,
};

app.use(cors(options));
app.use(cookieParser());

/** Routes */
app.use("/api/users", userRoutes);

// Test route
app.get("/api/ping", (req: Request, res: Response) => {
  res.send("pong");
  res.end();
});

const port = process.env.PORT || 8080;

app.listen(port, () => {
  Logging.info(`💻 [server]: Running on port ${port}`);
});

export default app;
