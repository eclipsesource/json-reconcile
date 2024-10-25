import { InputModels } from "../src/interfaces/inputmodels.js";
import { createDiff2Way } from "../src/services/compare.js";
import {
  tryOutFirstJSONRefLib,
  tryOutSecondJSONRefLib,
} from "../src/utils/refTester.js";
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
  a: {
    package: {
      id: "scml",
      classes: [
        {
          id: "Smart City",
        },
      ],
    },
  },
  b: {
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
    expect(createDiff2Way(basic.a, basic.a)).toBeUndefined();
  });

  test('no conflicts result in "undefined" diff', () => {
    // TODO
    expect(createDiff2Way(basic.original, basic.original)).toBeUndefined();
    expect(createDiff2Way(basic.a, basic.a)).toBeUndefined();
  });

  test("JSON ref test - how it behaves?", () => {
    expect(tryOutFirstJSONRefLib()).toBeUndefined();
    expect(tryOutSecondJSONRefLib()).toBeUndefined();
  });
}
