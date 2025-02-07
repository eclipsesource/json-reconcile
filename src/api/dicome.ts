import { Router } from "express";
import { compare } from "../services/compare.js";
import { getInputModelsOrError } from "../utils/prepInputModels.js";

const dicome = Router();

dicome.post("/compare", (req, res) => {
  console.log("request body", req.body);
  const inputModelsOrError = getInputModelsOrError(req.body, req.session);

  if (typeof inputModelsOrError === "string") {
    console.log(inputModelsOrError);
    res.status(500).send(inputModelsOrError);
  } else {
    const diffModel = compare(inputModelsOrError);
    req.session.diffModel = diffModel;
    res.send(diffModel);
  }
});

dicome.put("/apply/ltr", (req, res) => {
  // TODO
  res.sendStatus(200);
});

dicome.put("/apply/rtl", (req, res) => {
  // TODO
  res.sendStatus(200);
});

dicome.put("/accept", (req, res) => {
  // TODO
  res.sendStatus(200);
});

dicome.put("/reject", (req, res) => {
  // TODO
  res.sendStatus(200);
});

dicome.delete("/session", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.log(err);
      res.sendStatus(500);
    } else {
      res.sendStatus(200);
    }
  });
});

export default dicome;
