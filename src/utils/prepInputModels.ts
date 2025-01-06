import { CONFIG } from "../config.js";
import {
  DiffGroupByOpAndPath,
  DiffWithUsedFlag,
} from "../interfaces/inputmodels.js";
import { DifferenceOperationKind } from "../interfaces/util.js";
import * as customJuuFormatter from "../utils/customFormatter.js";

export function addUsedFlag(
  diffs: customJuuFormatter.Op[]
): DiffWithUsedFlag[] {
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
function partitionByOp(
  diffs: customJuuFormatter.Op[]
): Map<string, customJuuFormatter.Op[]> {
  const partitioning: Map<DifferenceOperationKind, customJuuFormatter.Op[]> =
    new Map();

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
    add: new Map<string, DiffWithUsedFlag>(),
    delete: new Map<string, DiffWithUsedFlag>(),
    update: new Map<string, DiffWithUsedFlag>(),
    move: new Map<string, DiffWithUsedFlag>(),
  };

  for (const diff of diffs) {
    groupingOperationPath[diff.opInfo.op].set(diff.opInfo.path, diff);
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

  console.log("FLATTEN DELETE: ", flattenDelete);
  console.log("FLATTEN ADD: ", flattenAdd);

  for (const diffAdd of flattenAdd) {
    const foundDelete = flattenDelete.find(
      (diffDelete) =>
        diffDelete.opInfo.value === diffAdd.opInfo.value ||
        (diffDelete.opInfo.value as Record<string, string>)[
          CONFIG.IDENTIFIER
        ] ===
          (diffAdd.opInfo.value as Record<string, string>)[CONFIG.IDENTIFIER]
    );

    if (foundDelete !== undefined) {
      // TODO should I check here if key already exist in map (assumption there are more than one difference on one path ((theoretically only for id change)))
      diffMapWithMove.move.set(diffAdd.opInfo.path, {
        opInfo: {
          op: DifferenceOperationKind.MOVE,
          value: diffAdd.opInfo.value,
          from: foundDelete.opInfo.path,
          path: diffAdd.opInfo.path,
        },
        used: false,
      });

      console.log(diffMapWithMove.move.get(diffAdd.opInfo.path));

      diffMapWithMove.add.delete(diffAdd.opInfo.path);
      diffMapWithMove.delete.delete(foundDelete.opInfo.path);
    }
  }

  return diffMapWithMove;
}

export function prepareDiffMap(
  diffs: customJuuFormatter.Op[]
): DiffGroupByOpAndPath {
  const mapOperationPath = groupByOperationAndPath(addUsedFlag(diffs));

  // probably don't need this kind of map
  // const operationPartitionedLeft = partitionByOp(diffsLeft);
  // const operationPartitionedRight = partitionByOp(diffsRight);

  return gatherUpMoveOpsFromDeleteAdd(mapOperationPath);
}
