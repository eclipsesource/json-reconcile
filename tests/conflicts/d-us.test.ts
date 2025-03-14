import { DifferenceState } from "../../src/interfaces/diffmodel.js";
import { InputModels } from "../../src/interfaces/inputmodels.js";
import { DifferenceOperationKind } from "../../src/interfaces/util.js";
import {
  createDiff2Way,
  createDiff3Way,
} from "../../src/services/createDiff.js";
import { testsEnabled } from "../configs.js";

// TEST MODEL

const d_us_class_reference: InputModels = {
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

const d_us_package_reference_parent_child: InputModels = {
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

if (testsEnabled["d-us"] === true) {
  describe("delete Category class and add reference from Project to Category -> d-us conflict", () => {
    test("2-way: original - a", () => {
      expect(
        createDiff2Way(d_us_class_reference.original, d_us_class_reference.left)
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
          d_us_class_reference.original,
          d_us_class_reference.right
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
        createDiff3Way(
          d_us_class_reference.original,
          d_us_class_reference.left,
          d_us_class_reference.right
        )
      ).toStrictEqual({
        threeWay: true,
        differencesL: [
          {
            id: 0,
            kind: DifferenceOperationKind.DELETE,
            state: DifferenceState.UNRESOLVED,
            path: "/package/classes/1",
          },
          {
            id: 1,
            kind: DifferenceOperationKind.DELETE,
            state: DifferenceState.UNRESOLVED,
            path: "/package/classes/0/references/0",
          },
          {
            id: 2,
            kind: DifferenceOperationKind.UPDATE,
            state: DifferenceState.UNRESOLVED,
            path: "/package/classes/0/references/0/type/$ref",
          },
        ],
        differencesR: [
          {
            id: 0,
            kind: DifferenceOperationKind.ADD,
            state: DifferenceState.UNRESOLVED,
            path: "/package/classes/2/references/0",
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

  describe("delete Components package (parent of InfrastructureComponent class) and add reference from Project to InfrastructureComponent - parent child -> d-us conflict", () => {
    test("2-way: original - a", () => {
      expect(
        createDiff2Way(
          d_us_package_reference_parent_child.original,
          d_us_package_reference_parent_child.left
        )
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
          d_us_package_reference_parent_child.original,
          d_us_package_reference_parent_child.right
        )
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
          d_us_package_reference_parent_child.original,
          d_us_package_reference_parent_child.left,
          d_us_package_reference_parent_child.right
        )
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
