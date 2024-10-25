import { InputModels } from "../../src/interfaces/inputmodels.js";
import { createDiff3Way } from "../../src/services/compare.js";
import { testsEnabled } from "../configs.js";

// TEST MODEL

const d_us_class_referenced: InputModels = {
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
              lowerBound: 0,
              type: "Category",
            },
            {
              id: "project",
              containment: true,
              upperBound: -1,
              lowerBound: 0,
              type: "Project",
            },
          ],
        },
        {
          id: "Category",
          attributes: [
            {
              id: "SDG",
              upperBound: -1,
              lowerBound: 1,
              type: "int",
            },
          ],
        },
        {
          id: "Project",
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
              lowerBound: 0,
              type: "Category",
            },
            {
              id: "project",
              containment: true,
              upperBound: -1,
              lowerBound: 0,
              type: "Project",
            },
          ],
        },

        {
          id: "Category",
          attributes: [
            {
              id: "SDG",
              upperBound: -1,
              lowerBound: 1,
              type: "int",
            },
          ],
        },
        {
          id: "Project",
          references: [
            {
              id: "category",
              containment: false,
              upperBound: -1,
              lowerBound: 1,
              type: "Category",
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
          references: [
            {
              id: "project",
              containment: true,
              upperBound: -1,
              lowerBound: 0,
              type: "Project",
            },
          ],
        },
        {
          id: "Project",
        },
      ],
    },
  },
};

// TESTS

if (testsEnabled["d-us"] === true) {
  describe("reference from Project to Category and delete Category class -> d-us conflict", () => {
    test("3-way", () => {
      expect(
        createDiff3Way(
          d_us_class_referenced.original,
          d_us_class_referenced.a,
          d_us_class_referenced.b
        )
      ).toBeUndefined();
    });
  });
}
