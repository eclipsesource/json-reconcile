import { create, Delta, diff } from "jsondiffpatch";

export function createDiff2Way(a: unknown, b: unknown): Delta | undefined {
  // const delta1 = diff(originalTest2, personATest2);
  // const delta2 = diff(originalTest2, personBTest2);

  const withoutHash = create();
  const withHash = create({
    objectHash: (obj: any) => {
      console.log("objeect - any type");
      console.log(obj);
      return obj.id;
    },
  });
  const withHash2 = create({
    objectHash: (obj: any) => obj.name || obj.id || obj._id,
  });

  const delta = withHash.diff(a, b);

  console.log("delta result");
  console.log(JSON.stringify(delta));
  return delta;
}

export function createDiff3Way(
  original: unknown,
  a: unknown,
  b: unknown
): Delta | undefined {
  // const delta1 = diff(originalTest2, personATest2);
  // const delta2 = diff(originalTest2, personBTest2);

  const withoutHash = create();
  const withHash = create({ objectHash: (obj: any) => obj.id });
  const withHash2 = create({
    objectHash: (obj: any) => obj.name || obj.id || obj._id,
  });

  const deltaA = withHash.diff(original, a);

  const deltaB = withHash.diff(original, b);

  const resultDelta = withHash.diff(deltaA, deltaB);

  console.log(JSON.stringify(resultDelta));
  return resultDelta;
}

export function applyDiffDoPatch(original: unknown, delta: Delta) {
  const withHash = create({ objectHash: (obj: any) => obj.id });

  withHash.patch(original, delta);

  console.log(JSON.stringify(original));
  return original;
}

function improvedTextDiffTry() {
  const customDiffPatch = create({
    // textDiff: {
    //   diffMatchPatch: {},
    //   minLength: 60, // default value
    // },
  });
}
