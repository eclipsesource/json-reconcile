import { InputModels } from "../../src/interfaces/inputmodels.js";
import { createDiff2Way, createDiff3Way } from "../../src/services/compare.js";
import { testsEnabled } from "../configs.js";

// TEST MODEL

const up_up_className: InputModels = {
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

const up_up_mulitplicity_lowerUpperBound: InputModels = {
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
              lowerBound: 2,
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
              upperBound: 7,
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
  describe("smart city class name string change -> up-up conflict", () => {
    test("2-way: original - a", () => {
      expect(
        createDiff2Way(up_up_className.original, up_up_className.left)
      ).toStrictEqual([
        {
          op: "remove",
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
        createDiff2Way(up_up_className.original, up_up_className.right)
      ).toStrictEqual([
        {
          op: "remove",
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
          up_up_className.original,
          up_up_className.left,
          up_up_className.right
        )
      ).toBeUndefined();
    });
  });

  describe("relation between Project and Category - lower/upper bound change -> up-up conflict", () => {
    test("2-way: original - a", () => {
      expect(
        createDiff2Way(
          up_up_mulitplicity_lowerUpperBound.original,
          up_up_mulitplicity_lowerUpperBound.left
        )
      ).toStrictEqual([
        {
          op: "replace",
          path: "/package/classes/1/references/0/lowerBound",
          value: 2,
        },
        {
          op: "replace",
          path: "/package/classes/1/references/0/upperBound",
          value: -1,
        },
      ]);
    });

    test("2-way: original - b", () => {
      expect(
        createDiff2Way(
          up_up_mulitplicity_lowerUpperBound.original,
          up_up_mulitplicity_lowerUpperBound.right
        )
      ).toStrictEqual([
        {
          op: "replace",
          path: "/package/classes/1/references/0/lowerBound",
          value: 0,
        },
        {
          op: "replace",
          path: "/package/classes/1/references/0/upperBound",
          value: 7,
        },
      ]);
    });

    test("3-way", () => {
      expect(
        createDiff3Way(
          up_up_mulitplicity_lowerUpperBound.original,
          up_up_mulitplicity_lowerUpperBound.left,
          up_up_mulitplicity_lowerUpperBound.right
        )
      ).toBeUndefined();
    });
  });

  describe("reference from smart city outgoing to Component/Project/Category -> up-up conflict", () => {
    test("2-way: original - a", () => {
      expect(
        createDiff2Way(
          up_up_smartcity_reference.original,
          up_up_smartcity_reference.left
        )
      ).toStrictEqual([
        {
          op: "remove",
          path: "/package/classes/0/references/0",
          value: {
            id: "component",
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
            id: "project",
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
          up_up_smartcity_reference.original,
          up_up_smartcity_reference.right
        )
      ).toStrictEqual([
        {
          op: "remove",
          path: "/package/classes/0/references/0",
          value: {
            id: "component",
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
            id: "category",
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
          up_up_smartcity_reference.original,
          up_up_smartcity_reference.left,
          up_up_smartcity_reference.right
        )
      ).toBeUndefined();
    });
  });
}
