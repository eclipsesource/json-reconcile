import { InputModels } from "../../src/interfaces/inputmodels.js";
import { createDiff2Way, createDiff3Way } from "../../src/services/compare.js";
import { testsEnabled } from "../configs.js";

// TEST MODEL

const m_m_category_reference: InputModels = {
  original: {
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
                $ref: "#/package/classes/2",
              },
            },
            {
              id: "category",
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
          id: "Category",
        },
        {
          id: "Project",
          references: [
            {
              id: "component",
              containment: true,
              upperBound: -1,
              lowerBound: 0,
              type: {
                $ref: "#/package/classes/3",
              },
            },
          ],
        },
        {
          id: "InfrastructureComponent",
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
                $ref: "#/package/classes/2",
              },
            },
          ],
        },
        {
          id: "Category",
        },
        {
          id: "Project",
          references: [
            {
              id: "component",
              containment: true,
              upperBound: -1,
              lowerBound: 0,
              type: {
                $ref: "#/package/classes/3",
              },
            },
            {
              id: "category",
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
          id: "InfrastructureComponent",
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
        },
        {
          id: "Project",
          references: [
            {
              id: "component",
              containment: true,
              upperBound: -1,
              lowerBound: 0,
              type: {
                $ref: "#/package/classes/3",
              },
            },
          ],
        },
        {
          id: "InfrastructureComponent",
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
          ],
        },
      ],
    },
  },
};

// TESTS

if (testsEnabled["m-m"] === true) {
  describe("category reference from SmartCity to Project and to InfrastructureComponent -> m-m reference conflict", () => {
    test("2-way: original - a", () => {
      expect(
        createDiff2Way(
          m_m_category_reference.original,
          m_m_category_reference.left
        )
      ).toStrictEqual([
        {
          op: "remove",
          path: "/package/classes/0/references/1",
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
          op: "add",
          path: "/package/classes/2/references/1",
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
      ]);
    });

    test("2-way: original - b", () => {
      expect(
        createDiff2Way(
          m_m_category_reference.original,
          m_m_category_reference.right
        )
      ).toStrictEqual([
        {
          op: "remove",
          path: "/package/classes/0/references/1",
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
          op: "add",
          path: "/package/classes/3/references/0",
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
      ]);
    });

    test("3-way", () => {
      expect(
        createDiff3Way(
          m_m_category_reference.original,
          m_m_category_reference.left,
          m_m_category_reference.right
        )
      ).toBeUndefined();
    });
  });
}
