export enum DifferenceOperationKind {
  ADD = "add",
  DELETE = "delete",
  UPDATE = "update",
  MOVE = "move",
}

export interface AddOp {
  op: DifferenceOperationKind.ADD;
  path: string;
  value: unknown;
}
export interface DeleteOp {
  op: DifferenceOperationKind.DELETE;
  path: string;
  value: unknown;
}
export interface UpdateOp {
  op: DifferenceOperationKind.UPDATE;
  path: string;
  value: unknown;
}
export interface MoveOp {
  op: DifferenceOperationKind.MOVE;
  from: string;
  path: string;
  value: unknown;
}
export type CustomOp = AddOp | DeleteOp | UpdateOp | MoveOp;
