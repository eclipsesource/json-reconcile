import { DifferenceState } from "../../src/interfaces/diffmodel.js";
import { InputModels } from "../../src/interfaces/inputmodels.js";
import { DifferenceOperationKind } from "../../src/interfaces/util.js";
import {
  createDiff2Way,
  createDiff3Way,
} from "../../src/services/createDiff.js";
import { testsEnabled } from "../configs.js";

// TEST MODEL

const d_us__package_reference_parent_child: InputModels = {
  original: {
    package: {
      id: "scml",
      classes: [
        {
          id: "Smart City",
          references: [
            {
              id: "project",
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
      package: {
        id: "Components",
        classes: [
          {
            id: "InfrastructureComponent",
            references: [],
          },
        ],
      },
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
              id: "project",
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
          references: [
            {
              id: "infrastructurecomponent",
              upperBound: -1,
              lowerBound: 0,
              type: {
                $ref: "#/package/package/classes/0",
              },
            },
          ],
        },
      ],
      package: {
        id: "Components",
        classes: [
          {
            id: "InfrastructureComponent",
            references: [],
          },
        ],
      },
    },
  },
};

// TESTS

if (testsEnabled["1_delete-use"] === true) {
  describe("delete Components package (parent of InfrastructureComponent class) and add reference from Project to InfrastructureComponent - parent child", () => {
    test("2-way: original - a", () => {
      expect(
        createDiff2Way(
          d_us__package_reference_parent_child.original,
          d_us__package_reference_parent_child.left,
        ),
      ).toStrictEqual([
        {
          op: "delete",
          path: "/package/package",
          value: {
            id: "Components",
            classes: [
              {
                id: "InfrastructureComponent",
                references: [],
              },
            ],
          },
        },
      ]);
    });

    test("2-way: original - b", () => {
      expect(
        createDiff2Way(
          d_us__package_reference_parent_child.original,
          d_us__package_reference_parent_child.right,
        ),
      ).toStrictEqual([
        {
          op: "add",
          path: "/package/classes/1/references/0",
          value: {
            id: "infrastructurecomponent",
            upperBound: -1,
            lowerBound: 0,
            type: {
              $ref: "#/package/package/classes/0",
            },
          },
        },
      ]);
    });

    test("3-way", () => {
      expect(
        createDiff3Way(
          d_us__package_reference_parent_child.original,
          d_us__package_reference_parent_child.left,
          d_us__package_reference_parent_child.right,
        ),
      ).toStrictEqual({
        threeWay: true,
        differencesL: [
          {
            id: 0,
            kind: DifferenceOperationKind.DELETE,
            state: DifferenceState.UNRESOLVED,
            path: "/package/package",
          },
        ],
        differencesR: [
          {
            id: 0,
            kind: DifferenceOperationKind.ADD,
            state: DifferenceState.UNRESOLVED,
            path: "/package/classes/1/references/0",
          },
        ],
        conflicts: [
          {
            leftDiff: {
              $ref: "#/differencesL/0",
            },
            rightDiff: {
              $ref: "#/differencesR/0",
            },
          },
        ],
      });
    });
  });
}
