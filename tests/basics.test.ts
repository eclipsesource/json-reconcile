import { InputModels } from "../src/interfaces/inputmodels.js";
import { createDiff, createDiff2Way } from "../src/services/createDiff.js";
import {
  tryOutJSONRefLib1,
  tryOutJSONRefsLib2,
} from "../src/utils/refHandler.js";
import { testsEnabled } from "./configs.js";

// TEST MODEL

const basic: InputModels = {
  original: {
    package: {
      id: "scml",
      classes: [
        {
          id: "Smart City",
        },
      ],
    },
  },
  left: {
    package: {
      id: "scml",
      classes: [
        {
          id: "Smart City",
        },
      ],
    },
  },
  right: {
    package: {
      id: "scml",
      classes: [
        {
          id: "Smart City",
        },
      ],
    },
  },
};

// TESTS

if (testsEnabled.basic === true) {
  test("no differences result in empty conflict array", () => {
    expect(createDiff2Way(basic.original, basic.original)).toStrictEqual([]);
    expect(createDiff2Way(basic.left, basic.left)).toStrictEqual([]);
  });

  test("compare 2-way - no differences API result", () => {
    expect(
      createDiff({ left: basic.original, right: basic.original })
    ).toStrictEqual({
      threeWay: false,
      differencesL: [],
      differencesR: [],
      conflicts: [],
    });
    expect(createDiff({ left: basic.left, right: basic.left })).toStrictEqual({
      threeWay: false,
      differencesL: [],
      differencesR: [],
      conflicts: [],
    });
  });

  test("compare 3-way - no differences API result", () => {
    expect(
      createDiff({
        original: basic.original,
        left: basic.original,
        right: basic.original,
      })
    ).toStrictEqual({
      threeWay: true,
      differencesL: [],
      differencesR: [],
      conflicts: [],
    });
    expect(
      createDiff({ original: basic.left, left: basic.left, right: basic.left })
    ).toStrictEqual({
      threeWay: true,
      differencesL: [],
      differencesR: [],
      conflicts: [],
    });
  });

  test("1. JSON ref test - how it behaves?", async () => {
    expect(await tryOutJSONRefLib1()).toBeUndefined();
  });

  test("2. JSON ref test - how it behaves?", () => {
    expect(tryOutJSONRefsLib2()).toBeUndefined();
  });
}
