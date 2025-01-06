import { JSONValue } from "../utils/jsonHelper.js";
import * as customJuuFormatter from "../utils/customFormatter.js";

export interface InputModels {
  left: JSONValue;
  right: JSONValue;
  original?: JSONValue;
}

export interface DiffWithUsedFlag {
  opInfo: customJuuFormatter.Op;
  used: boolean;
}

export interface DiffGroupByOpAndPath {
  add: Map<string, DiffWithUsedFlag>;
  delete: Map<string, DiffWithUsedFlag>;
  update: Map<string, DiffWithUsedFlag>;
  move: Map<string, DiffWithUsedFlag>;
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
