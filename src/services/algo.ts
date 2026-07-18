import { CONFIG } from "../config.js";
import {
  isDeleteMoveConflict,
  isParentChildDeleteUseConflict,
  isUpdateUpdateTheSameConflict,
} from "../customisable/defaultConflictDetection.js";
import { DiffModel, Difference } from "../interfaces/diffmodel.js";
import {
  DiffWithUsedFlag,
  DiffGroupByOpAndPath,
} from "../interfaces/inputmodels.js";


// GENERAL QUESITONS:
// do I really need this used flag?
export function runtimeImprovedMapImplementations(
  diffMapLeft: DiffGroupByOpAndPath,
  diffMapRight: DiffGroupByOpAndPath,
  diffModel: DiffModel,
): DiffModel {
  console.log("----------- INSERT INSERT or USE DELETE conflict ? -----------");
  for (const pathLeft of diffMapLeft.add.keys()) {
    
    const matchingLeftAdd = diffMapLeft.add.get(pathLeft);
    const matchingRightAdd = diffMapRight.add.get(pathLeft);

    if (matchingLeftAdd !== undefined && matchingRightAdd !== undefined) {

      if (isUpdateUpdateTheSameConflict(matchingLeftAdd, matchingRightAdd)) {
        console.log("INSER INSERT THE SAME conflict !!");
        addConflict(matchingLeftAdd, matchingRightAdd, diffModel);
      } else if (CONFIG.ORDERED_LIST == true) {
        console.log("INSER INSERT conflict !!");
        addConflict(matchingLeftAdd, matchingRightAdd, diffModel);
      }
    }

    const matchingRightDelete = diffMapRight.delete.get(pathLeft);

    if (matchingRightDelete !== undefined && matchingLeftAdd !== undefined) {
      console.log("----------- USE DELETE conflict !! -----------");
      addConflict(matchingLeftAdd, matchingRightDelete, diffModel);
    }

    for (const [k, matchingRightChildAdd] of diffMapRight.delete) {
      if (
        matchingLeftAdd !== undefined &&
        isParentChildDeleteUseConflict(
          matchingLeftAdd.opInfo,
          matchingRightChildAdd.opInfo,
        )
      ) {
        console.log(
          "----------- PARENT CHILD -- USE DELETE conflict :O !! -----------",
        );
        addConflict(matchingLeftAdd, matchingRightChildAdd, diffModel);
      }
    }
  }

  console.log(
    "----------- UPDATE UPDATE or UPDATE DELETE conflict ? -----------",
  );
  for (const pathLeft of diffMapLeft.update.keys()) {
    const matchingRightUpdate = diffMapRight.update.get(pathLeft);

    if (matchingRightUpdate !== undefined) {
      console.log("UPDATE UPDATE conflict !!");
      addConflict(
        diffMapLeft.update.get(pathLeft)!,
        matchingRightUpdate,
        diffModel,
      );
    }

    const matchingLeftUpdate = diffMapLeft.update.get(pathLeft);
    const matchingRightDelete = diffMapRight.delete.get(pathLeft);

    if (matchingRightDelete !== undefined && matchingLeftUpdate !== undefined) {
      console.log("----------- UPDATE DELETE conflict :O !! -----------");
      addConflict(matchingLeftUpdate, matchingRightDelete, diffModel);
    }
  }

  console.log("----------- MOVE MOVE conflict ? -----------");
  for (const pathLeft of diffMapLeft.move.keys()) {
    const matchingPathRight = diffMapRight.move.get(pathLeft);
    const matchingPathLeft = diffMapLeft.move.get(pathLeft);

    if (
      matchingPathLeft !== undefined &&
      matchingPathRight !== undefined &&
      matchingPathLeft.opInfo.path !== matchingPathRight.opInfo.path && (
        JSON.stringify(matchingPathLeft.opInfo.value) ===
        JSON.stringify(matchingPathRight.opInfo.value) ||
        (matchingPathLeft.opInfo.value as Record<string, undefined>)[CONFIG.IDENTIFIER] ===
        (matchingPathRight.opInfo.value as Record<string, undefined>)[CONFIG.IDENTIFIER]
      )
    ) {
      console.log("MOVE MOVE conflict !!");
      addConflict(matchingPathLeft, matchingPathRight, diffModel);
    }

    // left from path == right path
    const matchingFromRight = diffMapRight.move.get(matchingPathLeft!.opInfo.from);

    if (matchingPathLeft !== undefined && matchingFromRight !== undefined &&
      matchingPathLeft.opInfo.value == null && matchingFromRight.opInfo.value == null
    ) {
      console.log("MOVE MOVE (special case reordering) conflict !!");
      addConflict(matchingPathLeft, matchingFromRight, diffModel);
    }

    for (const [k, right] of diffMapRight.move) {

      // left path == right from path
      if (pathLeft === right.opInfo.from && matchingPathLeft !== undefined &&
        matchingPathLeft.opInfo.value == null && right.opInfo.value == null
      ) {
        console.log("MOVE MOVE (special case reordering) conflict !!");
        addConflict(matchingPathLeft, right, diffModel);
      }
    }
  }

  console.log("----------- DELETE UPDATE or DELETE USE or DELETE MOVE conflict ? -----------");
  for (const pathLeft of diffMapLeft.delete.keys()) {
    const matchingLeftDelete = diffMapLeft.delete.get(pathLeft);
    const matchingRightUpdate = diffMapRight.update.get(pathLeft);

    if (matchingRightUpdate !== undefined && matchingLeftDelete !== undefined) {
      console.log("----------- DELETE UPDATE conflict :O !! -----------");
      addConflict(matchingLeftDelete, matchingRightUpdate, diffModel);
    }

    for (const [k, matchingRightChildUpdate] of diffMapRight.update) {
      if (
        matchingLeftDelete !== undefined &&
        k !== pathLeft &&
        k.startsWith(pathLeft) &&
        k.split("/").length > pathLeft.split("/").length
      ) {
        console.log(
          "----------- PARENT CHILD -- DELETE UPDATE conflict :O !! -----------",
        );
        addConflict(matchingLeftDelete, matchingRightChildUpdate, diffModel);
      }
    }

    const matchingRightAdd = diffMapRight.add.get(pathLeft);
    if (matchingRightAdd !== undefined && matchingLeftDelete !== undefined) {
      console.log("----------- DELETE USE conflict :O !! -----------");
      addConflict(matchingLeftDelete, matchingRightAdd, diffModel);
    }

    for (const [k, matchingRightChildAdd] of diffMapRight.add) {
      if (
        matchingLeftDelete !== undefined &&
        isParentChildDeleteUseConflict(
          matchingLeftDelete.opInfo,
          matchingRightChildAdd.opInfo,
        )
      ) {
        console.log(
          "----------- PARENT CHILD -- DELETE USE conflict :O !! -----------",
        );
        addConflict(matchingLeftDelete, matchingRightChildAdd, diffModel);
      }
    }

    for (const [k, matchingRightMove] of diffMapRight.move) {
      if (
        matchingLeftDelete !== undefined
        && (k.startsWith(pathLeft) || isDeleteMoveConflict(matchingLeftDelete.opInfo, matchingRightMove.opInfo))
      ) {
        console.log(
          "----------- DELETE MOVE conflict :O !! -----------",
        );
        addConflict(matchingLeftDelete, matchingRightMove, diffModel);
      }
    }
  }

  console.log(
    "----------- MOVE DELETE or special UPDATE DELETE or special USE DELETE conflict, path contained ? -----------",
  );
  for (const pathRight of diffMapRight.delete.keys()) {
    const matchingRightDelete = diffMapRight.delete.get(pathRight);

    for (const key of diffMapLeft.add.keys()) {
      if (key.startsWith(pathRight)) {
        const matchingLeftAdd = diffMapLeft.add.get(key);

        if (
          matchingLeftAdd !== undefined &&
          matchingRightDelete !== undefined
        ) {
          console.log(
            "----------- USE DELETE conflict (path contained) conflict :O !! -----------",
          );
          addConflict(matchingLeftAdd, matchingRightDelete, diffModel);
        }
        break; // really ? break? but what if there is one more use delete conflict?
      }
    }

    for (const key of diffMapLeft.update.keys()) {
      if (key.startsWith(pathRight)) {
        const matchingLeftUpdate = diffMapLeft.update.get(key);

        if (
          matchingLeftUpdate !== undefined &&
          matchingRightDelete !== undefined
        ) {
          console.log(
            "----------- UPDATE DELETE conflict (path contained) conflict :O !! -----------",
          );
          addConflict(matchingLeftUpdate, matchingRightDelete, diffModel);
        }
        break;  // really ? break? but what if there is one more update delete conflict?
      }
    }

    for (const [_, matchingLeftMove] of diffMapLeft.move) {
      if (
        matchingRightDelete !== undefined &&
        (matchingLeftMove.opInfo.path.startsWith(pathRight) || isDeleteMoveConflict(matchingLeftMove.opInfo, matchingRightDelete.opInfo))
      ) {
        console.log(
          "----------- MOVE DELETE conflict :O !! -----------",
        );
        addConflict(matchingLeftMove, matchingRightDelete, diffModel);
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

  // console.log("CONFLIIICTS: ", JSON.stringify(diffModel), diffA, diffB);
};
