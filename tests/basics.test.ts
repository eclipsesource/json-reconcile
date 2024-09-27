import { createDiff2Way, createDiff3Way } from "../src/services/compare";
import { up_up_className } from "./models/up-up";

test('no differences results in "undefined" diff', () => {
  expect(
    createDiff2Way(up_up_className.original, up_up_className.original)
  ).toBeUndefined();
  expect(createDiff2Way(up_up_className.a, up_up_className.a)).toBeUndefined();
});

test('up-up string change results in "{"parametername": ["old", "new"]}" diff', () => {
  expect(
    createDiff2Way(up_up_className.original, up_up_className.a)
  ).toStrictEqual({
    package: { class: { name: ["Smart City", "SmartCity"] } },
  });
  expect(
    createDiff2Way(up_up_className.original, up_up_className.b)
  ).toStrictEqual({
    package: { class: { name: ["Smart City", "Smart_City"] } },
  });
  expect(
    createDiff3Way(
      up_up_className.original,
      up_up_className.a,
      up_up_className.b
    )
  ).toBeUndefined();
});
