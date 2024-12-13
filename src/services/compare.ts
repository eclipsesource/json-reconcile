import * as jsondiffpatch from "jsondiffpatch";
import { Delta } from "jsondiffpatch";

import { JSONValue } from "../utils/jsonHelper.js";
import {
  DiffGroupByOpAndPath,
  DiffWithUsedFlag,
  InputModels,
} from "../interfaces/inputmodels.js";
import { isDeleteUseConflict, isMoveMoveConflict } from "./defaultMerger.js";
import { DifferenceState, DiffModel } from "../interfaces/diffmodel.js";
import * as customJuuFormatter from "../utils/customFormatter.js";
import { DifferenceOperationKind } from "../interfaces/util.js";
import defaultHashMatching from "../customisable/defaultHashMatching.js";

export function compare(inputModels: InputModels): DiffModel {
  if (inputModels.original === undefined) {
    return createDiffModelFrom2WayDiff(
      createDiff2Way(inputModels.left, inputModels.right)
    );
  } else {
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
      id: 77, // TODO !!
      kind: op.op as DifferenceOperationKind,
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
  const diffModel: DiffModel = {
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
          id: i,
          kind: diff.op as DifferenceOperationKind,
          path: diff.path,
          state: DifferenceState.UNRESOLVED,
        });
      }
    } else {
      for (const [i, diff] of diffsLeft.entries()) {
        diffModel.differencesL.push({
          id: i,
          kind: diff.op as DifferenceOperationKind,
          path: diff.path,
          state: DifferenceState.UNRESOLVED,
        });
      }
    }
    return diffModel;
  }

  console.log("jsonpatch result left", JSON.stringify(diffsLeft));
  console.log("jsonpatch result right", JSON.stringify(diffsRight));

  const diffsLeftWithUsedFlag: DiffWithUsedFlag[] = addUsedFlag(diffsLeft);
  const diffsRightWithUsedFlag: DiffWithUsedFlag[] = addUsedFlag(diffsRight);

  const mapOperationPathLeft = groupByOperationAndPath(diffsLeft);
  const mapOperationPathRight = groupByOperationAndPath(diffsRight);

  // const operationPartitionedLeft = partitionByOp(diffsLeft);
  // const operationPartitionedRight = partitionByOp(diffsRight);

  nestedForLoopWorstImplementation(
    diffsLeftWithUsedFlag,
    diffsRightWithUsedFlag
  );

  // ChatGPT
  // Now, iterate through diffsLeft and compare with corresponding diffsRight
  /* 
  for (const opA of diffsLeft) {
    const matchingB = mapOperationPathRight[opA.op].get(opA.path);

    if (matchingB) {
      // There are matching operations in diffsRight for the same path and operation type
      for (const opB of matchingB) {
        if (opA.op === "add" && opB.op === "add") {
          console.log("----------- INSERT INSERT CONFLICT :o -----------");
          console.log(JSON.stringify(opA));
          console.log(JSON.stringify(opB));
          // TODO: add to DiffModel conflicts
        } else if (opA.op === "update" && opB.op === "update") {
          console.log("----------- one way of UPDATE UPDATE CONFLICT :o -----------");
          console.log(JSON.stringify(opA));
          console.log(JSON.stringify(opB));
          // TODO: add to DiffModel conflicts
        } else if (opA.op === "delete" && opB.op === "delete") {
          console.log("----------- PROBABLY MOVE MOVE CONFLICT :O -----------");
          console.log(JSON.stringify(opA));
          console.log(JSON.stringify(opB));
          console.log(isMoveMoveConflict(diffsLeft, opA, diffsRight, opB));
        } else if (
          (opA.op === "delete" && opB.op === "add") ||
          (opA.op === "add" && opB.op === "delete")
        ) {
          console.log("----------- PROBABLY DELETE USE CONFLICT :O -----------");
          console.log(JSON.stringify(opA));
          console.log(JSON.stringify(opB));
          console.log(isDeleteUseConflict(opA, opB));
        }
      }
    } else {
      // If no matching B for opA
      const deleteB = mapOperationPathRight.remove.get(opA.path);
      if (deleteB) {
        for (const opB of deleteB) {
          if (opB.op === "delete" && opA.path.startsWith(opB.path)) {
            console.log("----------- CHILD - PARENT O.O -----------");
            console.log(JSON.stringify(opA));
            console.log(JSON.stringify(opB));
          }
        }
      }
    }
  }

  // Now, check diffsRight for operations that were not processed yet (not in diffsA)
  for (const opB of diffsRight) {
    const matchingA = mapOperationPathLeft[opB.op].get(opB.path);
    if (!matchingA) {
      // If no matching A for opB
      if (opB.op === "delete" && opB.path.startsWith(opA.path)) {
        console.log("----------- PARENT - CHILD O.O -----------");
        console.log(JSON.stringify(opB));
      }
    }
  }
     */

  return diffModel;
}

export function applyDiffDoPatch(original: unknown, delta: Delta) {
  const withHash = jsondiffpatch.create({
    objectHash: (obj) => {
      const objRecord = obj as Record<string, string>;
      console.log("objeect - any type");
      console.log(objRecord);
      return objRecord.id;
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

// partition diffs by operation type
function partitionByOp(
  diffs: customJuuFormatter.Op[]
): Map<string, customJuuFormatter.Op[]> {
  const partitioning: Map<DifferenceOperationKind, customJuuFormatter.Op[]> =
    new Map();

  for (const element of diffs) {
    const elemOp = element.op as DifferenceOperationKind;
    if (!partitioning.has(elemOp)) {
      partitioning.set(elemOp, [element]);
    } else {
      const updatedMapValue = partitioning.get(elemOp);
      updatedMapValue!.push(element);
      partitioning.set(elemOp, updatedMapValue!);
    }
  }

  console.log(partitioning);
  return partitioning;
}

function groupByOperationAndPath(
  diffs: customJuuFormatter.Op[]
): DiffGroupByOpAndPath {
  const groupingOperationPath: DiffGroupByOpAndPath = {
    add: new Map<string, customJuuFormatter.Op[]>(),
    delete: new Map<string, customJuuFormatter.Op[]>(),
    update: new Map<string, customJuuFormatter.Op[]>(),
    move: new Map<string, customJuuFormatter.Op[]>(),
  };

  for (const diff of diffs) {
    if (!groupingOperationPath[diff.op].has(diff.path)) {
      groupingOperationPath[diff.op].set(diff.path, []);
    }
    groupingOperationPath[diff.op].get(diff.path)?.push(diff);
  }

  return groupingOperationPath;
}

function nestedForLoopWorstImplementation(
  diffsLeft: DiffWithUsedFlag[],
  diffsRight: DiffWithUsedFlag[]
) {
  for (const opA of diffsLeft) {
    for (const opB of diffsRight) {
      if (!opA.used && !opB.used) {
        if (opA.diff.path === opB.diff.path) {
          // --- same path
          if (opA.diff.op === "add" && opB.diff.op === "add") {
            console.log("----------- INSERT INSERT CONFLICT :o -----------");
            console.log(JSON.stringify(opA));
            console.log(JSON.stringify(opB));

            // TODO add to DiffModel conflicts
          } else if (opA.diff.op === "update" && opB.diff.op === "update") {
            console.log(
              "----------- one way of UPDATE UPDATE CONFLICT :o -----------"
            );
            console.log(JSON.stringify(opA));
            console.log(JSON.stringify(opB));

            // TODO add to DiffModel conflicts
          } else if (opA.diff.op === "delete" && opB.diff.op === "delete") {
            console.log(
              "----------- PROBABLY MOVE MOVE CONFLICT :O -----------"
            );
            console.log(JSON.stringify(opA));
            console.log(JSON.stringify(opB));

            console.log(isMoveMoveConflict(diffsLeft, opA, diffsRight, opB));
          }
          // ---- not same path
        } else if (
          opA.diff.op === "delete" &&
          opB.diff.path.startsWith(opA.diff.path)
        ) {
          console.log("----------- PARENT - CHILD O.O -----------");
          console.log(JSON.stringify(opA));
          console.log(JSON.stringify(opB));
        } else if (
          opB.diff.op === "delete" &&
          opA.diff.path.startsWith(opB.diff.path)
        ) {
          console.log("----------- CHILD - PARENT O.O -----------");
          console.log(JSON.stringify(opA));
          console.log(JSON.stringify(opB));
        } else if (
          (opA.diff.op === "delete" && opB.diff.op === "add") ||
          (opA.diff.op === "add" && opB.diff.op === "delete")
        ) {
          console.log(
            "----------- PROBABLY DELETE USE CONFLICT :O -----------"
          );
          console.log(JSON.stringify(opA));
          console.log(JSON.stringify(opB));

          console.log(isDeleteUseConflict(opA.diff, opB.diff));
        }
      }
    }
  }
}

function addUsedFlag(diffs: customJuuFormatter.Op[]): DiffWithUsedFlag[] {
  const diffsWithUsedFlag: DiffWithUsedFlag[] = [];

  for (const operation of diffs) {
    diffsWithUsedFlag.push({
      diff: operation,
      used: false,
    });
  }

  return diffsWithUsedFlag;
}
