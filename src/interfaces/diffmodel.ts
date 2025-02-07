import { DifferenceOperationKind } from "./util.js";

export interface Ressource {
  uri: string;
  diagram: unknown; // ERessource
}

export interface DiffModel {
  threeWay: boolean;
  differencesL: Difference[];
  differencesR: Difference[];
  conflicts: {
    leftDiff: {
      $ref: string;
    };
    rightDiff: {
      $ref: string;
    };
  }[];
}

export interface Difference {
  id: number;
  kind: DifferenceOperationKind;
  state: DifferenceState;
  //  + match (sonst weiß Client nicht welche Elemente es visualisieren soll) -> welche Elemente sind gleich, nach Namen oder nach id, oder nach einfachen Pfad
  // frameworks nochmal checken wegen dem matchen - functions die man angeben kann um gleiche Elemente zu identifizieren
  path: string; // JSON ref path, additionally added to the copied EMFCompare type
}

export enum DifferenceState {
  UNRESOLVED,
  MERGED,
  DISCARDED,
}
