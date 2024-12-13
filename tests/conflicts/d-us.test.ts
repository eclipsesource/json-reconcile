import { InputModels } from "../../src/interfaces/inputmodels.js";
import { compare, createDiff2Way } from "../../src/services/compare.js";
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
              type: {
                $ref: "#/package/classes/1",
              },
            },
            {
              id: "project",
              containment: true,
              upperBound: -1,
              lowerBound: 0,
              type: {
                $ref: "#/package/classes/2",
              },
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
          references: [],
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
          references: [
            {
              id: "project",
              containment: true,
              upperBound: -1,
              lowerBound: 0,
              type: {
                $ref: "#/package/classes/1",
              },
            },
          ],
        },
        {
          id: "Project",
          references: [],
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
          references: [
            {
              id: "category",
              containment: true,
              upperBound: -1,
              lowerBound: 0,
              type: {
                $ref: "#/package/classes/1",
              },
            },
            {
              id: "project",
              containment: true,
              upperBound: -1,
              lowerBound: 0,
              type: {
                $ref: "#/package/classes/2",
              },
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
              type: {
                $ref: "#/package/classes/1",
              },
            },
          ],
        },
      ],
    },
  },
};

// TESTS

if (testsEnabled["d-us"] === true) {
  describe("reference from Project to Category and delete Category class -> d-us conflict", () => {
    test("2-way: original - a", () => {
      expect(
        createDiff2Way(
          d_us_class_referenced.original,
          d_us_class_referenced.left
        )
      ).toStrictEqual([
        {
          op: "delete",
          path: "/package/classes/1",
          value: {
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
        },
        {
          op: "delete",
          path: "/package/classes/0/references/0",
          value: {
            id: "category",
            containment: true,
            upperBound: -1,
            lowerBound: 0,
            type: {
              $ref: "#/package/classes/1",
            },
          },
        },
        {
          op: "update",
          path: "/package/classes/0/references/0/type/$ref",
          value: "#/package/classes/1",
        },
      ]);
    });

    test("2-way: original - b", () => {
      expect(
        createDiff2Way(
          d_us_class_referenced.original,
          d_us_class_referenced.right
        )
      ).toStrictEqual([
        {
          op: "add",
          path: "/package/classes/2/references/0",
          value: {
            containment: false,
            id: "category",
            lowerBound: 1,
            type: {
              $ref: "#/package/classes/1",
            },
            upperBound: -1,
          },
        },
      ]);
    });

    test("3-way", () => {
      expect(
        compare({
          original: d_us_class_referenced.original,
          left: d_us_class_referenced.left,
          right: d_us_class_referenced.right,
        })
      ).toBeUndefined();
    });
  });
}
