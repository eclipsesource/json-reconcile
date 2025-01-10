import isEqual from "lodash.isequal";
import { Op } from "../utils/customFormatter.js";
import { directRefExists } from "../utils/refHandler.js";
import { DifferenceOperationKind } from "../interfaces/util.js";
import { DiffWithUsedFlag } from "../interfaces/inputmodels.js";

// dublicated code (except operation type add-update) same as isDeleteUseConflict
export function isDeletUpdateConflict(
  operationLeft: Op,
  operationRight: Op
): boolean {
  if (
    operationLeft.op === DifferenceOperationKind.DELETE &&
    operationRight.op === DifferenceOperationKind.UPDATE
  ) {
    console.log("-DELETE UPDATE CHECK-");
    // TODO WARNING, there could occure an error when the updated value is just a string or number not an object
    if (directRefExists(operationLeft.path, operationRight.value as object)) {
      return true;
    }
  } else if (
    operationLeft.op === DifferenceOperationKind.UPDATE &&
    operationRight.op === DifferenceOperationKind.DELETE
  ) {
    if (directRefExists(operationRight.path, operationLeft.value as object)) {
      return true;
    }
  }
  return false;
}

// dublicated code (except operation type add-update) same as isDeletUpdateConflict
export function isDeleteUseConflict(
  operationLeft: Op,
  operationRight: Op
): boolean {
  if (
    operationLeft.op === DifferenceOperationKind.DELETE &&
    operationRight.op === DifferenceOperationKind.ADD
  ) {
    if (directRefExists(operationLeft.path, operationRight.value as object)) {
      return true;
    }
  } else if (
    operationLeft.op === DifferenceOperationKind.ADD &&
    operationRight.op === DifferenceOperationKind.DELETE
  ) {
    if (directRefExists(operationRight.path, operationLeft.value as object)) {
      return true;
    }
  }
  return false;
}

// pre condition: both, opLeft and opRight are delete operations with same path
export function isMoveMoveConflict(
  diffsL: DiffWithUsedFlag[],
  diffL: DiffWithUsedFlag,
  diffsR: DiffWithUsedFlag[],
  diffR: DiffWithUsedFlag
): boolean {
  // find second operation of move > add of left
  // find the coresponding add operation on right

  // value of add oepration should be the same as delete and add value left = add value right

  // it is move if the previous line of conditions are true and the path of add operation left != path of add operation right

  if (
    diffL.opInfo.op !== DifferenceOperationKind.DELETE ||
    diffR.opInfo.op !== DifferenceOperationKind.DELETE
  ) {
    return false;
  }

  if (!isEqual(diffL.opInfo.value, diffR.opInfo.value)) {
    return false;
  }

  for (const opL of diffsL) {
    if (opL.opInfo.op === DifferenceOperationKind.ADD) {
      if (isEqual(opL.opInfo.value, diffL.opInfo.value)) {
        for (const opR of diffsR) {
          if (opR.opInfo.op === DifferenceOperationKind.ADD) {
            if (isEqual(opR.opInfo.value, diffR.opInfo.value)) {
              if (opL.opInfo.path !== opR.opInfo.path) {
                return true;
              }
            }
          }
        }
      }
    }
  }

  return false;

  // Erkenntniss: ich brauch ein abgewandelten Formater, jsondpatch RFC verschluckt infos,
  // z.B. value von delete op, was bei dem original Format vorhanden ist die Information

  // wenn ich den value hab von delete op der entfernt wurde kann ich das mit dem value von add vergleichen,
  // also opLeft delete operation delete value
  // search for same value in operationsLeft add operations

  // dann hab ich die zusammengehörigen Operations für move => delete und add
}
