import isEqual from "lodash.isequal";
import { Op, Operation, RemoveOp } from "../utils/customFormatter.js";
import { directRefExists } from "../utils/refHandler.js";

/* 
    this is the easy version of check, only with string comparisson
    "includes" operation
    better version would be with ref exists check
    => gibt es in dem value Objekt eine ref mit Pfad = der von removed op
 */
export function isDeleteUseConflict(
  operationLeft: Op,
  operationRight: Op
): boolean {
  if (operationLeft.op === "remove" && operationRight.op === "add") {
    if (directRefExists(operationLeft.path, operationRight.value as object)) {
      return true;
    }
  } else if (operationLeft.op === "add" && operationRight.op === "remove") {
    if (directRefExists(operationRight.path, operationLeft.value as object)) {
      return true;
    }
  }
  return false;
}

export function deleteUseMerger(): void {
  // TODO
}

// pre condition: both, opLeft and opRight are remove operations with same path
export function isMoveMoveConflict(
  operationsLeft: Op[],
  opLeft: RemoveOp,
  operationsRight: Op[],
  opRight: RemoveOp
): boolean {
  // find second operation of move > add of left
  // find the coresponding add operation on right

  // value of add oepration should be the same as remove and add value left = add value right

  // it is move if the previous line of conditions are true and the path of add operation left != path of add operation right

  if (!isEqual(opLeft.value, opRight.value)) {
    return false;
  }

  for (const opL of operationsLeft) {
    if (opL.op === Operation.ADD) {
      if (isEqual(opL.value, opLeft.value)) {
        for (const opR of operationsRight) {
          if (opR.op === Operation.ADD) {
            if (isEqual(opR.value, opRight.value)) {
              if (opL.path !== opR.path) {
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
  // z.B. value von removed, was bei dem original Format vorhanden ist die Information

  // wenn ich den value hab von removed der entfernt wurde kann ich das mit dem value von add vergleichen,
  // also opLeft remove operation removed value
  // search for same value in operationsLeft add operations

  // dann hab ich die zusammengehörigen Operations für move => remove und add
}
