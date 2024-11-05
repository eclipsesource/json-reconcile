import { InputModels } from "../src/interfaces/inputmodels.js";
import { createDiff2Way } from "../src/services/compare.js";
import { tryOutJSONRefLib } from "../src/utils/refHandler.js";
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
  test('no differences result in "undefined" diff', () => {
    expect(createDiff2Way(basic.original, basic.original)).toBeUndefined();
    expect(createDiff2Way(basic.left, basic.left)).toBeUndefined();
  });

  test("JSON ref test - how it behaves?", () => {
    expect(tryOutJSONRefLib()).toBeUndefined();
  });
}
