export interface Ressource {
  uri: string;
  diagram: unknown; // ERessource
}

export interface DiffModel {
  threeWay: boolean;
  differences: Difference[];
  conflicts: {
    leftDiffId: number;
    rightDiffId: number;
  }[];
}

export interface Difference {
  id: number;
  kind: DifferenceKind;
  source: DifferenceSource;
  state: DifferenceState;
  //  + match (sonst weiß Client nicht welche Elemente es visualisieren soll) -> welche Elemente sind gleich, nach Namen oder nach id, oder nach einfachen Pfad
  // frameworks nochmal checken wegen dem matchen - functions die man angeben kann um gleiche Elemente zu identifizieren
}

export enum DifferenceKind {
  ADD,
  DELETE,
  CHANGE,
  MOVE,
}

export enum DifferenceState {
  UNRESOLVED,
  MERGED,
  DISCARDED,
}

export enum DifferenceSource {
  LEFT,
  RIGHT,
}
