import { createDiff2Way } from "../src/services/compare";
import { upup_className } from "./models/up-up";

test('no differences results in "undefined" diff', () => {
  expect(
    createDiff2Way(upup_className.orginal, upup_className.orginal)
  ).toBeUndefined();
  expect(createDiff2Way(upup_className.a, upup_className.a)).toBeUndefined();
});

test('up-up string change results in "{"parametername": ["old", "new"]}" diff', () => {
  expect(
    createDiff2Way(upup_className.orginal, upup_className.a)
  ).toStrictEqual({
    package: { class: { name: ["Smart City", "SmartCity"] } },
  });
  expect(
    createDiff2Way(upup_className.orginal, upup_className.b)
  ).toStrictEqual({
    package: { class: { name: ["Smart City", "Smart_City"] } },
  });
});
