import { InputModels } from "../../src/interfaces/inputmodels.js";
import { createDiff2Way, createDiff3Way } from "../../src/services/compare.js";
import { testsEnabled } from "../configs.js";

// TEST MODEL

const d_up_attribute_multiplicity_lowerUpperBound: InputModels = {
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

const d_up_containment_multiplicity_lowerUpperBound: InputModels = {
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
              upperBound: 10,
              lowerBound: 0,
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

// TESTS

if (testsEnabled["d-up"] === true) {
  describe("update Category attribute multiplicity and delete Category class -> d-up conflict", () => {
    test("2-way: original - a", () => {
      expect(
        createDiff2Way(
          d_up_attribute_multiplicity_lowerUpperBound.original,
          d_up_attribute_multiplicity_lowerUpperBound.left
        )
      ).toStrictEqual([
        {
          op: "remove",
          path: "/package/classes/1",
          value: {
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
        },
        {
          op: "remove",
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
          d_up_attribute_multiplicity_lowerUpperBound.original,
          d_up_attribute_multiplicity_lowerUpperBound.right
        )
      ).toStrictEqual([
        {
          op: "replace",
          path: "/package/classes/1/attributes/0/lowerBound",
          value: 1,
        },
        {
          op: "replace",
          path: "/package/classes/1/attributes/0/upperBound",
          value: 17,
        },
      ]);
    });

    test("3-way", () => {
      expect(
        createDiff3Way(
          d_up_attribute_multiplicity_lowerUpperBound.original,
          d_up_attribute_multiplicity_lowerUpperBound.left,
          d_up_attribute_multiplicity_lowerUpperBound.right
        )
      ).toBeUndefined();
    });
  });

  describe("update multiplicity of reference between SmartCity and Category and delete this referece -> d-up conflict", () => {
    test("2-way: original - a", () => {
      expect(
        createDiff2Way(
          d_up_containment_multiplicity_lowerUpperBound.original,
          d_up_containment_multiplicity_lowerUpperBound.left
        )
      ).toStrictEqual([
        {
          op: "remove",
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
          d_up_containment_multiplicity_lowerUpperBound.original,
          d_up_containment_multiplicity_lowerUpperBound.right
        )
      ).toStrictEqual([
        {
          op: "replace",
          path: "/package/classes/0/references/0/lowerBound",
          value: 0,
        },
        {
          op: "replace",
          path: "/package/classes/0/references/0/upperBound",
          value: 10,
        },
      ]);
    });

    test("3-way", () => {
      expect(
        createDiff3Way(
          d_up_containment_multiplicity_lowerUpperBound.original,
          d_up_containment_multiplicity_lowerUpperBound.left,
          d_up_containment_multiplicity_lowerUpperBound.right
        )
      ).toBeUndefined();
    });
  });
}
