import express, { Express, Request, Response } from "express";
import dotenv from "dotenv";
import dicome from "./api/dicome.js";

dotenv.config();

const app: Express = express();
const port = 8080;

app.get("/", (req: Request, res: Response) => {
  res.send("Express + TypeScript Server is alive");
});

app.use("/dicome", dicome);

app.listen(port, () => {
  console.log(`⚡️[server]: Server is running at http://localhost:${port}`);
});
