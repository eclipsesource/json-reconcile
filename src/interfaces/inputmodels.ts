import { JSONValue } from "../utils/jsonHelper.js";
import { AddOp, CustomOp, DeleteOp, MoveOp, UpdateOp } from "./util.js";

export interface InputModels {
  left: JSONValue;
  right: JSONValue;
  original?: JSONValue;
}

export interface DiffWithUsedFlag {
  opInfo: CustomOp;
  used: boolean;
}

export interface DiffWithUsedFlagCustom<Op> {
  opInfo: Op;
  used: boolean;
}

export interface DiffGroupByOpAndPath {
  add: Map<string, DiffWithUsedFlagCustom<AddOp>>;
  delete: Map<string, DiffWithUsedFlagCustom<DeleteOp>>;
  update: Map<string, DiffWithUsedFlagCustom<UpdateOp>>;
  move: Map<string, DiffWithUsedFlagCustom<MoveOp>>;
}

interface Model {
  package: {
    id: string;
    classes: {
      id: string;
      attributes?: {
        id: string;
        upperBound: number; // -1 = *
        lowerBound: number;
        type: string;
      }[];
      references?: {
        id: string;
        containment: boolean;
        upperBound: number; // -1 = *
        lowerBound: number;
        type: string;
      }[];
    }[];
  };
}
