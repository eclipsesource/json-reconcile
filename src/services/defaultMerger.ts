import { Op } from "jsondiffpatch/formatters/jsonpatch";

/* 
    this is the easy version of check, only with string comparisson
    "includes" operation
    better version would propbably be with ref exists check
 */
export function isDeleteUseConflict(
  operationLeft: Op,
  operationRight: Op
): boolean {
  if (operationLeft.op === "remove" && operationRight.op === "add") {
    if (JSON.stringify(operationRight.value).includes(operationLeft.path)) {
      return true;
    }
  } else if (operationRight.op === "remove" && operationLeft.op === "add") {
    if (JSON.stringify(operationLeft.value).includes(operationRight.path)) {
      return true;
    }
  }
  return false;
}

export function deleteUseMerger(): void {
  // TODOD
}
