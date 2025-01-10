import * as jsondiffpatch from "jsondiffpatch";
import { Delta } from "jsondiffpatch";

import { JSONValue } from "../utils/jsonHelper.js";
import {
  DiffGroupByOpAndPath,
  DiffWithUsedFlag,
  InputModels,
} from "../interfaces/inputmodels.js";
import {
  isDeleteUseConflict,
  isDeletUpdateConflict,
  isMoveMoveConflict,
} from "../customisable/defaultConflictDetection.js";
import {
  Difference,
  DifferenceState,
  DiffModel,
} from "../interfaces/diffmodel.js";
import * as customJuuFormatter from "../utils/customFormatter.js";
import { DifferenceOperationKind } from "../interfaces/util.js";
import defaultHashMatching from "../customisable/defaultHashMatching.js";
import { algoVariation, CONFIG } from "../config.js";
import { addUsedFlag, prepareDiffMap } from "../utils/prepInputModels.js";

export function compare(inputModels: InputModels): DiffModel {
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

function createDiffModelFrom2WayDiff(
  operations: customJuuFormatter.Op[]
): DiffModel {
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

export function createDiff2Way(
  left: JSONValue,
  right: JSONValue
): customJuuFormatter.Op[] {
  const delta = jsondiffpatch
    .create({
      objectHash: (obj) => {
        return defaultHashMatching(obj as Record<string, string>);
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

  const diffMapL = prepareDiffMap(diffsLeft);
  const diffMapR = prepareDiffMap(diffsRight);

  console.log("maps of left and right diffs");
  console.log(JSON.stringify(diffMapL));
  console.log(JSON.stringify(diffMapR));

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

  if (algoVariation.nested) {
    diffModel = nestedForLoopWorstImplementation(
      diffsWithUsedFlagL,
      diffsWithUsedFlagR,
      diffModel
    );
  }

  if (algoVariation.eficient) {
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
      const objRecord = obj as Record<string, string>;
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

function nestedForLoopWorstImplementation(
  diffsLeft: DiffWithUsedFlag[],
  diffsRight: DiffWithUsedFlag[],
  diffModel: DiffModel
): DiffModel {
  for (const diffA of diffsLeft) {
    for (const diffB of diffsRight) {
      if (!diffA.used && !diffB.used) {
        if (diffA.opInfo.path === diffB.opInfo.path) {
          // --- same path
          if (
            diffA.opInfo.op === DifferenceOperationKind.ADD &&
            diffB.opInfo.op === DifferenceOperationKind.ADD
          ) {
            console.log("----------- INSERT INSERT CONFLICT :o -----------");
            console.log(JSON.stringify(diffA));
            console.log(JSON.stringify(diffB));

            addConflict(diffA, diffB, diffModel);
          } else if (
            diffA.opInfo.op === DifferenceOperationKind.UPDATE &&
            diffB.opInfo.op === DifferenceOperationKind.UPDATE
          ) {
            console.log(
              "----------- one way of UPDATE UPDATE CONFLICT :o -----------"
            );
            console.log(JSON.stringify(diffA));
            console.log(JSON.stringify(diffB));

            addConflict(diffA, diffB, diffModel);
          } else if (
            diffA.opInfo.op === DifferenceOperationKind.DELETE &&
            diffB.opInfo.op === DifferenceOperationKind.DELETE
          ) {
            console.log(
              "----------- PROBABLY MOVE MOVE CONFLICT :O -----------"
            );
            console.log(JSON.stringify(diffA));
            console.log(JSON.stringify(diffB));

            if (isMoveMoveConflict(diffsLeft, diffA, diffsRight, diffB)) {
              console.log("YES - it is move move conflict");

              addConflict(diffA, diffB, diffModel);
            }
          }
          // ---- not same path
        } else if (
          diffA.opInfo.op === DifferenceOperationKind.DELETE &&
          diffB.opInfo.path.startsWith(diffA.opInfo.path)
        ) {
          console.log("----------- PARENT - CHILD O.O -----------");
          console.log(JSON.stringify(diffA));
          console.log(JSON.stringify(diffB));
        } else if (
          diffB.opInfo.op === DifferenceOperationKind.DELETE &&
          diffA.opInfo.path.startsWith(diffB.opInfo.path)
        ) {
          console.log("----------- CHILD - PARENT O.O -----------");
          console.log(JSON.stringify(diffA));
          console.log(JSON.stringify(diffB));
        } else if (
          (diffA.opInfo.op === DifferenceOperationKind.DELETE &&
            diffB.opInfo.op === DifferenceOperationKind.ADD) ||
          (diffA.opInfo.op === DifferenceOperationKind.ADD &&
            diffB.opInfo.op === DifferenceOperationKind.DELETE)
        ) {
          console.log(
            "----------- PROBABLY DELETE USE CONFLICT :O -----------"
          );
          console.log(JSON.stringify(diffA));
          console.log(JSON.stringify(diffB));

          if (isDeleteUseConflict(diffA.opInfo, diffB.opInfo)) {
            console.log("YES - it is delete use conflict");

            addConflict(diffA, diffB, diffModel);
          }
        } else if (
          (diffA.opInfo.op === DifferenceOperationKind.DELETE &&
            diffB.opInfo.op === DifferenceOperationKind.UPDATE) ||
          (diffA.opInfo.op === DifferenceOperationKind.UPDATE &&
            diffB.opInfo.op === DifferenceOperationKind.DELETE)
        ) {
          console.log(
            "----------- PROBABLY DELETE UPDATE CONFLICT :O -----------"
          );
          console.log(JSON.stringify(diffA));
          console.log(JSON.stringify(diffB));

          if (isDeletUpdateConflict(diffA.opInfo, diffB.opInfo)) {
            console.log("YES - it is delete update conflict");

            addConflict(diffA, diffB, diffModel);
          }
        }
      }
    }
  }

  return diffModel;
}

// GENERAL QUESITONS:
// do I really need this used flag?
function runtimeImprovedMapImplementations(
  diffMapLeft: DiffGroupByOpAndPath,
  diffMapRight: DiffGroupByOpAndPath,
  diffModel: DiffModel
): DiffModel {
  console.log("----------- INSERT INSERT CONFLICT ? -----------");
  for (const pathLeft of diffMapLeft.add.keys()) {
    const matchingRight = diffMapRight.add.get(pathLeft);

    if (matchingRight !== undefined) {
      console.log("INSER INSERT conflict");
      // TODO add to DiffModel conflicts
      /* conflicts.push({
        leftDiff: diffMapLeft.add.get(pathLeft)!,
        rightDiff: matchingRight,
      }); */
    }
  }

  console.log("----------- UPDATE UPDATE CONFLICT ? -----------");
  for (const pathLeft of diffMapLeft.update.keys()) {
    const matchingRight = diffMapRight.update.get(pathLeft);

    if (matchingRight !== undefined) {
      console.log("UPDATE UPDATE conflict");
      // TODO add to DiffModel conflicts
      /* conflicts.push({
        leftDiff: diffMapLeft.update.get(pathLeft)!,
        rightDiff: matchingRight,
      }); */
    }
  }

  console.log("----------- MOVE MOVE CONFLICT ? -----------");
  for (const element of diffMapLeft.move.keys()) {
    const matchingB = diffMapRight.move.get(element);
  }

  console.log("----------- DELETE UPDATE or DELETE USE CONFLICT ? -----------");
  for (const element of diffMapLeft.delete.keys()) {
    const matchingB = diffMapRight.update.get(element);
    const matching = diffMapRight.add.get(element);
  }

  for (const element of diffMapLeft.update.keys()) {
    const matchingB = diffMapRight.delete.get(element);
  }

  for (const element of diffMapLeft.add.keys()) {
    const matchingB = diffMapRight.delete.get(element);
  }

  return diffModel;
}

const findRefById = (
  diff: DiffWithUsedFlag,
  differences: Difference[],
  differencesSuffix: "L" | "R"
) =>
  `#/differences${differencesSuffix}/${differences.findIndex(
    (d) => d.path === diff.opInfo.path && d.kind === diff.opInfo.op
  )}`;

const addConflict = (
  diffA: DiffWithUsedFlag,
  diffB: DiffWithUsedFlag,
  diffModel: DiffModel
) => {
  diffModel.conflicts.push({
    leftDiff: { $ref: findRefById(diffA, diffModel.differencesL, "L") },
    rightDiff: { $ref: findRefById(diffB, diffModel.differencesR, "R") },
  });

  console.log("CONFLIIICTS: ", JSON.stringify(diffModel), diffA, diffB);
};
