import $RefParser from "@apidevtools/json-schema-ref-parser";
import { findRefs, resolveRefs } from "json-refs";

const referencesWithRef = {
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
      },
    ],
  },
};
export function tryOutFirstJSONRefLib(): void {
  $RefParser
    .dereference(referencesWithRef, {
      mutateInputSchema: false,
    })
    .then(
      (clonedSchema) => {
        console.log("FIIIIRST: deeereferenceeeee");

        console.log(JSON.stringify(clonedSchema));
      },
      (err) => {
        console.log(err.stack);
      }
    );

  $RefParser
    .resolve(referencesWithRef, {
      mutateInputSchema: false,
    })
    .then(
      (res) => {
        console.log("FIIIIRST: resooolveeeee");
        console.log(res.circular);
        console.log(JSON.stringify(res.values()));
      },
      (err) => {
        console.log(err.stack);
      }
    );
}

export function tryOutSecondJSONRefLib(): void {
  const allRefs = findRefs(referencesWithRef);

  console.log("SEECOOOONNND: findRefs");
  console.log(allRefs);

  resolveRefs(referencesWithRef, {}).then(
    (res) => {
      console.log("SEECOOOONNND: resolveRefs");
      console.log(res.refs);
      console.log(JSON.stringify(res.resolved));
    },
    (err) => {
      console.log(err.stack);
    }
  );
}
