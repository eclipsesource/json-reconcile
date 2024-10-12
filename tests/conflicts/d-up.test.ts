import { InputModels } from "../../src/interfaces/inputmodels.js";
import { createDiff3Way } from "../../src/services/compare.js";

// TEST MODEL

const d_up_attribute_mulitplicity_lowerUpperBound: InputModels = {
  original: {
    package: {
      id: "scml",
      classes: [
        {
          id: "Smart City",
          references: [
            {
              id: "category",
              containment: true,
              upperBound: -1, // -1 = *
              lowerBound: 1,
              type: "Category",
            },
          ],
        },

        {
          id: "Category",
          attributes: [
            {
              id: "SDG",
              upperBound: -1, // -1 = *
              lowerBound: 0,
              type: "int",
            },
          ],
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
          references: [
            {
              id: "category",
              containment: true,
              upperBound: -1, // -1 = *
              lowerBound: 1,
              type: "Category",
            },
          ],
        },

        {
          id: "Category",
          attributes: [
            {
              id: "SDG",
              upperBound: 17,
              lowerBound: 1,
              type: "int",
            },
          ],
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
          references: [],
        },
      ],
    },
  },
};

// TESTS

describe("update Category attribute multiplicity and delete Category class -> d-up conflict", () => {
  test("3-way", () => {
    expect(
      createDiff3Way(
        d_up_attribute_mulitplicity_lowerUpperBound.original,
        d_up_attribute_mulitplicity_lowerUpperBound.a,
        d_up_attribute_mulitplicity_lowerUpperBound.b
      )
    ).toBeUndefined();
  });
});
