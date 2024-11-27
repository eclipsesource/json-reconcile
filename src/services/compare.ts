import * as jsondiffpatch from "jsondiffpatch";
import { Delta } from "jsondiffpatch";

import { JSONValue } from "../utils/jsonHelper.js";
import {
  DiffGroupByOpAndPath,
  InputModels,
} from "../interfaces/inputmodels.js";
import { isDeleteUseConflict, isMoveMoveConflict } from "./defaultMerger.js";
import {
  DifferenceKind,
  DifferenceSource,
  DifferenceState,
  DiffModel,
} from "../interfaces/diffmodel.js";
import * as customJuuFormatter from "../utils/customFormatter.js";

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
    differences: [],
    conflicts: [],
  };

  operations.forEach((op) => {
    diffModel.differences.push({
      id: 77, // TODO !!
      kind: DifferenceKind.ADD, // TODO !!
      source: DifferenceSource.LEFT, // TODO !!
      state: DifferenceState.UNRESOLVED,
      path: op.path,
    });
  });

  return diffModel;
}

export function createDiff2Way(
  left: JSONValue,
  right: JSONValue
): customJuuFormatter.Op[] {
  /* 
  const delta1 = diff(originalTest2, personATest2);
  const delta2 = diff(originalTest2, personBTest2);

  const withoutHash = jsondiffpatch.create();

  const withHash2 = jsondiffpatch.create({
    objectHash: (obj) => {
      const objRecord = obj as Record<string, string>;
      return objRecord.name || objRecord.id || objRecord._id;
    },
  }); 
  */

  const withHash = jsondiffpatch.create({
    objectHash: (obj) => {
      const objRecord = obj as Record<string, string>;
      return objRecord.id;
    },
  });

  const delta = withHash.diff(left, right);

  const output = customJuuFormatter.format(delta);

  return output;
}

export function createDiff3Way(
  original: JSONValue,
  left: JSONValue,
  right: JSONValue
): DiffModel {
  const diffModel: DiffModel = {
    threeWay: true,
    differences: [],
    conflicts: [],
  };

  const diffsA = createDiff2Way(original, left);

  const diffsB = createDiff2Way(original, right);

  if (diffsA == undefined || diffsB == undefined) {
    // TODO left or right is the same as orginal
    // so no conflicts but differences
    // put differences in diffmodel
    // and return diff model
    return diffModel;
  }

  console.log("jsonpatch result left", JSON.stringify(diffsA));
  console.log("jsonpatch result right", JSON.stringify(diffsB));

  // experimental idea stuff
  interface Diff {
    diff: customJuuFormatter.Op;
    used: boolean;
  }

  const newDiffA: Diff[] = [];

  diffsA.forEach((operation) => {
    newDiffA.push({
      diff: operation,
      used: false,
    });
  });
  // end experiment

  const mapOperationPathLeft = groupByOperationAndPath(diffsA);
  const mapOperationPathRight = groupByOperationAndPath(diffsB);

  const operationPartitionedLeft = partitionByOp(diffsA);
  const operationPartitionedRight = partitionByOp(diffsB);

  nestedForLoopWorstImplementation(diffsA, diffsB);

  // ChatGPT
  // Now, iterate through diffsA and compare with corresponding diffsB
  /* 
  for (const opA of diffsA) {
    const matchingB = mapOperationPathRight[opA.op].get(opA.path);

    if (matchingB) {
      // There are matching operations in diffsB for the same path and operation type
      for (const opB of matchingB) {
        if (opA.op === "add" && opB.op === "add") {
          console.log("----------- INSERT INSERT CONFLICT :o -----------");
          console.log(JSON.stringify(opA));
          console.log(JSON.stringify(opB));
          // TODO: add to DiffModel conflicts
        } else if (opA.op === "replace" && opB.op === "replace") {
          console.log("----------- one way of UPDATE UPDATE CONFLICT :o -----------");
          console.log(JSON.stringify(opA));
          console.log(JSON.stringify(opB));
          // TODO: add to DiffModel conflicts
        } else if (opA.op === "remove" && opB.op === "remove") {
          console.log("----------- PROBABLY MOVE MOVE CONFLICT :O -----------");
          console.log(JSON.stringify(opA));
          console.log(JSON.stringify(opB));
          console.log(isMoveMoveConflict(diffsA, opA, diffsB, opB));
        } else if (
          (opA.op === "remove" && opB.op === "add") ||
          (opA.op === "add" && opB.op === "remove")
        ) {
          console.log("----------- PROBABLY DELETE USE CONFLICT :O -----------");
          console.log(JSON.stringify(opA));
          console.log(JSON.stringify(opB));
          console.log(isDeleteUseConflict(opA, opB));
        }
      }
    } else {
      // If no matching B for opA
      const removeB = mapOperationPathRight.remove.get(opA.path);
      if (removeB) {
        for (const opB of removeB) {
          if (opB.op === "remove" && opA.path.startsWith(opB.path)) {
            console.log("----------- CHILD - PARENT O.O -----------");
            console.log(JSON.stringify(opA));
            console.log(JSON.stringify(opB));
          }
        }
      }
    }
  }

  // Now, check diffsB for operations that were not processed yet (not in diffsA)
  for (const opB of diffsB) {
    const matchingA = mapOperationPathLeft[opB.op].get(opB.path);
    if (!matchingA) {
      // If no matching A for opB
      if (opB.op === "remove" && opB.path.startsWith(opA.path)) {
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

// Helper function to partition diffs by operation type
function partitionByOp(
  diffs: customJuuFormatter.Op[]
): Map<string, customJuuFormatter.Op[]> {
  const partitioning: Map<string, customJuuFormatter.Op[]> = new Map();

  for (const element of diffs) {
    if (!partitioning.has(element.op)) {
      partitioning.set(element.op, [element]);
    } else {
      const updatedMapValue = partitioning.get(element.op);
      updatedMapValue!.push(element);
      partitioning.set(element.op, updatedMapValue!);
    }
  }

  console.log(partitioning);
  return partitioning;
}

// Group by operation and path
function groupByOperationAndPath(
  diffs: customJuuFormatter.Op[]
): DiffGroupByOpAndPath {
  const groupingOperationPath = {
    add: new Map<string, customJuuFormatter.Op[]>(),
    remove: new Map<string, customJuuFormatter.Op[]>(),
    replace: new Map<string, customJuuFormatter.Op[]>(),
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
  diffsLeft: customJuuFormatter.Op[],
  diffsRight: customJuuFormatter.Op[]
) {
  for (const opA of diffsLeft) {
    for (const opB of diffsRight) {
      if (opA.path === opB.path) {
        // --- same path
        if (opA.op === "add" && opB.op === "add") {
          console.log("----------- INSERT INSERT CONFLICT :o -----------");
          console.log(JSON.stringify(opA));
          console.log(JSON.stringify(opB));

          // TODO add to DiffModel conflicts
        } else if (opA.op === "replace" && opB.op === "replace") {
          console.log(
            "----------- one way of UPDATE UPDATE CONFLICT :o -----------"
          );
          console.log(JSON.stringify(opA));
          console.log(JSON.stringify(opB));

          // TODO add to DiffModel conflicts
        } else if (opA.op === "remove" && opB.op === "remove") {
          console.log("----------- PROBABLY MOVE MOVE CONFLICT :O -----------");
          console.log(JSON.stringify(opA));
          console.log(JSON.stringify(opB));

          console.log(isMoveMoveConflict(diffsLeft, opA, diffsRight, opB));
        }
        // ---- not same path
      } else if (opA.op === "remove" && opB.path.startsWith(opA.path)) {
        console.log("----------- PARENT - CHILD O.O -----------");
        console.log(JSON.stringify(opA));
        console.log(JSON.stringify(opB));
      } else if (opB.op === "remove" && opA.path.startsWith(opB.path)) {
        console.log("----------- CHILD - PARENT O.O -----------");
        console.log(JSON.stringify(opA));
        console.log(JSON.stringify(opB));
      } else if (
        (opA.op === "remove" && opB.op === "add") ||
        (opA.op === "add" && opB.op === "remove")
      ) {
        console.log("----------- PROBABLY DELETE USE CONFLICT :O -----------");
        console.log(JSON.stringify(opA));
        console.log(JSON.stringify(opB));

        console.log(isDeleteUseConflict(opA, opB));
      }
    }
  }
}
