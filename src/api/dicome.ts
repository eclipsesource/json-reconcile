import { Router } from "express";
import { compare } from "../services/compare.js";
import { InputModels } from "../interfaces/inputmodels.js";

const dicome = Router();

dicome.post("/compare", (req, res) => {
  if (req.body !== null) {
    req.session.regenerate((err) => {
      if (err) {
        res.send(500);
      }
    });

    const reqInputModels: InputModels = req.body;
    req.session.inputModels = reqInputModels;

    compare(req.session.inputModels);
    res.send(200);
  } else {
    if (
      req.session.inputModels === null ||
      req.session.inputModels === undefined
    ) {
      res.send(500);
    } else {
      compare(req.session.inputModels);
      res.send(200);
    }
  }
});

dicome.put("/apply/ltr", (req, res) => {
  res.send(200);
});

dicome.put("/apply/rtl", (req, res) => {
  res.send(200);
});

dicome.put("/accept", (req, res) => {
  res.send(200);
});

dicome.put("/reject", (req, res) => {
  res.send(200);
});

dicome.delete("/session", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.log(err);
      res.send(500);
    } else {
      res.send(200);
    }
  });
});

export default dicome;
