import express, { Express, Request, Response } from "express";
import dotenv from "dotenv";
import Logging from "./lib/Logging";
import { listen, logRequest, setCors, useCookies } from "./middleware";
import userRoutes from "./routes/User";

dotenv.config();

const app: Express = express();

/** Connect to Server */

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

/** Middlewares */
logRequest(app);
setCors(app);
useCookies(app);
listen(app);

/** Routes */
app.use("/api/users", userRoutes);

// Test route
app.get("/api/ping", (req: Request, res: Response) => {
  res.send("pong");
  res.end();
});

export default app;
