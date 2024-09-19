import {
  applyDiffDoPatch,
  createDiff3Way,
  createDiff2Way,
} from "../services/compare";

const original = {
  test: "changes",
};
const original2 = {
  test: "changes",
};
const a = {
  test: "changes123",
};
const b = {
  test: "additional thing",
};

const deltaA = createDiff2Way(original, a);
console.log("DELTA 2way orginal - a");
console.log(deltaA);
const deltaB = createDiff2Way(original, b);
console.log("DELTA 2way orginal - b");
console.log(deltaB);

const deltaAB = createDiff3Way(original, a, b);
console.log("DELTA 3way orginal - a - b");
console.log(deltaAB);

if (deltaA !== undefined && deltaB !== undefined) {
  applyDiffDoPatch(original2, deltaA);
  const original3 = { ...original2 };
  applyDiffDoPatch(original3, deltaB);
  console.log("ORIGINAL3", original3);
}

console.log("ORIGINAL2", original2);

console.log("ORIGINAL", original);
