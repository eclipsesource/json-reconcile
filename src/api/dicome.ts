import { Router } from "express";
import { getInputModelsOrError, prepForPatch } from "../utils/prepInput.js";
import * as comparissonMergingService from "../services/comparisonMerging.service.js";
import * as patchingService from "../services/patching.service.js";

const dicome = Router();

/**
 * Compare two models and detect conflicts
 *
 * @param {InputModels} req.body
 * @returns {DiffModel}
 */
dicome.post("/compare", (req, res) => {
  console.log("request body", req.body);
  const inputModelsOrError = getInputModelsOrError(req.body, req.session);

  if (typeof inputModelsOrError === "string") {
    console.log(inputModelsOrError);
    res.status(400).send(inputModelsOrError);
  } else {
    const diffModel = comparissonMergingService.createDiff(inputModelsOrError);
    req.session.diffModel = diffModel;
    res.send(diffModel);
  }
});

/**
 * Apply differences
 * @description for conflict: opposing change is automatically rejected (DISCARD)
 * 
 * changes State of respective differences in DiffModel
 *
 * @param {leftIds: number[], rightIds: number[]} req.body - json with a list of DiffModel Differences IDs coming from left and right side
 * @returns {object} JSON patch
 * 
 */
dicome.put("/apply", (req, res) => {
  const userInputOrError = prepForPatch(req.body, req.session);

  if (typeof userInputOrError === "string") {
    res.status(400).send(userInputOrError);
  } else {
    const applyResp = patchingService.applyDifferences(userInputOrError.leftIds as number[], userInputOrError.rightIds as number[], userInputOrError.diffmodel);

    res.sendStatus(applyResp);
  }

    // TODO: Test if diff model in sess is really overwritten ???

});

/**
 * Discard differences
 * @description if conflict: opposing difference will NOT be applied automatical
 * 
 * changes State of respective differences in DiffModel
 *
 * @param {leftIds: number[], rightIds: number[]} req.body - json with a list of DiffModel Differences IDs coming from left and right side
 * @returns {object} JSON patch
 * Sideeffect: 
 */
dicome.put("/discard", (req, res) => {
  const userInputOrError = prepForPatch(req.body, req.session);

  if (typeof userInputOrError === "string") {
    res.status(400).send(userInputOrError);
  } else {
    const discardResp = patchingService.discardDifferences(userInputOrError.leftIds as number[], userInputOrError.rightIds as number[], userInputOrError.diffmodel);

    res.sendStatus(discardResp);
  }

  // TODO: Test if diff model in sess is really overwritten ???
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
