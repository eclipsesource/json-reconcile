import { InputModels } from "../../src/interfaces/inputmodels.js";
import { createDiff2Way, createDiff3Way } from "../../src/services/compare.js";

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
  a: {
    package: {
      id: "scml",
      classes: [
        {
          id: "SmartCity",
        },
      ],
    },
  },
  b: {
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
              upperBound: -1, // -1 = *
              lowerBound: 0,
              type: "Category",
            },
            {
              id: "project",
              containment: true,
              upperBound: -1, // -1 = *
              lowerBound: 0,
              type: "Project",
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
              type: "Category",
            },
          ],
        },
        {
          id: "Category",
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
              id: "category",
              containment: true,
              upperBound: -1, // -1 = *
              lowerBound: 0,
              type: "Category",
            },
            {
              id: "project",
              containment: true,
              upperBound: -1, // -1 = *
              lowerBound: 0,
              type: "Project",
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
              type: "Category",
            },
          ],
        },
        {
          id: "Category",
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
              id: "category",
              containment: true,
              upperBound: -1, // -1 = *
              lowerBound: 0,
              type: "Category",
            },
            {
              id: "project",
              containment: true,
              upperBound: -1, // -1 = *
              lowerBound: 0,
              type: "Project",
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
              type: "Category",
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

// TESTS

describe("smart city class name string change -> up-up conflict", () => {
  test("2-way: original - a", () => {
    expect(
      createDiff2Way(up_up_className.original, up_up_className.a)
    ).toStrictEqual([
      { op: "remove", path: "/package/classes/0" },
      { op: "add", path: "/package/classes/0", value: { id: "SmartCity" } },
    ]);
  });

  test("2-way: original - b", () => {
    expect(
      createDiff2Way(up_up_className.original, up_up_className.b)
    ).toStrictEqual([
      { op: "remove", path: "/package/classes/0" },
      { op: "add", path: "/package/classes/0", value: { id: "Smart_City" } },
    ]);
  });

  test("3-way", () => {
    expect(
      createDiff3Way(
        up_up_className.original,
        up_up_className.a,
        up_up_className.b
      )
    ).toBeUndefined();
  });
});

/* describe("relation between Project and Category - lower/upper bound change -> up-up conflict", () => {
    test("2-way: original - a", () => {
      expect(
        createDiff2Way(
          up_up_mulitplicity_lowerUpperBound.original,
          up_up_mulitplicity_lowerUpperBound.a
        )
      ).toStrictEqual({
        package: { class: { name: ["Smart City", "SmartCity"] } },
      });
    });
  
    test("2-way: original - b", () => {
      expect(
        createDiff2Way(
          up_up_mulitplicity_lowerUpperBound.original,
          up_up_mulitplicity_lowerUpperBound.b
        )
      ).toStrictEqual({
        package: { class: { name: ["Smart City", "Smart_City"] } },
      });
    });
  
    test("3-way", () => {
      expect(
        createDiff3Way(
          up_up_mulitplicity_lowerUpperBound.original,
          up_up_mulitplicity_lowerUpperBound.a,
          up_up_mulitplicity_lowerUpperBound.b
        )
      ).toBeUndefined();
    });
  });
   */
