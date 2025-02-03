import { Session, SessionData } from "express-session";
import { CONFIG } from "../config.js";
import {
  DiffGroupByOpAndPath,
  DiffWithUsedFlag,
  DiffWithUsedFlagCustom,
  InputModels,
} from "../interfaces/inputmodels.js";
import {
  AddOp,
  CustomOp,
  DeleteOp,
  DifferenceOperationKind,
  MoveOp,
  UpdateOp,
} from "../interfaces/util.js";
import { DiffModel } from "../interfaces/diffmodel.js";

// Augment express-session with a custom SessionData object
declare module "express-session" {
  export interface SessionData {
    inputModels: InputModels;
    diffModel: DiffModel;
  }
}

export function getInputModelsOrError(
  reqBody: InputModels,
  reqSession: Session & Partial<SessionData>
): InputModels | string {
  if (reqBody.left && reqBody.right) {
    console.log("session regenerate");
    reqSession.regenerate((err) => {
      if (err) {
        return "Error occured at session regeneration";
      }
    });

    const reqInputModels: InputModels = reqBody;
    reqSession.inputModels = reqInputModels;

    return reqSession.inputModels;
  } else {
    if (
      reqSession.inputModels === null ||
      reqSession.inputModels === undefined
    ) {
      return "Req body empty and session not found";
    } else {
      console.log(
        "body is null, models from session are taken for comparisson"
      );

      return reqSession.inputModels;
    }
  }
}

export function addUsedFlag(diffs: CustomOp[]): DiffWithUsedFlag[] {
  const diffsWithUsedFlag: DiffWithUsedFlag[] = [];

  for (const diff of diffs) {
    diffsWithUsedFlag.push({
      opInfo: diff,
      used: false,
    });
  }

  return diffsWithUsedFlag;
}

// partition diffs by operation type
function partitionByOp(diffs: CustomOp[]): Map<string, CustomOp[]> {
  const partitioning: Map<DifferenceOperationKind, CustomOp[]> = new Map();

  for (const element of diffs) {
    const elemOp = element.op;
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
  diffs: DiffWithUsedFlag[]
): DiffGroupByOpAndPath {
  const groupingOperationPath: DiffGroupByOpAndPath = {
    add: new Map<string, DiffWithUsedFlagCustom<AddOp>>(),
    delete: new Map<string, DiffWithUsedFlagCustom<DeleteOp>>(),
    update: new Map<string, DiffWithUsedFlagCustom<UpdateOp>>(),
    move: new Map<string, DiffWithUsedFlagCustom<MoveOp>>(),
  };

  for (const diff of diffs) {
    switch (diff.opInfo.op) {
      case DifferenceOperationKind.ADD:
        groupingOperationPath.add.set(diff.opInfo.path, {
          opInfo: diff.opInfo,
          used: diff.used,
        });
        break;
      case DifferenceOperationKind.DELETE:
        groupingOperationPath.delete.set(diff.opInfo.path, {
          opInfo: diff.opInfo,
          used: diff.used,
        });
        break;
      case DifferenceOperationKind.UPDATE:
        groupingOperationPath.update.set(diff.opInfo.path, {
          opInfo: diff.opInfo,
          used: diff.used,
        });
        break;
      case DifferenceOperationKind.MOVE:
        groupingOperationPath.move.set(diff.opInfo.path, {
          opInfo: diff.opInfo,
          used: diff.used,
        });
        break;
      default:
        // unexpected operation types ?
        break;
    }
  }

  return groupingOperationPath;
}

function gatherUpMoveOpsFromDeleteAdd(
  diffMap: DiffGroupByOpAndPath
): DiffGroupByOpAndPath {
  console.log("------------ gatherUpMoveOpsFromDeleteAdd -------------");

  const diffMapWithMove: DiffGroupByOpAndPath = {
    add: diffMap.add,
    delete: diffMap.delete,
    update: diffMap.update,
    move: diffMap.move,
  };

  // I can not use flat() because I must use es2025 (testing) and flat() is a new method of es2019
  // const flattenDelete = [...diffMap.delete.values()].flat(1);
  const flattenDelete = ([] as DiffWithUsedFlag[]).concat(
    ...[...diffMap.delete.values()]
  );
  // const flattenAdd = [...diffMap.add.values()].flat(1);
  const flattenAdd = ([] as DiffWithUsedFlag[]).concat(
    ...[...diffMap.add.values()]
  );

  console.log("FLATTEN DELETE: ", JSON.stringify(flattenDelete));
  console.log("FLATTEN ADD: ", JSON.stringify(flattenAdd));

  for (const diffAdd of flattenAdd) {
    const foundDelete = flattenDelete.find(
      (diffDelete) =>
        (diffDelete.opInfo.value as Record<string, undefined>)[
          CONFIG.IDENTIFIER
        ] ===
        (diffAdd.opInfo.value as Record<string, undefined>)[CONFIG.IDENTIFIER]
    );

    if (foundDelete !== undefined) {
      // TODO should I check here if key already exist in map (assumption there are more than one difference on one path ((theoretically only for id change)))
      diffMapWithMove.move.set(foundDelete.opInfo.path, {
        opInfo: {
          op: DifferenceOperationKind.MOVE,
          value: diffAdd.opInfo.value,
          from: foundDelete.opInfo.path,
          path: diffAdd.opInfo.path,
        },
        used: false,
      });

      if (
        JSON.stringify(diffAdd.opInfo.value) !==
        JSON.stringify(foundDelete.opInfo.value)
      ) {
        console.log(
          "TODO  ----- ALSO UPDATE additionally to move !!!!!!!!!!!!!!!!!!!!"
        );
        // TODO
        // somehow a update diff must be added to but which path??
      }

      diffMapWithMove.add.delete(diffAdd.opInfo.path);
      diffMapWithMove.delete.delete(foundDelete.opInfo.path);
    }
  }

  console.log("difMapWithMove END of gatherup MoveMove Ops", diffMapWithMove);
  return diffMapWithMove;
}

export function prepareDiffMap(diffs: CustomOp[]): DiffGroupByOpAndPath {
  const mapOperationPath = groupByOperationAndPath(addUsedFlag(diffs));

  // probably don't need this kind of map
  // const operationPartitionedLeft = partitionByOp(diffsLeft);
  // const operationPartitionedRight = partitionByOp(diffsRight);

  return gatherUpMoveOpsFromDeleteAdd(mapOperationPath);
}

function diffsWithMoveOps(diffs: CustomOp[]): CustomOp[] {
  console.log("------------ diffsWithMoveOps -------------");

  let diffsWithMove: CustomOp[] = diffs;

  const fillteredAddDiffs = diffs.filter(
    (diff) => diff.op === DifferenceOperationKind.ADD
  );
  const filltereDeleteDiffs = diffs.filter(
    (diff) => diff.op === DifferenceOperationKind.DELETE
  );

  for (const addDiff of fillteredAddDiffs) {
    const foundDelete = filltereDeleteDiffs.find(
      (deleteDiff) =>
        deleteDiff.value === addDiff.value ||
        (deleteDiff.value as Record<string, undefined>)[CONFIG.IDENTIFIER] ===
          (addDiff.value as Record<string, undefined>)[CONFIG.IDENTIFIER]
    );

    if (foundDelete !== undefined) {
      // TODO should I check here if key already exist in map (assumption there are more than one difference on one path ((theoretically only for id change)))
      diffsWithMove.push({
        op: DifferenceOperationKind.MOVE,
        value: addDiff.value,
        from: foundDelete.path,
        path: addDiff.path,
      });

      diffsWithMove = diffsWithMove.filter(
        (obj) => obj !== addDiff && obj !== foundDelete
      );
    }
  }

  return diffsWithMove;
}
