import { Config } from "./interfaces/util.js";

export const CONFIG: Config = {
  // other options: "id", "_id", "name", $xmi:id
  IDENTIFIER: "id",
  ORDERED_LIST: true,
};

export const algoVariation = {
  nested: false, // the "not so" efficient one
  eficient: true,
};
