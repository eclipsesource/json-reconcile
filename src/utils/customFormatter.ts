import {
  AddedDelta,
  ArrayDelta,
  DeletedDelta,
  Delta,
  ModifiedDelta,
  MovedDelta,
  ObjectDelta,
} from "jsondiffpatch";
import BaseFormatter, {
  BaseFormatterContext,
} from "jsondiffpatch/formatters/base";
import { CustomOp, DifferenceOperationKind } from "../interfaces/util.js";

interface CustomJuuFormatterContext extends BaseFormatterContext {
  result: CustomOp[];
  path: (string | number)[];
  pushCurrentOp: (
    obj:
      | {
          op: DifferenceOperationKind.ADD;
          value: unknown;
        }
      | {
          op: DifferenceOperationKind.DELETE;
          value: unknown;
        }
      | {
          op: DifferenceOperationKind.UPDATE;
          value: unknown;
        }
  ) => void;
  pushMoveOp: (obj: { to: number; value: unknown }) => void;
  currentPath: () => string;
  toPath: (to: number) => string;
}

class CustomJuuFormatter extends BaseFormatter<
  CustomJuuFormatterContext,
  CustomOp[]
> {
  constructor() {
    super();
    this.includeMoveDestinations = true;
  }

  prepareContext(
    context: Partial<CustomJuuFormatterContext>
  ): CustomJuuFormatterContext {
    super.prepareContext(context);
    context.result = [];
    context.path = [];
    context.pushCurrentOp = function (obj) {
      if (
        obj.op === DifferenceOperationKind.ADD ||
        obj.op === DifferenceOperationKind.UPDATE ||
        obj.op === DifferenceOperationKind.DELETE
      ) {
        this.result!.push({
          op: obj.op,
          path: this.currentPath!(),
          value: obj.value,
        });
      }
    };
    context.pushMoveOp = function (obj) {
      const from = this.currentPath!();
      this.result!.push({
        op: DifferenceOperationKind.MOVE,
        from,
        path: this.toPath!(obj.to),
        value: obj.value,
      });
    };
    context.currentPath = function () {
      return `/${this.path!.join("/")}`;
    };
    context.toPath = function (toPath) {
      const to = this.path!.slice();
      to[to.length - 1] = toPath;
      return `/${to.join("/")}`;
    };

    return context as unknown as CustomJuuFormatterContext;
  }

  typeFormattterErrorFormatter(
    context: CustomJuuFormatterContext,
    err: unknown
  ) {
    context.out(`[ERROR] ${err}`);
  }

  rootBegin() {}
  rootEnd() {}

  nodeBegin(
    { path }: CustomJuuFormatterContext,
    key: string,
    leftKey: string | number
  ) {
    path.push(leftKey);
  }
  nodeEnd({ path }: CustomJuuFormatterContext) {
    path.pop();
  }
  format_unchanged() {}
  format_movedestination() {}
  format_node(
    context: CustomJuuFormatterContext,
    delta: ObjectDelta | ArrayDelta,
    left: unknown
  ) {
    this.formatDeltaChildren(context, delta, left);
  }
  format_added(context: CustomJuuFormatterContext, delta: AddedDelta): void {
    context.pushCurrentOp({ op: DifferenceOperationKind.ADD, value: delta[0] });
  }
  format_modified(
    context: CustomJuuFormatterContext,
    delta: ModifiedDelta
  ): void {
    context.pushCurrentOp({
      op: DifferenceOperationKind.UPDATE,
      value: delta[1],
    });
  }
  format_deleted(
    context: CustomJuuFormatterContext,
    delta: DeletedDelta
  ): void {
    context.pushCurrentOp({
      op: DifferenceOperationKind.DELETE,
      value: delta[0],
    });
  }
  format_moved(context: CustomJuuFormatterContext, delta: MovedDelta): void {
    context.pushMoveOp({
      value: delta[0],
      to: delta[1],
    });
  }
  format_textdiff() {
    throw new Error("Not implemented");
  }
  format(delta: Delta, left?: unknown): CustomOp[] {
    const context = this.prepareContext({});
    const preparedContext = context;
    this.recurse(preparedContext, delta, left);
    return preparedContext.result;
  }
}

export default CustomJuuFormatter;

const last = (arr: string[]) => arr[arr.length - 1];
const sortBy = (
  arr: CustomOp[],
  pred: (a: CustomOp, b: CustomOp) => number
) => {
  arr.sort(pred);
  return arr;
};
const compareByIndexDesc = (indexA: string, indexB: string) => {
  const lastA = parseInt(indexA, 10);
  const lastB = parseInt(indexB, 10);
  if (!(isNaN(lastA) || isNaN(lastB))) {
    return lastB - lastA;
  } else {
    return 0;
  }
};
const opsByDescendingOrder = (deleteOps: CustomOp[]) =>
  sortBy(deleteOps, (a: CustomOp, b: CustomOp) => {
    const splitA = a.path.split("/");
    const splitB = b.path.split("/");
    if (splitA.length !== splitB.length) {
      return splitA.length - splitB.length;
    } else {
      return compareByIndexDesc(last(splitA), last(splitB));
    }
  });
export const partitionOps = (
  arr: CustomOp[],
  fns: ((op: CustomOp) => boolean)[]
) => {
  const initArr: CustomOp[][] = Array(fns.length + 1)
    .fill(undefined)
    .map(() => []);
  return arr
    .map((item) => {
      let position = fns.map((fn) => fn(item)).indexOf(true);
      if (position < 0) {
        position = fns.length;
      }
      return { item, position };
    })
    .reduce((acc, item) => {
      acc[item.position].push(item.item);
      return acc;
    }, initArr);
};
const isMoveOp = ({ op }: { op: DifferenceOperationKind }) =>
  op === DifferenceOperationKind.MOVE;
const isDeleteOp = ({ op }: { op: DifferenceOperationKind }) =>
  op === DifferenceOperationKind.DELETE;
const reorderOps = (diff: CustomOp[]) => {
  const [moveOps, removedOps, restOps] = partitionOps(diff, [
    isMoveOp,
    isDeleteOp,
  ]);
  const deleteOpsReverse = opsByDescendingOrder(removedOps);
  return [...deleteOpsReverse, ...moveOps, ...restOps];
};

let defaultInstance: CustomJuuFormatter;

export const format = (delta: Delta, left?: unknown) => {
  if (!defaultInstance) {
    defaultInstance = new CustomJuuFormatter();
  }
  return reorderOps(defaultInstance.format(delta, left));
};

export const log = (delta: Delta, left?: unknown): void => {
  console.log(format(delta, left));
};
