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
  console.log(delta);
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

  const delta1 = withHash.diff(original, a);

  const delta2 = withHash.diff(original, b);

  console.log(delta1);
  return delta1;
}

export function applyDiffDoPatch(original: unknown, delta: Delta) {
  const withHash = create({ objectHash: (obj: any) => obj.id });

  withHash.patch(original, delta);

  console.log(original);
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
