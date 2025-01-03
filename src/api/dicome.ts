import { Router } from "express";
import { compare } from "../services/compare.js";
import { InputModels } from "../interfaces/inputmodels.js";

const dicome = Router();

dicome.post("/compare", (req, res) => {
  console.log("request body", req.body);
  if (req.body.left && req.body.right) {
    console.log("session regenerate");
    req.session.regenerate((err) => {
      if (err) {
        console.log("Error occured at session regeneration");
        res.sendStatus(500);
      }
    });

    const reqInputModels: InputModels = req.body;
    req.session.inputModels = reqInputModels;

    compare(req.session.inputModels);
    res.sendStatus(200);
  } else {
    if (
      req.session.inputModels === null ||
      req.session.inputModels === undefined
    ) {
      res.status(500).send("req body empty and session not found");
    } else {
      console.log(
        "body is null, models from session are taken for comparisson"
      );
      compare(req.session.inputModels);
      res.sendStatus(200);
    }
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
