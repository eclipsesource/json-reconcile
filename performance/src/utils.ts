import path, { dirname } from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import { XMLParser } from "fast-xml-parser";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const parser = new XMLParser();

export function getFile(filePath: string): string {
  const fullPath = path.join(__dirname, "../data/", filePath);

  const fileContent = fs.readFileSync(fullPath, "utf-8");

  return fileContent;
}

export function xmlToJsonAndWrite(xml: string, pathToSave: string): string {
  const json = parser.parse(xml, true);

  console.log(JSON.stringify(json));

  writeJson(pathToSave, json);

  return json;
}

function writeJson(path: string, content: string) {
  fs.writeFile(
    path + "/json/model.json",
    JSON.stringify(content, null, 2),
    { flag: "w", encoding: "utf8" },
    (err: Error) => {
      if (err) throw err;
    },
  );
}
