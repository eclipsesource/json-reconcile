export interface InputModels {
  original: Model;
  a: Model;
  b: Model;
}

interface Model {
  package: {
    id: string;
    classes: {
      id: string;
      attributes?: {
        id: string;
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
