import fs from "fs";
import path, { dirname } from "path";
import { createDiff } from "../../src/services/createDiff.js";
import { InputModels } from "../../src/interfaces/inputmodels.js";
import { fileURLToPath } from "url";
import { convertAllXML, getFile } from "./utils.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

enum Size {
  SMALL = "small",
  NOMINAL = "nominal",
  LARGE = "large",
}

enum Side {
  MODIFIED = "modified",
  ORIGINAL = "original",
}

const xmlFolderPath = path.join(
  __dirname,
  `../data/EMFCompare_Models/model_size_${Size.LARGE}/${Side.ORIGINAL}`,
);

const jsonFolderPath = path.join(
  __dirname,
  `../data/${Size.LARGE}/${Side.ORIGINAL}`,
);

function measure<T>(name: string, fn: () => T): T {
  console.time(name);
  const result = fn();
  console.timeEnd(name);
  return result;
}

function runPerformanceTest(size: string) {
  const fullPath = path.join(__dirname, `../data/${size}`);
  const modelFileName = "model.json";

  const inputModels: InputModels = {
    left: getFile(`${fullPath}/original`, modelFileName),
    right: getFile(`${fullPath}/A`, modelFileName),
  };

  const diffmodel = measure("Small Model", () => {
    const result = createDiff(inputModels);
    return result;
  });

  console.log(diffmodel);
}

convertAllXML(xmlFolderPath, jsonFolderPath);

// runPerformanceTest('small');
