import { isDeleteUseConflict, isMoveMoveConflict, isParentChildDeleteUseConflict } from "../customisable/defaultConflictDetection.js";
import { Difference, DiffModel } from "../interfaces/diffmodel.js";
import { DiffWithUsedFlag } from "../interfaces/inputmodels.js";
import { DifferenceOperationKind } from "../interfaces/util.js";

export function nestedForLoopWorstImplementation(
  diffsLeft: DiffWithUsedFlag[],
  diffsRight: DiffWithUsedFlag[],
  diffModel: DiffModel,
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
              "----------- one way of UPDATE UPDATE CONFLICT :o -----------",
            );
            console.log(JSON.stringify(diffA));
            console.log(JSON.stringify(diffB));

            addConflict(diffA, diffB, diffModel);
          } else if (
            diffA.opInfo.op === DifferenceOperationKind.DELETE &&
            diffB.opInfo.op === DifferenceOperationKind.DELETE
          ) {
            console.log(
              "----------- PROBABLY MOVE MOVE CONFLICT :O -----------",
            );
            console.log(JSON.stringify(diffA));
            console.log(JSON.stringify(diffB));

            if (isMoveMoveConflict(diffsLeft, diffA, diffsRight, diffB)) {
              console.log("YES - it is move move conflict");

              addConflict(diffA, diffB, diffModel);
            }
          } else if (
            (diffA.opInfo.op === DifferenceOperationKind.DELETE &&
              diffB.opInfo.op === DifferenceOperationKind.UPDATE) ||
            (diffA.opInfo.op === DifferenceOperationKind.UPDATE &&
              diffB.opInfo.op === DifferenceOperationKind.DELETE)
          ) {
            console.log("----------- DELETE UPDATE CONFLICT :O -----------");
            console.log(JSON.stringify(diffA));
            console.log(JSON.stringify(diffB));

            addConflict(diffA, diffB, diffModel);
          }
          // ---- all below code not same path
        } else if (
          diffA.opInfo.op === DifferenceOperationKind.DELETE &&
          diffB.opInfo.op === DifferenceOperationKind.UPDATE &&
          diffB.opInfo.path.startsWith(diffA.opInfo.path) &&
          diffB.opInfo.path.split("/").length >
            diffA.opInfo.path.split("/").length
        ) {
          console.log(
            "----------- PARENT - CHILD DELELTE UPDATE CONFLICT :o ----------- ",
          );
          console.log(JSON.stringify(diffA));
          console.log(JSON.stringify(diffB));

          addConflict(diffA, diffB, diffModel);
        } else if (
          diffB.opInfo.op === DifferenceOperationKind.DELETE &&
          diffA.opInfo.op === DifferenceOperationKind.UPDATE &&
          diffA.opInfo.path.startsWith(diffB.opInfo.path) &&
          diffA.opInfo.path.split("/").length >
            diffB.opInfo.path.split("/").length
        ) {
          console.log(
            "----------- CHILD - PARENT DELELTE UPDATE CONFLICT :o ----------- ",
          );
          console.log(JSON.stringify(diffA));
          console.log(JSON.stringify(diffB));

          addConflict(diffA, diffB, diffModel);
        } else if (
          (diffA.opInfo.op === DifferenceOperationKind.DELETE &&
            diffB.opInfo.op === DifferenceOperationKind.ADD) ||
          (diffA.opInfo.op === DifferenceOperationKind.ADD &&
            diffB.opInfo.op === DifferenceOperationKind.DELETE)
        ) {
          console.log(
            "----------- PROBABLY DELETE USE CONFLICT :O -----------",
          );
          console.log(JSON.stringify(diffA));
          console.log(JSON.stringify(diffB));

          if (isDeleteUseConflict(diffA.opInfo, diffB.opInfo)) {
            console.log("YES - it is delete use conflict");

            addConflict(diffA, diffB, diffModel);
          } else if (
            isParentChildDeleteUseConflict(diffA.opInfo, diffB.opInfo)
          ) {
            console.log("YES - it is PARENT - CHILD >DELELTE USE< conflict");
            addConflict(diffA, diffB, diffModel);
          }
        } else {
          console.log("----------- IT IS ACTUALLY NO CONFLICT -----------");
          console.log(JSON.stringify(diffA));
          console.log(JSON.stringify(diffB));
        }
      }
    }
  }

  return diffModel;
}


const findRefById = (
  diff: DiffWithUsedFlag,
  differences: Difference[],
  differencesSuffix: "L" | "R",
) => `#/differences${differencesSuffix}/${differences.findIndex(
  (d) => d.path === diff.opInfo.path && d.kind === diff.opInfo.op,
)}`;


const addConflict = (
  diffA: DiffWithUsedFlag,
  diffB: DiffWithUsedFlag,
  diffModel: DiffModel,
) => {
  diffModel.conflicts.push({
    leftDiff: { $ref: findRefById(diffA, diffModel.differencesL, "L") },
    rightDiff: { $ref: findRefById(diffB, diffModel.differencesR, "R") },
  });

  console.log("CONFLIIICTS: ", JSON.stringify(diffModel), diffA, diffB);
};
