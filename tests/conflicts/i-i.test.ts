import { InputModels } from "../../src/interfaces/inputmodels.js";
import { createDiff2Way, createDiff3Way } from "../../src/services/compare.js";
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
          references: [],
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
    test("2-way: original - a", () => {
      expect(
        createDiff2Way(i_i_same_class.original, i_i_same_class.left)
      ).toStrictEqual([
        {
          op: "add",
          path: "/package/classes/1/references",
          value: {
            containment: true,
            id: "location",
            lowerBound: 1,
            type: {
              $ref: "#/package/classes/3",
            },
            upperBound: 1,
          },
        },
        {
          op: "add",
          path: "/package/classes/3",
          value: {
            id: "Location",
            attributes: [
              {
                id: "Lat",
                lowerBound: 1,
                type: "flaot",
                upperBound: 1,
              },
              {
                id: "Long",
                lowerBound: 1,
                type: "flaot",
                upperBound: 1,
              },
            ],
          },
        },
      ]);
    });

    test("2-way: original - b", () => {
      expect(
        createDiff2Way(i_i_same_class.original, i_i_same_class.right)
      ).toStrictEqual([
        {
          op: "add",
          path: "/package/classes/1/references",
          value: {
            containment: true,
            id: "location",
            lowerBound: 1,
            type: {
              $ref: "#/package/classes/3",
            },
            upperBound: 1,
          },
        },
        {
          op: "add",
          path: "/package/classes/3",
          value: {
            id: "Location",
            attributes: [
              {
                id: "Lat",
                lowerBound: 1,
                type: "flaot",
                upperBound: 1,
              },
              {
                id: "Long",
                lowerBound: 1,
                type: "flaot",
                upperBound: 1,
              },
            ],
          },
        },
      ]);
    });

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
