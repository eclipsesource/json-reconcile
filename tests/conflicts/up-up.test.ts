import { DifferenceState } from "../../src/interfaces/diffmodel.js";
import { InputModels } from "../../src/interfaces/inputmodels.js";
import { DifferenceOperationKind } from "../../src/interfaces/util.js";
import { createDiff2Way, createDiff3Way } from "../../src/services/compare.js";
import { testsEnabled } from "../configs.js";

// TEST MODEL

const up_up_reference_mulitplicity_upperBound: InputModels = {
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
                $ref: "#/package/classes/2",
              },
            },
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
          references: [
            {
              id: "category",
              containment: false,
              upperBound: 1,
              lowerBound: 1,
              type: {
                $ref: "#/package/classes/2",
              },
            },
          ],
        },
        {
          id: "Category",
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
              id: "category",
              containment: true,
              upperBound: -1,
              lowerBound: 0,
              type: {
                $ref: "#/package/classes/2",
              },
            },
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
          references: [
            {
              id: "category",
              containment: false,
              upperBound: -1,
              lowerBound: 1,
              type: {
                $ref: "#/package/classes/2",
              },
            },
          ],
        },
        {
          id: "Category",
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
                $ref: "#/package/classes/2",
              },
            },
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
          references: [
            {
              id: "category",
              containment: false,
              upperBound: 17,
              lowerBound: 1,
              type: {
                $ref: "#/package/classes/2",
              },
            },
          ],
        },
        {
          id: "Category",
        },
      ],
    },
  },
};

const up_up_id_property: InputModels = {
  original: {
    package: {
      id: "scml",
      classes: [
        {
          id: "Smart City",
        },
      ],
    },
  },
  left: {
    package: {
      id: "scml",
      classes: [
        {
          id: "SmartCity",
        },
      ],
    },
  },
  right: {
    package: {
      id: "scml",
      classes: [
        {
          id: "Smart_City",
        },
      ],
    },
  },
};

const up_up_property_name_and_class_parent: InputModels = {
  original: {
    package: {
      id: "scml",
      classes: [
        {
          id: "Smart City",
          attributes: [],
        },
        {
          id: "Project",
          attributes: [],
        },
        {
          id: "Category",
          attributes: [
            {
              id: "uniqueID",
              name: "SDG",
              upperBound: -1,
              lowerBound: 0,
              type: "int",
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
          attributes: [
            {
              id: "uniqueID",
              name: "SDGs",
              upperBound: -1,
              lowerBound: 0,
              type: "int",
            },
          ],
        },
        {
          id: "Project",
          attributes: [],
        },
        {
          id: "Category",
          attributes: [],
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
          attributes: [],
        },
        {
          id: "Project",
          attributes: [
            {
              id: "uniqueID",
              name: "sdg",
              upperBound: -1,
              lowerBound: 0,
              type: "int",
            },
          ],
        },
        {
          id: "Category",
          attributes: [],
        },
      ],
    },
  },
};

const up_up_smartcity_reference: InputModels = {
  original: {
    package: {
      id: "scml",
      classes: [
        {
          id: "Smart City",
          references: [
            {
              id: "name",
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
          id: "Category",
        },
        {
          id: "Project",
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
              id: "name",
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
              id: "name",
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
        },
        {
          id: "InfrastructureComponent",
        },
      ],
    },
  },
};

const up_up_smartcity_reference_with_id_value_change: InputModels = {
  original: {
    package: {
      id: "scml",
      classes: [
        {
          id: "Smart City",
          references: [
            {
              id: "name1",
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
          id: "Category",
        },
        {
          id: "Project",
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
              id: "name2",
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
              id: "name3",
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
        },
        {
          id: "InfrastructureComponent",
        },
      ],
    },
  },
};

// TESTS

if (testsEnabled["up-up"] === true) {
  describe("relation between Project and Category - upper bound change -> up-up conflict", () => {
    test("2-way: original - a", () => {
      expect(
        createDiff2Way(
          up_up_reference_mulitplicity_upperBound.original,
          up_up_reference_mulitplicity_upperBound.left
        )
      ).toStrictEqual([
        {
          op: "update",
          path: "/package/classes/1/references/0/upperBound",
          value: -1,
        },
      ]);
    });

    test("2-way: original - b", () => {
      expect(
        createDiff2Way(
          up_up_reference_mulitplicity_upperBound.original,
          up_up_reference_mulitplicity_upperBound.right
        )
      ).toStrictEqual([
        {
          op: "update",
          path: "/package/classes/1/references/0/upperBound",
          value: 17,
        },
      ]);
    });

    test("3-way", () => {
      expect(
        createDiff3Way(
          up_up_reference_mulitplicity_upperBound.original,
          up_up_reference_mulitplicity_upperBound.left,
          up_up_reference_mulitplicity_upperBound.right
        )
      ).toStrictEqual({
        threeWay: true,
        differencesL: [
          {
            id: 0,
            kind: DifferenceOperationKind.UPDATE,
            state: DifferenceState.UNRESOLVED,
            path: "/package/classes/1/references/0/upperBound",
          },
        ],
        differencesR: [
          {
            id: 0,
            kind: DifferenceOperationKind.UPDATE,
            state: DifferenceState.UNRESOLVED,
            path: "/package/classes/1/references/0/upperBound",
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

  describe("smart city class property id update -> up-up conflict", () => {
    test("2-way: original - a", () => {
      expect(
        createDiff2Way(up_up_id_property.original, up_up_id_property.left)
      ).toStrictEqual([
        {
          op: "delete",
          path: "/package/classes/0",
          value: {
            id: "Smart City",
          },
        },
        { op: "add", path: "/package/classes/0", value: { id: "SmartCity" } },
      ]);
    });

    test("2-way: original - b", () => {
      expect(
        createDiff2Way(up_up_id_property.original, up_up_id_property.right)
      ).toStrictEqual([
        {
          op: "delete",
          path: "/package/classes/0",
          value: {
            id: "Smart City",
          },
        },
        { op: "add", path: "/package/classes/0", value: { id: "Smart_City" } },
      ]);
    });

    test("3-way", () => {
      expect(
        createDiff3Way(
          up_up_id_property.original,
          up_up_id_property.left,
          up_up_id_property.right
        )
      ).toStrictEqual({
        threeWay: true,
        differencesL: [
          {
            id: 0,
            kind: DifferenceOperationKind.DELETE,
            state: DifferenceState.UNRESOLVED,
            path: "/package/classes/0",
          },
          {
            id: 1,
            kind: DifferenceOperationKind.ADD,
            state: DifferenceState.UNRESOLVED,
            path: "/package/classes/0",
          },
        ],
        differencesR: [
          {
            id: 0,
            kind: DifferenceOperationKind.DELETE,
            state: DifferenceState.UNRESOLVED,
            path: "/package/classes/0",
          },
          {
            id: 1,
            kind: DifferenceOperationKind.ADD,
            state: DifferenceState.UNRESOLVED,
            path: "/package/classes/0",
          },
        ],
        conflicts: [
          {
            leftDiff: {
              $ref: "#/differencesL/1",
            },
            rightDiff: {
              $ref: "#/differencesR/1",
            },
          },
        ],
      });
    });
  });

  describe("category class property SDG update parent class and property name -> up-up conflict", () => {
    test("2-way: original - a", () => {
      expect(
        createDiff2Way(
          up_up_property_name_and_class_parent.original,
          up_up_property_name_and_class_parent.left
        )
      ).toStrictEqual([
        {
          op: "delete",
          path: "/package/classes/2/attributes/0",
          value: {
            id: "uniqueID",
            name: "SDG",
            upperBound: -1,
            lowerBound: 0,
            type: "int",
          },
        },
        {
          op: "add",
          path: "/package/classes/0/attributes/0",
          value: {
            id: "uniqueID",
            name: "SDGs",
            upperBound: -1,
            lowerBound: 0,
            type: "int",
          },
        },
      ]);
    });

    test("2-way: original - b", () => {
      expect(
        createDiff2Way(
          up_up_property_name_and_class_parent.original,
          up_up_property_name_and_class_parent.right
        )
      ).toStrictEqual([
        {
          op: "delete",
          path: "/package/classes/2/attributes/0",
          value: {
            id: "uniqueID",
            name: "SDG",
            upperBound: -1,
            lowerBound: 0,
            type: "int",
          },
        },
        {
          op: "add",
          path: "/package/classes/1/attributes/0",
          value: {
            id: "uniqueID",
            name: "sdg",
            upperBound: -1,
            lowerBound: 0,
            type: "int",
          },
        },
      ]);
    });

    test("3-way", () => {
      expect(
        createDiff3Way(
          up_up_property_name_and_class_parent.original,
          up_up_property_name_and_class_parent.left,
          up_up_property_name_and_class_parent.right
        )
      ).toStrictEqual({
        threeWay: true,
        differencesL: [
          {
            id: 0,
            kind: DifferenceOperationKind.DELETE,
            state: DifferenceState.UNRESOLVED,
            path: "/package/classes/2/attributes/0",
          },
          {
            id: 1,
            kind: DifferenceOperationKind.ADD,
            state: DifferenceState.UNRESOLVED,
            path: "/package/classes/0/attributes/0",
          },
        ],
        differencesR: [
          {
            id: 0,
            kind: DifferenceOperationKind.DELETE,
            state: DifferenceState.UNRESOLVED,
            path: "/package/classes/2/attributes/0",
          },
          {
            id: 1,
            kind: DifferenceOperationKind.ADD,
            state: DifferenceState.UNRESOLVED,
            path: "/package/classes/1/attributes/0",
          },
        ],
        conflicts: [
          {
            leftDiff: {
              $ref: "#/differencesL/1",
            },
            rightDiff: {
              $ref: "#/differencesR/1",
            },
          },
        ],
      });
    });
  });

  describe("reference from smart city outgoing to Component/Project/Category, reference id staying the same -> up-up conflict", () => {
    test("2-way: original - a", () => {
      expect(
        createDiff2Way(
          up_up_smartcity_reference.original,
          up_up_smartcity_reference.left
        )
      ).toStrictEqual([
        {
          op: "update",
          path: "/package/classes/0/references/0/type/$ref",
          value: "#/package/classes/2",
        },
      ]);
    });

    test("2-way: original - b", () => {
      expect(
        createDiff2Way(
          up_up_smartcity_reference.original,
          up_up_smartcity_reference.right
        )
      ).toStrictEqual([
        {
          op: "update",
          path: "/package/classes/0/references/0/type/$ref",
          value: "#/package/classes/1",
        },
      ]);
    });

    test("3-way", () => {
      expect(
        createDiff3Way(
          up_up_smartcity_reference.original,
          up_up_smartcity_reference.left,
          up_up_smartcity_reference.right
        )
      ).toStrictEqual({
        threeWay: true,
        differencesL: [
          {
            id: 0,
            kind: DifferenceOperationKind.UPDATE,
            state: DifferenceState.UNRESOLVED,
            path: "/package/classes/0/references/0/type/$ref",
          },
        ],
        differencesR: [
          {
            id: 0,
            kind: DifferenceOperationKind.UPDATE,
            state: DifferenceState.UNRESOLVED,
            path: "/package/classes/0/references/0/type/$ref",
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

  describe("reference from smart city outgoing to Component/Project/Category with reference id update -> up-up conflict", () => {
    test("2-way: original - a", () => {
      expect(
        createDiff2Way(
          up_up_smartcity_reference_with_id_value_change.original,
          up_up_smartcity_reference_with_id_value_change.left
        )
      ).toStrictEqual([
        {
          op: "delete",
          path: "/package/classes/0/references/0",
          value: {
            id: "name1",
            containment: true,
            upperBound: -1,
            lowerBound: 0,
            type: {
              $ref: "#/package/classes/3",
            },
          },
        },
        {
          op: "add",
          path: "/package/classes/0/references/0",
          value: {
            id: "name2",
            containment: true,
            upperBound: -1,
            lowerBound: 0,
            type: {
              $ref: "#/package/classes/2",
            },
          },
        },
      ]);
    });

    test("2-way: original - b", () => {
      expect(
        createDiff2Way(
          up_up_smartcity_reference_with_id_value_change.original,
          up_up_smartcity_reference_with_id_value_change.right
        )
      ).toStrictEqual([
        {
          op: "delete",
          path: "/package/classes/0/references/0",
          value: {
            id: "name1",
            containment: true,
            upperBound: -1,
            lowerBound: 0,
            type: {
              $ref: "#/package/classes/3",
            },
          },
        },
        {
          op: "add",
          path: "/package/classes/0/references/0",
          value: {
            id: "name3",
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
          up_up_smartcity_reference_with_id_value_change.original,
          up_up_smartcity_reference_with_id_value_change.left,
          up_up_smartcity_reference_with_id_value_change.right
        )
      ).toStrictEqual({
        threeWay: true,
        differencesL: [
          {
            id: 0,
            kind: DifferenceOperationKind.DELETE,
            state: DifferenceState.UNRESOLVED,
            path: "/package/classes/0/references/0",
          },
          {
            id: 1,
            kind: DifferenceOperationKind.ADD,
            state: DifferenceState.UNRESOLVED,
            path: "/package/classes/0/references/0",
          },
        ],
        differencesR: [
          {
            id: 0,
            kind: DifferenceOperationKind.DELETE,
            state: DifferenceState.UNRESOLVED,
            path: "/package/classes/0/references/0",
          },
          {
            id: 1,
            kind: DifferenceOperationKind.ADD,
            state: DifferenceState.UNRESOLVED,
            path: "/package/classes/0/references/0",
          },
        ],
        conflicts: [],
      });
    });
  });
}
