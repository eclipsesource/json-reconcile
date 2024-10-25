import { JSONValue } from "../utils/jsonHelper.js";

export interface InputModels {
  left: JSONValue;
  right: JSONValue;
  original?: JSONValue;
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
