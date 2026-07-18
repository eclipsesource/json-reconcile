import $RefParser, { FileInfo } from "@apidevtools/json-schema-ref-parser";
import {
  findRefs,
  resolveRefsAt,
  RetrievedResolvedRefsResults,
} from "json-refs";
import path from "path";
import fs from "fs";

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

export function resolveAllRefs_Sol1(
  jsonFilePath: string,
): Promise<RetrievedResolvedRefsResults> {
  // console.log(res.refs); // JSON Reference locations and details
  // console.log(JSON.stringify(res.resolved)); // The document with the appropriate JSON References resolved
  return resolveRefsAt(jsonFilePath, {
    filter: ["relative"],
  });
}

export async function resolveAllRefs2_bunde(
  folderPath: string,
  jsonFilePath: string,
): Promise<object> {
  console.time("prepFileCache");

  const fileCache = new Map<string, unknown>();
  const fileNames = fs.readdirSync(folderPath);

  for (const file of fileNames) {
    if (file.endsWith(".json")) {
      const filePath = path.join(folderPath, file);

      const fileContent = fs.readFileSync(filePath, "utf8");
      fileCache.set(file, JSON.parse(fileContent));
    }
  }

  console.timeEnd("prepFileCache");

  let count = 1;

  const newSchema = await $RefParser.bundle(jsonFilePath, {
    mutateInputSchema: false,
    continueOnError: false,
    resolve: {
      file: {
        read(file: FileInfo) {
          console.log(count);
          count++;
          const name = file.url.split("/");
          return fileCache.get(name[name.length - 1]);
        },
      },
    },
  });


  // const refs = findRefs(newSchema);

  // console.log(refs);

  return newSchema;
}

export async function resolveAllRefs3_dereference(
  jsonFilePath: string,
): Promise<object> {

  const newSchema = await $RefParser.dereference(jsonFilePath, {
    mutateInputSchema: false,
    continueOnError: false,
  });

  // const refs = findRefs(newSchema);

  // console.log(refs);

  return newSchema;
}

export function directRefExists(pathToCompare: string, value: object): boolean {
  console.log("------- directRefExists function ------");
  console.log("input parameter value: ", value);
  const refs = findRefs(value);

  console.log(refs);

  const uriReferencePath = "#" + pathToCompare;

  for (const key in refs) {
    if (refs[key]!.uri === uriReferencePath) {
      // console.log("found uri: ", refs[key]);
      return true;
    }
  }

  return false;
}

export function childParentRefExists(
  pathToCompare: string,
  value: object,
): boolean {
  console.log("------- childParentRefExists function ------");
  console.log("input parameter value: ", value);
  const refs = findRefs(value);

  console.log("REFS: ", refs);

  const uriReferencePath = "#" + pathToCompare;

  for (const key in refs) {
    if (refs[key] === undefined) {
      console.error("UNDEFINED REF for KEY", key);
      return false;
    }
    const foundUri = refs[key].uri;
    if (
      (foundUri.startsWith(uriReferencePath) &&
        foundUri.split("/").length > uriReferencePath.split("/").length) ||
      foundUri === uriReferencePath
    ) {
      // console.log("found uri: ", refs[key]);
      return true;
    }
  }

  return false;
}
