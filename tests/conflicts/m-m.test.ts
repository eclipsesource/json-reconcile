// TEST MODEL

import { InputModels } from "../../src/interfaces/inputmodels.js";
import { createDiff3Way } from "../../src/services/compare.js";
import { testsEnabled } from "../configs.js";

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
              type: "Project",
            },
            {
              id: "category",
              containment: true,
              upperBound: -1,
              lowerBound: 0,
              type: "Category",
            },
          ],
        },
        {
          id: "InfrastructureComponent",
        },
        {
          id: "Project",
          references: [
            {
              id: "component",
              containment: true,
              upperBound: -1,
              lowerBound: 0,
              type: "InfrastructureComponent",
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
              id: "project",
              containment: true,
              upperBound: -1,
              lowerBound: 0,
              type: "Project",
            },
          ],
        },
        {
          id: "InfrastructureComponent",
        },
        {
          id: "Project",
          references: [
            {
              id: "component",
              containment: true,
              upperBound: -1,
              lowerBound: 0,
              type: "InfrastructureComponent",
            },
            {
              id: "category",
              containment: true,
              upperBound: -1,
              lowerBound: 0,
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
          id: "InfrastructureComponent",
          references: [
            {
              id: "category",
              containment: true,
              upperBound: -1,
              lowerBound: 0,
              type: "Category",
            },
          ],
        },
        {
          id: "Project",
          references: [
            {
              id: "component",
              containment: true,
              upperBound: -1,
              lowerBound: 0,
              type: "InfrastructureComponent",
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
          m_m_category_reference.a,
          m_m_category_reference.b
        )
      ).toBeUndefined();
    });
  });
}
