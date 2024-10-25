import { InputModels } from "../../src/interfaces/inputmodels.js";
import { createDiff3Way } from "../../src/services/compare.js";
import { testsEnabled } from "../configs.js";

// TEST MODEL

const i_i_same_class: InputModels = {
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
          references: [
            {
              id: "location",
              containment: true,
              upperBound: 1,
              lowerBound: 1,
              type: "Location",
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
        {
          id: "Location",
          attributes: [
            {
              id: "Lat",
              upperBound: 1,
              lowerBound: 1,
              type: "flaot",
            },
            {
              id: "Long",
              upperBound: 1,
              lowerBound: 1,
              type: "flaot",
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
              id: "location",
              containment: true,
              upperBound: 1,
              lowerBound: 1,
              type: "Location",
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
        {
          id: "Location",
          attributes: [
            {
              id: "Lat",
              upperBound: 1,
              lowerBound: 1,
              type: "flaot",
            },
            {
              id: "Long",
              upperBound: 1,
              lowerBound: 1,
              type: "flaot",
            },
          ],
        },
      ],
    },
  },
};

// TESTS

if (testsEnabled["i-i"] === true) {
  describe("new class Location and reference from InfrastructureComponent to Location -> i-i the same conflict", () => {
    test("3-way", () => {
      expect(
        createDiff3Way(
          i_i_same_class.original,
          i_i_same_class.a,
          i_i_same_class.b
        )
      ).toBeUndefined();
    });
  });
}
