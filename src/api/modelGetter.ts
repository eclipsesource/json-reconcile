import { Router } from "express";

const modelGetter = Router();

modelGetter.get("/left", (req, res) => {
  const sessionInputModels = req.session.inputModels;

  if (sessionInputModels === undefined) {
    res.sendStatus(500);
  } else {
    res.send(sessionInputModels.left);
  }
});

modelGetter.get("/right", (req, res) => {
  const sessionInputModels = req.session.inputModels;

  if (sessionInputModels === undefined) {
    res.sendStatus(500);
  } else {
    res.send(sessionInputModels.right);
  }
});

modelGetter.get("/original", (req, res) => {
  const sessionInputModels = req.session.inputModels;

  if (sessionInputModels === undefined) {
    res.sendStatus(500);
  } else if (sessionInputModels.original === undefined) {
    res.sendStatus(500);
  } else {
    res.send(sessionInputModels.original);
  }
});

modelGetter.get("/diff", (req, res) => {
  const sessionDiffModel = req.session.diffModel;

  if (sessionDiffModel === undefined) {
    res.sendStatus(500);
  } else {
    res.send(sessionDiffModel);
  }
});

export default modelGetter;
