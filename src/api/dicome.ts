import { Router } from "express";

const dicome = Router();

dicome.post("/compare", (req, res) => {
  const sessionData = req.session;

  if (sessionData.inputModels === null) {
    const { modelA, modelB } = req.body;

    req.session.inputModels = { left: modelA, right: modelB };
  }

  res.send(200);
});

dicome.put("/apply/ [ltr | rtl]", (req, res) => {
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
