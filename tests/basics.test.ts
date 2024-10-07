import { createDiff2Way, createDiff3Way } from "../src/services/compare.js";
import {
  up_up_className,
  up_up_mulitplicity_lowerUpperBound,
} from "./models/up-up.js";

test('no differences results in "undefined" diff', () => {
  expect(
    createDiff2Way(up_up_className.original, up_up_className.original)
  ).toBeUndefined();
  expect(createDiff2Way(up_up_className.a, up_up_className.a)).toBeUndefined();
});

describe("smart city class name string change -> up-up conflict", () => {
  test("2-way: original - a", () => {
    expect(
      createDiff2Way(up_up_className.original, up_up_className.a)
    ).toStrictEqual([
      { op: "remove", path: "/package/classes/0" },
      { op: "add", path: "/package/classes/0", value: { id: "SmartCity" } },
    ]);
  });

  test("2-way: original - b", () => {
    expect(
      createDiff2Way(up_up_className.original, up_up_className.b)
    ).toStrictEqual([
      { op: "remove", path: "/package/classes/0" },
      { op: "add", path: "/package/classes/0", value: { id: "Smart_City" } },
    ]);
  });

  test("3-way", () => {
    expect(
      createDiff3Way(
        up_up_className.original,
        up_up_className.a,
        up_up_className.b
      )
    ).toBeUndefined();
  });
});

/* describe("relation between Project and Category - lower/upper bound change -> up-up conflict", () => {
  test("2-way: original - a", () => {
    expect(
      createDiff2Way(
        up_up_mulitplicity_lowerUpperBound.original,
        up_up_mulitplicity_lowerUpperBound.a
      )
    ).toStrictEqual({
      package: { class: { name: ["Smart City", "SmartCity"] } },
    });
  });

  test("2-way: original - b", () => {
    expect(
      createDiff2Way(
        up_up_mulitplicity_lowerUpperBound.original,
        up_up_mulitplicity_lowerUpperBound.b
      )
    ).toStrictEqual({
      package: { class: { name: ["Smart City", "Smart_City"] } },
    });
  });

  test("3-way", () => {
    expect(
      createDiff3Way(
        up_up_mulitplicity_lowerUpperBound.original,
        up_up_mulitplicity_lowerUpperBound.a,
        up_up_mulitplicity_lowerUpperBound.b
      )
    ).toBeUndefined();
  });
});
 */
