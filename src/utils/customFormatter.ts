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

export enum Operation {
  ADD = "add",
  REMOVE = "remove",
  REPLACE = "replace",
  MOVE = "move",
}

export interface AddOp {
  op: "add";
  path: string;
  value: unknown;
}
export interface RemoveOp {
  op: "remove";
  path: string;
  value: unknown;
}
export interface ReplaceOp {
  op: "replace";
  path: string;
  value: unknown;
}
export interface MoveOp {
  op: "move";
  from: string;
  path: string;
}
export type Op = AddOp | RemoveOp | ReplaceOp | MoveOp;

interface CustomJuuFormatterContext extends BaseFormatterContext {
  result: Op[];
  path: (string | number)[];
  pushCurrentOp: (
    obj:
      | {
          op: "add";
          value: unknown;
        }
      | {
          op: "remove";
          value: unknown;
        }
      | {
          op: "replace";
          value: unknown;
        }
  ) => void;
  pushMoveOp: (to: number) => void;
  currentPath: () => string;
  toPath: (to: number) => string;
}

class CustomJuuFormatter extends BaseFormatter<
  CustomJuuFormatterContext,
  Op[]
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
        obj.op === Operation.ADD ||
        obj.op === Operation.REPLACE ||
        obj.op === Operation.REMOVE
      ) {
        this.result!.push({
          op: obj.op,
          path: this.currentPath!(),
          value: obj.value,
        });
      }
    };
    context.pushMoveOp = function (to) {
      const from = this.currentPath!();
      this.result!.push({
        op: Operation.MOVE,
        from,
        path: this.toPath!(to),
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
    context.pushCurrentOp({ op: Operation.ADD, value: delta[0] });
  }
  format_modified(
    context: CustomJuuFormatterContext,
    delta: ModifiedDelta
  ): void {
    context.pushCurrentOp({ op: Operation.REPLACE, value: delta[1] });
  }
  format_deleted(
    context: CustomJuuFormatterContext,
    delta: DeletedDelta
  ): void {
    context.pushCurrentOp({ op: Operation.REMOVE, value: delta[0] });
  }
  format_moved(context: CustomJuuFormatterContext, delta: MovedDelta): void {
    const to = delta[1];
    context.pushMoveOp(to);
  }
  format_textdiff() {
    throw new Error("Not implemented");
  }
  format(delta: Delta, left?: unknown): Op[] {
    const context = this.prepareContext({});
    const preparedContext = context;
    this.recurse(preparedContext, delta, left);
    return preparedContext.result;
  }
}

export default CustomJuuFormatter;

const last = (arr: string[]) => arr[arr.length - 1];
const sortBy = (arr: Op[], pred: (a: Op, b: Op) => number) => {
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
const opsByDescendingOrder = (removeOps: Op[]) =>
  sortBy(removeOps, (a: Op, b: Op) => {
    const splitA = a.path.split("/");
    const splitB = b.path.split("/");
    if (splitA.length !== splitB.length) {
      return splitA.length - splitB.length;
    } else {
      return compareByIndexDesc(last(splitA), last(splitB));
    }
  });
export const partitionOps = (arr: Op[], fns: ((op: Op) => boolean)[]) => {
  const initArr: Op[][] = Array(fns.length + 1)
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
const isMoveOp = ({ op }: { op: string }) => op === "move";
const isRemoveOp = ({ op }: { op: string }) => op === "remove";
const reorderOps = (diff: Op[]) => {
  const [moveOps, removedOps, restOps] = partitionOps(diff, [
    isMoveOp,
    isRemoveOp,
  ]);
  const removeOpsReverse = opsByDescendingOrder(removedOps);
  return [...removeOpsReverse, ...moveOps, ...restOps];
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
