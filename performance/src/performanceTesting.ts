import fs from "fs";
import path, { dirname } from "path";
import { createDiff } from "../../src/services/createDiff.js";
import { InputModels } from "../../src/interfaces/inputmodels.js";
import { fileURLToPath } from "url";
import { getFile, xmlToJsonAndWrite } from "./utils.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

function measure<T>(name: string, fn: () => T): T {
  console.time(name);
  const result = fn();
  console.timeEnd(name);
  return result;
}

function runAllPerformanceTests(xml: boolean) {
  let jsonL = "";
  let jsonR = "";

  if (xml) {
    const fileL = getFile("smallModel/original/model.uml");
    const fileR = getFile("smallModel/A/model.uml");

    const fullPath = path.join(__dirname, "../data/smallModel");

    jsonL = xmlToJsonAndWrite(fullPath + "/original", fileL);
    jsonR = xmlToJsonAndWrite(fullPath + "/A", fileR);
  } else {
    jsonL = JSON.parse(getFile("smallModel/original/json/model.json"));
    jsonR = JSON.parse(getFile("smallModel/A/json/model.json"));
  }

  const inputModels: InputModels = {
    left: jsonL,
    right: jsonR,
  };

  const diffmodel = measure("Small Model", () => {
    const result = createDiff(inputModels);
    return result;
  });

  console.log(diffmodel);
}

runAllPerformanceTests(false);
