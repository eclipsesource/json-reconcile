import { DiffModel } from "../interfaces/diffmodel.js";

export function applyDifferences(leftIds: number[], rightIds: number[], diffModel: DiffModel): number {

  for (const id of leftIds) {
    const elem = diffModel.differencesL[id];
  }

  for (const id of rightIds) {
    const elem = diffModel.differencesR[id];
  }

  // change status of difference
  // ONLY if status is unresolved else ??

  // find possible related conflict (jsonpath) and discard status for the Gegenpart

  return 200;
}

export function discardDifferences(leftIds: number[], rightIds: number[], diffModel: DiffModel): number {
  // get differences from id array
  
  // change status of difference
  // ONLY if status is unresolved else ??

  return 200;
}
