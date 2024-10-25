import express, { Express, Request, Response } from "express";
import dotenv from "dotenv";
import dicome from "./api/dicome.js";
import modelGetter from "./api/modelGetter.js";
import session from "express-session";
import { JSONValue } from "./utils/jsonHelper.js";

dotenv.config();

// Augment express-session with a custom SessionData object
declare module "express-session" {
  interface SessionData {
    inputModels: {
      left: JSONValue;
      right: JSONValue;
    };
  }
}

const app: Express = express();
const port = 8080;

app.use(
  session({
    secret: "secret-key-dummy",
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 21600000 }, // session timeout of 6 hours
  })
);

app.get("/", (req: Request, res: Response) => {
  res.send("Express + TypeScript Server is alive");
});

app.use("/dicome/model", modelGetter);

app.use("/dicome", dicome);

app.listen(port, () => {
  console.log(`⚡️[server]: Server is running at http://localhost:${port}`);
});
