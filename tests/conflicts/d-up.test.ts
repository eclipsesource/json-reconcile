import { DifferenceState } from "../../src/interfaces/diffmodel.js";
import { InputModels } from "../../src/interfaces/inputmodels.js";
import { DifferenceOperationKind } from "../../src/interfaces/util.js";
import { createDiff2Way, createDiff3Way } from "../../src/services/compare.js";
import { testsEnabled } from "../configs.js";

// TEST MODEL
const d_up_attribute_multiplicity_upperBound: InputModels = {
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
              lowerBound: 1,
              type: {
                $ref: "#/package/classes/1",
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
              lowerBound: 1,
              type: {
                $ref: "#/package/classes/1",
              },
            },
          ],
        },
        {
          id: "Category",
          attributes: [
            {
              id: "SDG",
              lowerBound: 1,
              type: "int",
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
              id: "category",
              containment: true,
              upperBound: -1,
              lowerBound: 1,
              type: {
                $ref: "#/package/classes/1",
              },
            },
          ],
        },
        {
          id: "Category",
          attributes: [
            {
              id: "SDG",
              upperBound: 17,
              lowerBound: 1,
              type: "int",
            },
          ],
        },
      ],
    },
  },
};

const d_up_attribute_multiplicity_upperBound_delete_parent: InputModels = {
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
              lowerBound: 1,
              type: {
                $ref: "#/package/classes/1",
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
      ],
    },
  },
  left: {
    package: {
      id: "scml",
      classes: [
        {
          id: "Smart City",
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
              lowerBound: 1,
              type: {
                $ref: "#/package/classes/1",
              },
            },
          ],
        },
        {
          id: "Category",
          attributes: [
            {
              id: "SDG",
              upperBound: 17,
              lowerBound: 1,
              type: "int",
            },
          ],
        },
      ],
    },
  },
};

const d_up_containment_multiplicity_upperBound: InputModels = {
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
              lowerBound: 1,
              type: "Category",
            },
          ],
        },
        {
          id: "Category",
          attributes: [
            {
              id: "SDG",
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
          references: [],
        },
        {
          id: "Category",
          attributes: [
            {
              id: "SDG",
              upperBound: -1,
              lowerBound: 0,
              type: "int",
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
              id: "category",
              containment: true,
              upperBound: 17,
              lowerBound: 1,
              type: "Category",
            },
          ],
        },
        {
          id: "Category",
          attributes: [
            {
              id: "SDG",
              upperBound: -1,
              lowerBound: 0,
              type: "int",
            },
          ],
        },
      ],
    },
  },
};

const d_up_attribute_multiplicity_upperbound_child_parent: InputModels = {
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
          childs: [
            {
              id: "Project",
              references: [
                {
                  id: "category",
                  upperBound: -1,
                  lowerBound: 0,
                  type: {
                    $ref: "#/package/classes/2",
                  },
                },
              ],
              childs: [
                {
                  id: "Category",
                  attributes: [
                    {
                      id: "SDG",
                      upperBound: -1,
                      lowerBound: 0,
                      type: "int",
                    },
                  ],
                },
              ],
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
              upperBound: -1,
              lowerBound: 0,
              type: {
                $ref: "#/package/classes/1",
              },
            },
          ],
          childs: [],
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
          childs: [
            {
              id: "Project",
              references: [
                {
                  id: "category",
                  upperBound: -1,
                  lowerBound: 0,
                  type: {
                    $ref: "#/package/classes/2",
                  },
                },
              ],
              childs: [
                {
                  id: "Category",
                  attributes: [
                    {
                      id: "SDG",
                      upperBound: 17,
                      lowerBound: 0,
                      type: "int",
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    },
  },
};

const d_up_i_delete_elem_add_elem_in_array: InputModels = {
  original: {
    package: {
      id: "scml",
      classes: [
        {
          id: "Smart City",
        },
        {
          id: "Project",
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
        },
        {
          id: "Project",
        },
        {
          id: "Category",
        },
      ],
    },
  },
};

// TESTS

if (testsEnabled["d-up"] === true) {
  describe("update Category attribute multiplicity upper bound and delete this attribute upper bound -> d-up conflict", () => {
    test("2-way: original - a", () => {
      expect(
        createDiff2Way(
          d_up_attribute_multiplicity_upperBound.original,
          d_up_attribute_multiplicity_upperBound.left
        )
      ).toStrictEqual([
        {
          op: "delete",
          path: "/package/classes/1/attributes/0/upperBound",
          value: -1,
        },
      ]);
    });

    test("2-way: original - b", () => {
      expect(
        createDiff2Way(
          d_up_attribute_multiplicity_upperBound.original,
          d_up_attribute_multiplicity_upperBound.right
        )
      ).toStrictEqual([
        {
          op: "update",
          path: "/package/classes/1/attributes/0/upperBound",
          value: 17,
        },
      ]);
    });

    test("3-way", () => {
      expect(
        createDiff3Way(
          d_up_attribute_multiplicity_upperBound.original,
          d_up_attribute_multiplicity_upperBound.left,
          d_up_attribute_multiplicity_upperBound.right
        )
      ).toStrictEqual({
        threeWay: true,
        differencesL: [
          {
            id: 0,
            kind: DifferenceOperationKind.DELETE,
            state: DifferenceState.UNRESOLVED,
            path: "/package/classes/1/attributes/0/upperBound",
          },
        ],
        differencesR: [
          {
            id: 0,
            kind: DifferenceOperationKind.UPDATE,
            state: DifferenceState.UNRESOLVED,
            path: "/package/classes/1/attributes/0/upperBound",
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

  describe("update Category attribute multiplicity upper bound and delete parent Category class -> d-up conflict", () => {
    test("2-way: original - a", () => {
      expect(
        createDiff2Way(
          d_up_attribute_multiplicity_upperBound_delete_parent.original,
          d_up_attribute_multiplicity_upperBound_delete_parent.left
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
            lowerBound: 1,
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
          d_up_attribute_multiplicity_upperBound_delete_parent.original,
          d_up_attribute_multiplicity_upperBound_delete_parent.right
        )
      ).toStrictEqual([
        {
          op: "update",
          path: "/package/classes/1/attributes/0/upperBound",
          value: 17,
        },
      ]);
    });

    test("3-way", () => {
      expect(
        createDiff3Way(
          d_up_attribute_multiplicity_upperBound_delete_parent.original,
          d_up_attribute_multiplicity_upperBound_delete_parent.left,
          d_up_attribute_multiplicity_upperBound_delete_parent.right
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
        ],
        differencesR: [
          {
            id: 0,
            kind: DifferenceOperationKind.UPDATE,
            state: DifferenceState.UNRESOLVED,
            path: "/package/classes/1/attributes/0/upperBound",
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

  describe("delete parent Project of child Category class and update attribute multiplicity of Category class - parent - child -> d-up conflict", () => {
    test("2-way: original - a", () => {
      expect(
        createDiff2Way(
          d_up_attribute_multiplicity_upperbound_child_parent.original,
          d_up_attribute_multiplicity_upperbound_child_parent.left
        )
      ).toStrictEqual([
        {
          op: "delete",
          path: "/package/classes/0/childs/0",
          value: {
            id: "Project",
            references: [
              {
                id: "category",
                upperBound: -1,
                lowerBound: 0,
                type: {
                  $ref: "#/package/classes/2",
                },
              },
            ],
            childs: [
              {
                id: "Category",
                attributes: [
                  {
                    id: "SDG",
                    upperBound: -1,
                    lowerBound: 0,
                    type: "int",
                  },
                ],
              },
            ],
          },
        },
      ]);
    });

    test("2-way: original - b", () => {
      expect(
        createDiff2Way(
          d_up_attribute_multiplicity_upperbound_child_parent.original,
          d_up_attribute_multiplicity_upperbound_child_parent.right
        )
      ).toStrictEqual([
        {
          op: "update",
          path: "/package/classes/0/childs/0/childs/0/attributes/0/upperBound",
          value: 17,
        },
      ]);
    });

    test("3-way", () => {
      expect(
        createDiff3Way(
          d_up_attribute_multiplicity_upperbound_child_parent.original,
          d_up_attribute_multiplicity_upperbound_child_parent.left,
          d_up_attribute_multiplicity_upperbound_child_parent.right
        )
      ).toStrictEqual({
        threeWay: true,
        differencesL: [
          {
            id: 0,
            kind: DifferenceOperationKind.DELETE,
            state: DifferenceState.UNRESOLVED,
            path: "/package/classes/0/childs/0",
          },
        ],
        differencesR: [
          {
            id: 0,
            kind: DifferenceOperationKind.UPDATE,
            state: DifferenceState.UNRESOLVED,
            path: "/package/classes/0/childs/0/childs/0/attributes/0/upperBound",
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

  describe("update upper bound multiplicity of reference between SmartCity and Category and delete this referece -> d-up conflict", () => {
    test("2-way: original - a", () => {
      expect(
        createDiff2Way(
          d_up_containment_multiplicity_upperBound.original,
          d_up_containment_multiplicity_upperBound.left
        )
      ).toStrictEqual([
        {
          op: "delete",
          path: "/package/classes/0/references/0",
          value: {
            id: "category",
            containment: true,
            upperBound: -1,
            lowerBound: 1,
            type: "Category",
          },
        },
      ]);
    });

    test("2-way: original - b", () => {
      expect(
        createDiff2Way(
          d_up_containment_multiplicity_upperBound.original,
          d_up_containment_multiplicity_upperBound.right
        )
      ).toStrictEqual([
        {
          op: "update",
          path: "/package/classes/0/references/0/upperBound",
          value: 17,
        },
      ]);
    });

    test("3-way", () => {
      expect(
        createDiff3Way(
          d_up_containment_multiplicity_upperBound.original,
          d_up_containment_multiplicity_upperBound.left,
          d_up_containment_multiplicity_upperBound.right
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
        ],
        differencesR: [
          {
            id: 0,
            kind: DifferenceOperationKind.UPDATE,
            state: DifferenceState.UNRESOLVED,
            path: "/package/classes/0/references/0/upperBound",
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

  // ????? more clarification needed what should happen here?
  describe("delete elem on index 1 array and add elem on index 2 array -> d-up/d-i? conflict", () => {
    test("2-way: original - a", () => {
      expect(
        createDiff2Way(
          d_up_i_delete_elem_add_elem_in_array.original,
          d_up_i_delete_elem_add_elem_in_array.left
        )
      ).toStrictEqual([
        {
          op: "delete",
          path: "/package/classes/1",
          value: {
            id: "Project",
          },
        },
      ]);
    });

    test("2-way: original - b", () => {
      expect(
        createDiff2Way(
          d_up_i_delete_elem_add_elem_in_array.original,
          d_up_i_delete_elem_add_elem_in_array.right
        )
      ).toStrictEqual([
        {
          op: "add",
          path: "/package/classes/2",
          value: {
            id: "Category",
          },
        },
      ]);
    });

    test("3-way", () => {
      expect(
        createDiff3Way(
          d_up_i_delete_elem_add_elem_in_array.original,
          d_up_i_delete_elem_add_elem_in_array.left,
          d_up_i_delete_elem_add_elem_in_array.right
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
        ],
        differencesR: [
          {
            id: 0,
            kind: DifferenceOperationKind.ADD,
            state: DifferenceState.UNRESOLVED,
            path: "/package/classes/2",
          },
        ],
        conflicts: ["?? TEST ??"],
      });
    });
  });
}
