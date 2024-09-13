import { Router } from "express";

const dicome = Router();

dicome.post("/compare", (req, res) => {
  res.send(200);
});

dicome.get("/model/left", (req, res) => {
  res.send(200);
});

dicome.get("/model/right", (req, res) => {
  res.send(200);
});

dicome.get("/model/diff", (req, res) => {
  res.send(200);
});

dicome.put("/apply/ [ltr | rtl]", (req, res) => {
  // TODO: PUT / dicome / apply / [ltr | rtl];

  res.send(200);
});

dicome.put("/accept", (req, res) => {
  res.send(200);
});

dicome.put("/reject", (req, res) => {
  res.send(200);
});

dicome.delete("/session", (req, res) => {
  res.send(200);
});

export default dicome;
