import express, { Express, Request, Response } from "express";
import dotenv from "dotenv";
import dicome from "./api/dicome.js";
import modelGetter from "./api/modelGetter.js";
import session from "express-session";
import { InputModels } from "./interfaces/inputmodels.js";
import { DiffModel } from "./interfaces/diffmodel.js";

dotenv.config();

// Augment express-session with a custom SessionData object
declare module "express-session" {
  export interface SessionData {
    inputModels: InputModels;
    diffModel: DiffModel;
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

app.use(express.json());

app.get("/", (req: Request, res: Response) => {
  res.send("Server is alive. You can call dicome API.");
});

app.use("/dicome/model", modelGetter);

app.use("/dicome", dicome);

app.listen(port, () => {
  console.log(`⚡️[server]: Server is running at http://localhost:${port}`);
});
