import { InputModels } from "../../src/interfaces/inputmodels";

export const up_up_className: InputModels = {
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

export const up_up_mulitplicity_lowerUpperBound: InputModels = {
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
