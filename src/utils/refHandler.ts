import $RefParser from "@apidevtools/json-schema-ref-parser";
import { findRefs } from "json-refs";

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

export async function tryOutJSONRefLib1(): Promise<void> {
  const clonedSchema = await $RefParser.dereference(referencesWithRef, {
    mutateInputSchema: false,
  });

  console.log("deeereferenceeeee");

  console.log(JSON.stringify(clonedSchema));

  const resolved = await $RefParser.resolve(referencesWithRef.package.classes, {
    mutateInputSchema: false,
  });
  console.log("resooolveeeee");
  console.log("PAAAAAATTTHSS", resolved.paths());
  console.log("VAAAALUUUUEEES", JSON.stringify(resolved.values()));

  console.log("EEEXXXIIISTSTSS", resolved.exists("#/package/classes/1", null));
}

export function tryOutJSONRefsLib2(): void {
  const allRefs = findRefs(referencesWithRef);

  console.log(allRefs);

  const allRefsPart = findRefs(referencesWithRef.package.classes);

  console.log(allRefsPart);
}

export function getAllReferences(): void {
  // TODO
  // before diff
  // get all outgoing references with source and target
  // return this list
}

export function directRefExists(referencepath: string, value: object): boolean {
  console.log("------- directRefExists function ------");
  console.log("input parameter value: ", value);
  const refs = findRefs(value);

  console.log(refs);

  const uriReferencePath = "#" + referencepath;

  for (const key in refs) {
    if (refs[key]!.uri === uriReferencePath) {
      console.log("found uri: ", refs[key]);
      return true;
    }
  }

  return false;
}
