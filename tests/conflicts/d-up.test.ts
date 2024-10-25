import { InputModels } from "../../src/interfaces/inputmodels.js";
import { createDiff3Way } from "../../src/services/compare.js";
import { testsEnabled } from "../configs.js";

// TEST MODEL

const d_up_attribute_multiplicity_lowerUpperBound: InputModels = {
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
              upperBound: -1,
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
              upperBound: -1,
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
              upperBound: -1,
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

const d_up_containment_multiplicity_lowerUpperBound: InputModels = {
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
              upperBound: -1,
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
              upperBound: -1,
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
              upperBound: 10,
              lowerBound: 0,
              type: "Category",
            },
          ],
        },
        {
          id: "Category",
          attributes: [
            {
              id: "SDG",
              upperBound: -1,
              lowerBound: 0,
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
        {
          id: "Category",
          attributes: [
            {
              id: "SDG",
              upperBound: -1,
              lowerBound: 0,
              type: "int",
            },
          ],
        },
      ],
    },
  },
};

// TESTS

if (testsEnabled["d-up"] === true) {
  describe("update Category attribute multiplicity and delete Category class -> d-up conflict", () => {
    test("3-way", () => {
      expect(
        createDiff3Way(
          d_up_attribute_multiplicity_lowerUpperBound.original,
          d_up_attribute_multiplicity_lowerUpperBound.a,
          d_up_attribute_multiplicity_lowerUpperBound.b
        )
      ).toBeUndefined();
    });
  });

  describe("update multiplicity of reference between SmartCity and Category and delete this referece -> d-up conflict", () => {
    test("3-way", () => {
      expect(
        createDiff3Way(
          d_up_containment_multiplicity_lowerUpperBound.original,
          d_up_containment_multiplicity_lowerUpperBound.a,
          d_up_containment_multiplicity_lowerUpperBound.b
        )
      ).toBeUndefined();
    });
  });
}
