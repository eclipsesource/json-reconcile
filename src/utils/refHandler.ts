import $RefParser from "@apidevtools/json-schema-ref-parser";

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
export async function tryOutJSONRefLib(): Promise<void> {
  const clonedSchema = await $RefParser.dereference(referencesWithRef, {
    mutateInputSchema: false,
  });

  console.log("deeereferenceeeee");

  console.log(JSON.stringify(clonedSchema));

  const resolved = await $RefParser.resolve(referencesWithRef, {
    mutateInputSchema: false,
  });
  console.log("resooolveeeee");
  console.log("PAAAAAATTTHSS", resolved.paths());
  console.log("VAAAALUUUUEEES", JSON.stringify(resolved.values()));
  console.log("EEEXXXIIISTSTSS", resolved.exists("#/package/classes/1", null));
}

export function getAllReferences(): void {
  // TODO
  // before diff
  // get all outgoing references with source and target
  // return this list
}
