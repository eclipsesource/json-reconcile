import * as jsondiffpatch from "jsondiffpatch";
import { Delta } from "jsondiffpatch";

import { JSONValue } from "../utils/jsonHelper.js";
import { InputModels } from "../interfaces/inputmodels.js";
import { DifferenceState, DiffModel } from "../interfaces/diffmodel.js";
import * as customJuuFormatter from "../utils/customFormatter.js";
import { CustomOp } from "../interfaces/util.js";
import defaultHashMatching from "../customisable/defaultHashMatching.js";
import { algoVariation, CONFIG } from "../config.js";
import { addUsedFlag, prepareDiffMap } from "../utils/prepInputModels.js";
import {
  nestedForLoopWorstImplementation,
  runtimeImprovedMapImplementations,
} from "./algo.js";

export function createDiff(inputModels: InputModels): DiffModel {
  if (inputModels.original === undefined) {
    console.log("2-Way Comparison");
    return createDiffModelFrom2WayDiff(
      createDiff2Way(inputModels.left, inputModels.right)
    );
  } else {
    console.log("3-Way Comparison");
    return createDiff3Way(
      inputModels.original,
      inputModels.left,
      inputModels.right
    );
  }
}

function createDiffModelFrom2WayDiff(operations: CustomOp[]): DiffModel {
  const diffModel: DiffModel = {
    threeWay: false,
    differencesL: [],
    differencesR: [],
    conflicts: [],
  };

  for (const op of operations) {
    diffModel.differencesL.push({
      id: 77, // TODO: what id to take?
      kind: op.op,
      state: DifferenceState.UNRESOLVED,
      path: op.path,
    });
  }

  return diffModel;
}

export function createDiff2Way(left: JSONValue, right: JSONValue): CustomOp[] {
  const delta = jsondiffpatch
    .create({
      objectHash: (obj) => {
        return defaultHashMatching(obj as Record<string, undefined>);
      },
    })
    .diff(left, right);

  const operations = customJuuFormatter.format(delta);

  return operations;
}

export function createDiff3Way(
  original: JSONValue,
  left: JSONValue,
  right: JSONValue
): DiffModel {
  let diffModel: DiffModel = {
    threeWay: true,
    differencesL: [],
    differencesR: [],
    conflicts: [],
  };

  const diffsLeft = createDiff2Way(original, left);

  const diffsRight = createDiff2Way(original, right);

  if (diffsLeft == undefined || diffsRight == undefined) {
    // left or right is the same as orginal, so no conflicts but differences

    if (diffsLeft === undefined) {
      for (const [i, diff] of diffsRight.entries()) {
        diffModel.differencesR.push({
          id: i, // TODO: maybe other id instead of index?
          kind: diff.op,
          path: diff.path,
          state: DifferenceState.UNRESOLVED,
        });
      }
    } else {
      for (const [i, diff] of diffsLeft.entries()) {
        diffModel.differencesL.push({
          id: i, // TODO: maybe other id instead of index?
          kind: diff.op,
          path: diff.path,
          state: DifferenceState.UNRESOLVED,
        });
      }
    }
    return diffModel;
  }

  console.log("jsonpatch result left", JSON.stringify(diffsLeft));
  console.log("jsonpatch result right", JSON.stringify(diffsRight));

  if (algoVariation.nested) {
    const diffsWithUsedFlagL = addUsedFlag(diffsLeft);
    const diffsWithUsedFlagR = addUsedFlag(diffsRight);

    // Populate differencesL and differencesR
    diffModel.differencesL = diffsWithUsedFlagL.map((diff, index) => ({
      id: index, // TODO: maybe other id instead of index?
      kind: diff.opInfo.op,
      state: DifferenceState.UNRESOLVED,
      path: diff.opInfo.path,
    }));

    diffModel.differencesR = diffsWithUsedFlagR.map((diff, index) => ({
      id: index, // TODO: maybe other id instead of index?
      kind: diff.opInfo.op,
      state: DifferenceState.UNRESOLVED,
      path: diff.opInfo.path,
    }));

    diffModel = nestedForLoopWorstImplementation(
      diffsWithUsedFlagL,
      diffsWithUsedFlagR,
      diffModel
    );
  }

  if (algoVariation.eficient) {
    const diffMapL = prepareDiffMap(diffsLeft);
    const diffMapR = prepareDiffMap(diffsRight);

    console.log("maps of left and right diffs");

    const diffListL = [
      ...diffMapL.add.values(),
      ...diffMapL.update.values(),
      ...diffMapL.delete.values(),
      ...diffMapL.move.values(),
    ];
    const diffListR = [
      ...diffMapR.add.values(),
      ...diffMapR.update.values(),
      ...diffMapR.delete.values(),
      ...diffMapR.move.values(),
    ];

    console.log(diffListL);
    console.log(diffListR);

    // Populate differencesL and differencesR
    diffModel.differencesL = diffListL.map((diff, index) => ({
      id: index, // TODO: maybe other id instead of index?
      kind: diff.opInfo.op,
      state: DifferenceState.UNRESOLVED,
      path: diff.opInfo.path,
    }));

    diffModel.differencesR = diffListR.map((diff, index) => ({
      id: index, // TODO: maybe other id instead of index?
      kind: diff.opInfo.op,
      state: DifferenceState.UNRESOLVED,
      path: diff.opInfo.path,
    }));

    diffModel = runtimeImprovedMapImplementations(
      diffMapL,
      diffMapR,
      diffModel
    );
  }

  return diffModel;
}

export function applyDiffDoPatch(original: unknown, delta: Delta) {
  const withHash = jsondiffpatch.create({
    objectHash: (obj) => {
      const objRecord = obj as Record<string, undefined>;
      console.log("objeect - any type");
      console.log(objRecord);
      return objRecord[CONFIG.IDENTIFIER];
    },
  });

  withHash.patch(original, delta);

  console.log(JSON.stringify(original));
  return original;
}

/* 
function improvedTextDiffTry() {
  const customDiffPatch = jsondiffpatch.create({
    // textDiff: {
    //   diffMatchPatch: {},
    //   minLength: 60, // default value
    // },
  });
} 
*/
