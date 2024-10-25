import * as jsondiffpatch from "jsondiffpatch";
import { Delta } from "jsondiffpatch";

import * as jsonpatchFormatter from "jsondiffpatch/formatters/jsonpatch";
import { JSONValue } from "../utils/jsonHelper.js";
import { InputModels } from "../interfaces/inputmodels.js";

export function compare(inputModels: InputModels): void {
  if (inputModels.original === undefined) {
    createDiff2Way(inputModels.left, inputModels.right);
  } else {
    createDiff3Way(inputModels.left, inputModels.right, inputModels.original);
  }
}

export function createDiff2Way(
  left: JSONValue,
  right: JSONValue
): jsonpatchFormatter.Op[] | undefined {
  /* 
  const delta1 = diff(originalTest2, personATest2);
  const delta2 = diff(originalTest2, personBTest2);

  const withoutHash = jsondiffpatch.create();

  const withHash2 = jsondiffpatch.create({
    objectHash: (obj) => {
      const objRecord = obj as Record<string, string>;
      return objRecord.name || objRecord.id || objRecord._id;
    },
  }); 
  */

  const withHash = jsondiffpatch.create({
    objectHash: (obj) => {
      const objRecord = obj as Record<string, string>;
      return objRecord.id;
    },
  });

  const delta = withHash.diff(left, right);

  const output = jsonpatchFormatter.format(delta, left);

  return output;
}

export function createDiff3Way(
  original: JSONValue,
  left: JSONValue,
  right: JSONValue
): Delta | undefined {
  const diffsA = createDiff2Way(original, left);

  const diffsB = createDiff2Way(original, right);

  if (diffsA == undefined || diffsB == undefined) {
    return undefined;
  }

  console.log("jsonpatch result left", diffsA);
  console.log("jsonpatch result right", diffsB);

  diffsA.forEach((opA) => {
    diffsB.forEach((opB) => {
      if (opA.path === opB.path) {
        console.log("----------- PROBABLY CONFLICT o.O ---------");
        console.log(opA);
        console.log(opB);
      } else if (opA.op === "remove" && opB.path.startsWith(opA.path)) {
        console.log("----------- PARENT - CHILD o.O ---------");
        console.log(opA);
        console.log(opB);
      } else if (opB.op === "remove" && opA.path.startsWith(opB.path)) {
        console.log("----------- CHILD - PARENT o.O ---------");
        console.log(opA);
        console.log(opB);
      }
    });
  });

  return undefined;
}

export function applyDiffDoPatch(original: unknown, delta: Delta) {
  const withHash = jsondiffpatch.create({
    objectHash: (obj) => {
      const objRecord = obj as Record<string, string>;
      console.log("objeect - any type");
      console.log(objRecord);
      return objRecord.id;
    },
  });

  withHash.patch(original, delta);

  console.log(JSON.stringify(original));
  return original;
}

function improvedTextDiffTry() {
  const customDiffPatch = jsondiffpatch.create({
    // textDiff: {
    //   diffMatchPatch: {},
    //   minLength: 60, // default value
    // },
  });
}
