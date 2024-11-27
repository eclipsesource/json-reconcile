import { JSONValue } from "../utils/jsonHelper.js";
import * as customJuuFormatter from "../utils/customFormatter.js";

export interface InputModels {
  left: JSONValue;
  right: JSONValue;
  original?: JSONValue;
}

export interface DiffGroupByOpAndPath {
  add: Map<string, customJuuFormatter.Op[]>;
  remove: Map<string, customJuuFormatter.Op[]>;
  replace: Map<string, customJuuFormatter.Op[]>;
  move: Map<string, customJuuFormatter.Op[]>;
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
