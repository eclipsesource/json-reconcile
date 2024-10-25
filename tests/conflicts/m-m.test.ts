import { InputModels } from "../../src/interfaces/inputmodels.js";
import { createDiff3Way } from "../../src/services/compare.js";
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
