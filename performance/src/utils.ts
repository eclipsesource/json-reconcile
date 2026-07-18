import path from "path";
import fs from "fs";
import { X2jOptions, XMLParser } from "fast-xml-parser";

export function convertAllXML(xmlFolderPath: string, jsonFolderPath: string) {
  // Get all file names from the folder
  const fileNames = fs.readdirSync(xmlFolderPath);

  console.log("----------- create map with json filenames and contents");
  const jsonFiles = allXmlToJson(xmlFolderPath, fileNames);

  console.log("----------- create map with index xmiIds mapped to paths");
  const jsonIndex = allJsonIndex(jsonFiles);

  console.log("----------- replace ids and write json");
  resolveRefsAndWrite(jsonFolderPath, jsonFiles, jsonIndex);
}

function allXmlToJson(
  xmlFolderPath: string,
  fileNames: string[],
): Map<string, string> {
  const jsonFiles = new Map<string, string>();

  for (const fileName of fileNames) {
    if (fileName === ".gitkeep") {
      continue;
    }
    const xmlContent = getFile(xmlFolderPath, fileName);

    const { name: jsonFileName } = path.parse(fileName);

    jsonFiles.set(jsonFileName, xmlToJson(xmlContent));
  }

  return jsonFiles;
}

function allJsonIndex(jsonFiles: Map<string, unknown>): Map<string, string> {
  const idIndex = new Map<string, string>();

  for (const [, json] of jsonFiles) {
    indexIds(json, "", idIndex);
  }

  return idIndex;
}

function indexIds(
  node: unknown,
  pointer: string,
  index: Map<string, string>,
): void {
  if (Array.isArray(node)) {
    node.forEach((item, i) => indexIds(item, `${pointer}/${i}`, index));
    return;
  }

  if (node !== null && typeof node === "object") {
    const obj = node as Record<string, unknown>;
    const id = obj["$xmi:id"];
    if (typeof id === "string" && id.length > 0) {
      index.set(id, pointer);
    }
    for (const key of Object.keys(obj)) {
      indexIds(obj[key], `${pointer}/${key}`, index);
    }
  }
}

function resolveRefsAndWrite(
  jsonFolderPath: string,
  jsonFiles: Map<string, string>,
  jsonIndex: Map<string, string>,
) {
  for (const [filename, json] of jsonFiles) {
    const updatedJsonContent = JSON.stringify(json, null, 2).replace(
      /"\$ref": "([^"]*)"/g, // e.g. "$ref": "package_2_0.json#_Nm1lkfSyEeC7b93Q5ZPZDw"
      (_, captureGroup) => resolveHref(captureGroup, jsonIndex),
    );

    writeJson(jsonFolderPath, updatedJsonContent, filename);
  }
}

function resolveHref(href: string, index: Map<string, string>): string {
  const match = href.match(/^([^#]*)#(.+)$/); // e.g. package_2_0.json#_Nm1lkfSyEeC7b93Q5ZPZDw
  if (match) {
    const [, filename, id] = match;
    const pointer = index.get(id);

    if (pointer) {
      return `"$ref": "${filename}#${pointer}"`;
    }
  }

  console.warn("Could not resolve xmi:id ??? Couldnot find index ???");
  return `"$ref": "${href}"`;
}

export function getFile(folderPath: string, fileName: string): string {
  const filePath = path.join(folderPath, fileName);

  const fileContent = fs.readFileSync(filePath, "utf8");

  return fileContent;
}

function xmlToJson(xmlContent: string): string {
  const options: X2jOptions = {
    ignoreDeclaration: true,
    ignoreAttributes: false,
    parseAttributeValue: true,
    attributeValueProcessor: (attrName: string, attrValue: string) => {
      if (attrName === "href") {
        return attrValue.replace(/\.uml(#|$)/, ".json$1");
      }
      return attrValue;
    },
    attributeNamePrefix: "$",

    transformAttributeName: (attributeName: string) => {
      return attributeName === "$href" ? "$ref" : attributeName;
    },
    transformTagName: (tagName: string) => {
      if (tagName === "xmi:XMI") {
        return "xmi_XMI";
      } else if (tagName === "uml:Model") {
        return "uml_Model";
      }

      return tagName;
    },
  };

  const parser = new XMLParser(options);

  return parser.parse(xmlContent, true);
}

export function writeJson(
  targetPath: string,
  stringifiedContent: string,
  filename: string,
): void {
  const fullPath = path.join(targetPath, `${filename}.json`);
  fs.writeFile(
    fullPath,
    stringifiedContent,
    { flag: "w", encoding: "utf8" }, // file will be created if it does not exist
    (err: unknown) => {
      if (err) throw err;
    },
  );
}
