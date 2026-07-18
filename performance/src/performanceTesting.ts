import path, { dirname } from "path";
import { InputModels } from "../../src/interfaces/inputmodels.js";
import { fileURLToPath } from "url";
import { convertAllXML, writeJson } from "./utils.js";
import { resolveAllRefs2_bunde, resolveAllRefs_Sol1 } from "../../src/utils/refHandler.js";
import { JSONValue } from "../../src/utils/jsonHelper.js";
import * as comparissonMergingService from "../../src/services/comparisonMerging.service.js";


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

const selectedSize = Size.SMALL;
const selectedSide = Side.ORIGINAL;

const xmlFolderPath = path.join(
  __dirname,
  `../data/EMFCompare_Models/model_size_${selectedSize}/${selectedSide}`,
);

const jsonFolderPath = path.join(
  __dirname,
  `../data/${selectedSize}/${selectedSide}`,
);

function measure<T>(name: string, fn: () => T): T {
  console.time(name);
  const result = fn();
  console.timeEnd(name);
  return result;
}

function runPerformanceTest(size: Size) {
  const fullPath = path.join(__dirname, `../data/${size}`);
  const modelFileName = "model.json";

  console.time("resolveRefs");
  Promise.all([
    resolveAllRefs2_bunde(
      `${fullPath}/${Side.ORIGINAL}`,
      `${fullPath}/${Side.ORIGINAL}/${modelFileName}`,
    ),
    resolveAllRefs2_bunde(
      `${fullPath}/${Side.MODIFIED}`,
      `${fullPath}/${Side.MODIFIED}/${modelFileName}`,
    ),
  ])
    .then((res) => {
      console.timeEnd("resolveRefs");

      const inputModels: InputModels = {
        left: res[0] as JSONValue,
        right: res[1] as JSONValue,
      };

      writeJson(fullPath, JSON.stringify(inputModels.left, null, 2), 'original_ref');
      writeJson(fullPath, JSON.stringify(inputModels.right, null, 2), 'modified_ref');

      const diffmodel = measure(`${size} MODEL - Diff`, () => {
        const result = comparissonMergingService.createDiff(inputModels);
        return result;
      });

      // console.log(diffmodel.differencesL, null, 2)
      console.log(diffmodel.differencesL.length);
      console.log(diffmodel.differencesR.length);
    })
    .catch((err) => console.log(err.stack));
}

const args = process.argv.slice(2);

if (args.length > 0 && args[0] === "convert") {
  convertAllXML(xmlFolderPath, jsonFolderPath);
} else {
  runPerformanceTest(selectedSize);
}
