import { Router } from "express";

const modelGetter = Router();

modelGetter.get("/left", (req, res) => {
  const sessionData = req.session;

  if (sessionData.inputModels === null) {
    res.send(500);
  }

  res.send(req.session.inputModels?.left);
});

modelGetter.get("/right", (req, res) => {
  const sessionData = req.session;

  if (sessionData.inputModels === null) {
    res.send(500);
  }

  res.send(req.session.inputModels?.right);
});

modelGetter.get("/diff", (req, res) => {
  res.send(200);
});

export default modelGetter;
