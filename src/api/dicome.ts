import { Router } from "express";
import { createDiff } from "../services/createDiff.js";
import { getInputModelsOrError } from "../utils/prepInputModels.js";

const dicome = Router();

/**
 * Compare two models and detect conflicts
 *
 * @param {InputModels} req.body - The first operand
 * @returns {DiffModel} The sum of both operands
 */
dicome.post("/compare", (req, res) => {
  console.log("request body", req.body);
  const inputModelsOrError = getInputModelsOrError(req.body, req.session);

  if (typeof inputModelsOrError === "string") {
    console.log(inputModelsOrError);
    res.status(500).send(inputModelsOrError);
  } else {
    const diffModel = createDiff(inputModelsOrError);
    req.session.diffModel = diffModel;
    res.send(diffModel);
  }
});

/**
 * Apply differences
 *
 * for conflicts: if this is a left change then right automatically rejected and vis a versa
 *
 * @param {number[]} req.body - list of the IDs of 1-n changes to apply
 * @returns {object} JSON patch (if technically possible) of diff model and left/right
 */
dicome.put("/apply", (req, res) => {
  // TODO
  res.sendStatus(200);
});

/**
 * Discard differences
 *
 * for conflicts: if this is a left change then right automatically accepted and vis a versa
 *
 * @param {number[]} req.body - list of the IDs of 1-n changes to discard
 * @returns {object} JSON patch (if technically possible) of diff model and left/right
 */
dicome.put("/discard", (req, res) => {
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
