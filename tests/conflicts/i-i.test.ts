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
              type: {
                $ref: "#/package/classes/2",
              },
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
              type: {
                $ref: "#/package/classes/1",
              },
            },
          ],
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
          id: "InfrastructureComponent",
          references: [
            {
              id: "location",
              containment: true,
              upperBound: 1,
              lowerBound: 1,
              type: {
                $ref: "#/package/classes/3",
              },
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
              type: {
                $ref: "#/package/classes/1",
              },
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
          id: "InfrastructureComponent",
          references: [
            {
              id: "location",
              containment: true,
              upperBound: 1,
              lowerBound: 1,
              type: {
                $ref: "#/package/classes/3",
              },
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
              type: {
                $ref: "#/package/classes/1",
              },
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
          i_i_same_class.left,
          i_i_same_class.right
        )
      ).toBeUndefined();
    });
  });
}
