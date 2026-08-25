import { isDeepStrictEqual } from "node:util";
import { CONFIG } from "../config.js";
import {
  isDeleteMoveConflict,
  isDeleteUseConflict,
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

   for (const [k, matchingRightDelete] of diffMapRight.delete) {
      if (matchingLeftAdd !== undefined) {

        if (
          isDeleteUseConflict(matchingLeftAdd.opInfo, matchingRightDelete.opInfo)
        ) {
          console.log("----------- USE DELETE conflict !! -----------");
          addConflict(matchingLeftAdd, matchingRightDelete, diffModel);
        } else if (
          isParentChildDeleteUseConflict(matchingLeftAdd.opInfo, matchingRightDelete.opInfo)
        ) {
          console.log(
            "----------- PARENT CHILD -- USE DELETE conflict :O !! -----------",
          );
          addConflict(matchingLeftAdd, matchingRightDelete, diffModel);
        }
      }
    }
  }

  console.log(
    "----------- UPDATE UPDATE or UPDATE DELETE conflict ? -----------",
  );
  for (const pathLeft of diffMapLeft.update.keys()) {
    const matchingLeftUpdate = diffMapLeft.update.get(pathLeft);
    const matchingRightUpdate = diffMapRight.update.get(pathLeft);

    if (matchingLeftUpdate !== undefined && matchingRightUpdate !== undefined) {
      console.log("UPDATE UPDATE conflict !!");
      addConflict(
        matchingLeftUpdate,
        matchingRightUpdate,
        diffModel,
      );
    }

    const matchingRightDelete = diffMapRight.delete.get(pathLeft);

    if (matchingRightDelete !== undefined && matchingLeftUpdate !== undefined) {
      console.log("----------- UPDATE DELETE conflict :O !! -----------");
      addConflict(matchingLeftUpdate, matchingRightDelete, diffModel);
    }

    for (const [k, matchingRightParentDelete] of diffMapRight.delete) {
      if (
        matchingLeftUpdate !== undefined &&
        pathLeft !== k &&
        pathLeft.startsWith(k) &&
        pathLeft.split("/").length > k.split("/").length
      ) {
        console.log(
          "----------- PARENT CHILD -- UPDATE DELETE conflict :O !! -----------",
        );
        addConflict(matchingLeftUpdate, matchingRightParentDelete, diffModel);
      } else if (
        matchingLeftUpdate !== undefined &&
        matchingLeftUpdate.opInfo.value as string === '#' + k
      ) {
        console.log(
          "----------- direct ref value UPDATE DELETE conflict :O !! -----------",
        );
        addConflict(matchingLeftUpdate, matchingRightParentDelete, diffModel);
      }
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
      matchingPathLeft.opInfo.value == null && matchingFromRight.opInfo.value == null &&
      CONFIG.ORDERED_LIST == true
    ) {
      console.log("MOVE MOVE (special case reordering) conflict !!");
      addConflict(matchingPathLeft, matchingFromRight, diffModel);
    }

    for (const [k, right] of diffMapRight.move) {
      if (matchingPathLeft !== undefined) {

        // left path == right from path
        if (pathLeft === right.opInfo.from &&
          matchingPathLeft.opInfo.value == null && right.opInfo.value == null &&
          CONFIG.ORDERED_LIST == true
        ) {
          console.log("MOVE MOVE (special case reordering) conflict !!");
          addConflict(matchingPathLeft, right, diffModel);
        }
        if (matchingPathLeft !== undefined && matchingPathLeft.opInfo.from === right.opInfo.from &&
          pathLeft !== k &&
          matchingPathLeft.opInfo.value == null && right.opInfo.value == null
        ) {
          console.log("MOVE MOVE (mysteriosss) conflict !!");
          addConflict(matchingPathLeft, right, diffModel);
        }
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

    const pathMatchingRightAdd = diffMapRight.add.get(pathLeft);
    if (pathMatchingRightAdd !== undefined && matchingLeftDelete !== undefined) {
      console.log("----------- DELETE USE conflict :O !! -----------");
      addConflict(matchingLeftDelete, pathMatchingRightAdd, diffModel);
    }

    for (const [k, matchingRightAdd] of diffMapRight.add) {
      if (
        matchingLeftDelete !== undefined &&
        isParentChildDeleteUseConflict(
          matchingLeftDelete.opInfo,
          matchingRightAdd.opInfo,
        )
      ) {
        console.log(
          "----------- PARENT CHILD -- DELETE USE conflict :O !! -----------",
        );
        addConflict(matchingLeftDelete, matchingRightAdd, diffModel);
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
    "----------- special USE DELETE or MOVE DELETE conflict, path contained ? -----------",
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

    for (const [k, matchingLeftMove] of diffMapLeft.move) {
      if (matchingRightDelete !== undefined) {

        if (
          matchingLeftMove.opInfo.path.startsWith(pathRight) ||
          isDeleteMoveConflict(matchingLeftMove.opInfo, matchingRightDelete.opInfo)
        ) {
          console.log(
            "----------- MOVE DELETE ($ref change) conflict :O !! -----------",
          );
          addConflict(matchingLeftMove, matchingRightDelete, diffModel);
        }

        // from path of move = delete path
        if (
          k === pathRight &&
          isDeepStrictEqual(matchingLeftMove.opInfo.value, matchingRightDelete.opInfo.value)
        ) {
          console.log(
            "----------- MOVE DELETE (object moving within json) conflict :O !! -----------",
          );
          addConflict(matchingLeftMove, matchingRightDelete, diffModel);
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

  // console.log("CONFLIIICTS: ", JSON.stringify(diffModel), diffA, diffB);
};
