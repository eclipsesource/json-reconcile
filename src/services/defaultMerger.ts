import isEqual from "lodash.isequal";
import { Op } from "../utils/customFormatter.js";
import { directRefExists } from "../utils/refHandler.js";
import { DifferenceOperationKind } from "../interfaces/util.js";
import { DiffWithUsedFlag } from "../interfaces/inputmodels.js";

/* 
    this is the easy version of check, only with string comparisson
    "includes" operation
    better version would be with ref exists check
    => gibt es in dem value Objekt eine ref mit Pfad = der von delete op
 */
export function isDeleteUseConflict(
  operationLeft: Op,
  operationRight: Op
): boolean {
  if (operationLeft.op === "delete" && operationRight.op === "add") {
    if (directRefExists(operationLeft.path, operationRight.value as object)) {
      return true;
    }
  } else if (operationLeft.op === "add" && operationRight.op === "delete") {
    if (directRefExists(operationRight.path, operationLeft.value as object)) {
      return true;
    }
  }
  return false;
}

export function deleteUseMerger(): void {
  // TODO
}

// pre condition: both, opLeft and opRight are delete operations with same path
export function isMoveMoveConflict(
  operationsLeft: DiffWithUsedFlag[],
  opLeft: DiffWithUsedFlag,
  operationsRight: DiffWithUsedFlag[],
  opRight: DiffWithUsedFlag
): boolean {
  // find second operation of move > add of left
  // find the coresponding add operation on right

  // value of add oepration should be the same as delete and add value left = add value right

  // it is move if the previous line of conditions are true and the path of add operation left != path of add operation right

  if (
    opLeft.diff.op !== DifferenceOperationKind.DELETE ||
    opRight.diff.op !== DifferenceOperationKind.DELETE
  ) {
    return false;
  }

  if (!isEqual(opLeft.diff.value, opRight.diff.value)) {
    return false;
  }

  for (const opL of operationsLeft) {
    if (opL.diff.op === DifferenceOperationKind.ADD) {
      if (isEqual(opL.diff.value, opLeft.diff.value)) {
        for (const opR of operationsRight) {
          if (opR.diff.op === DifferenceOperationKind.ADD) {
            if (isEqual(opR.diff.value, opRight.diff.value)) {
              if (opL.diff.path !== opR.diff.path) {
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
