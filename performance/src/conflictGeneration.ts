import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import seedrandom from 'seedrandom';
import { JSONValue } from "../../src/utils/jsonHelper.js";
import { pathFromPtr, pathToPtr } from "json-refs";
import { writeJson } from "./utils.js";
import * as comparissonMergingService from "../../src/services/comparisonMerging.service.js";
import { InputModels } from "../../src/interfaces/inputmodels.js";
import { CONFIG } from "../../src/config.js";


const rng = seedrandom('juuu');

let base: JSONValue = {}
let leftSide: Record<string, unknown> = {}
let rightSide: Record<string, unknown> = {}

const pathsChanged: string[] = [];

function generateConflicts() {

  const NUMBER_OF_CONFLICTS = 100

  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  const fullPath = path.join(__dirname, '../data/1_MEINS');
  const baseFileName = 'base.json'

  base = getModel(path.join(fullPath, baseFileName));
  
  leftSide = JSON.parse(JSON.stringify(base)) as Record<string, unknown>;
  rightSide = JSON.parse(JSON.stringify(base)) as Record<string, unknown>;

  for (let i = 1; i <= NUMBER_OF_CONFLICTS; i++) {

    // TODO double check if this is legit !!
    const pick = Math.floor(rng() * 6);

    if (pick === 0) {
      generateDeleteUpdateConflict();
    } else if (pick === 1) {
      generateUpdateUpdateConflict()
    } else if (pick === 2) {
      generateDeleteUseConflict()
    } else if (pick === 3) {
      generateDeleteMoveSourceConflict()
    } else if (pick === 4) {
      generateDeleteMoveTargetConflict()
    } else {
      generateMoveMoveConflict()
    }
  }
  
  writeJson(fullPath, JSON.stringify(leftSide, null, 2), 'left');
  writeJson(fullPath, JSON.stringify(rightSide, null, 2), 'right');

  const inputModels: InputModels = {
    left: leftSide as JSONValue,
    right: rightSide as JSONValue,
    original: base
  };

  const diffmodel = measure(`${fullPath} MODEL - Diff`, () => {
    const result = comparissonMergingService.createDiff(inputModels);
    return result;
  });

  // maybe compare diffmodel
}

// -------------------------------------------------

function generateDeleteUpdateConflict() {
  const pathToChange = getRandomNamePath(base);

  const pathToDelete = pathToChange.slice(0, -1);

  const valueToChange = getValue(base as unknown as Record<string, unknown>, pathToChange)

  const changeValue = '_' + (Math.floor(rng() * (999 - 100 + 1)) + 100).toString();

  updateValue(leftSide, pathToChange, valueToChange + changeValue);

  removeValue(rightSide, pathToDelete);
}


function generateUpdateUpdateConflict() {
  const pathToChange = getRandomNamePath(base);

  const valueToChange = getValue(base as unknown as Record<string, unknown>, pathToChange)

  const changeValueLeft = '_' + (Math.floor(rng() * (999 - 100 + 1)) + 100).toString();
  const changeValueRight = '_' + (Math.floor(rng() * (999 - 100 + 1)) + 100).toString();

  updateValue(leftSide, pathToChange, valueToChange + changeValueLeft)
  updateValue(rightSide, pathToChange, valueToChange + changeValueRight)
}


function generateDeleteUseConflict() {
  const objectPathToRef = getRandomObjectPath(base);
  
  const objectPathToDelete = getRandomObjectPath(base)

  addKeyValue(leftSide, objectPathToDelete, '$ref', objectPathToRef)

  removeValue(rightSide, objectPathToDelete);
}


function generateDeleteMoveSourceConflict() {
  const objectPath = getRandomObjectPath(base);
  const objectValue = getValue(leftSide, objectPath);

  const arrayPathLeft = getRandomArrayPath(base);

  removeValue(leftSide, objectPath)
  addValue(leftSide, arrayPathLeft, objectValue);

  removeValue(rightSide, objectPath);
}


function generateDeleteMoveTargetConflict() {
  const objectPath = getRandomObjectPath(base);
  const objectValue = getValue(leftSide, objectPath);

  const arrayPathLeft = getRandomArrayPath(base);

  removeValue(leftSide, objectPath)
  addValue(leftSide, arrayPathLeft, objectValue);

  removeValue(rightSide, arrayPathLeft);
}


function generateMoveMoveConflict() {
  const objectPath = getRandomObjectPath(base);
  const objectValue = getValue(leftSide, objectPath);

  const arrayPathLeft = getRandomArrayPath(base);

  const arrayPathRight = getRandomArrayPath(base);

  removeValue(leftSide, objectPath)
  addValue(leftSide, arrayPathLeft, objectValue);

  removeValue(rightSide, objectPath);
  console.log(pathsChanged);
  addValue(rightSide, arrayPathRight, objectValue);
}


// -------------------------------------------------


function getModel(fullPath: string): JSONValue | null {

  const fileContent = fs.readFileSync(fullPath, "utf-8");

  if (fileContent === "") return null;
  return JSON.parse(fileContent);
}

// -------------------------------------------------

// return path
function getRandomNamePath(json: JSONValue): string[] {

  const flatBase = flatten(json).filter((path) => path.includes('name'));

  const tempElem = flatBase[getRandomInt(flatBase.length)];

  pathsChanged.push(tempElem);

  return pathFromPtr(tempElem)
}

function getRandomObjectPath(json: JSONValue): string[] {

  const flatBase = flatten(json).filter((path) => path.endsWith('name'));

  const objectPaths = flatBase.map((val) => val = val.slice(0, -6));

  const randomObjectPointer = objectPaths[getRandomInt(objectPaths.length)];

  pathsChanged.push(randomObjectPointer);

  return pathFromPtr(randomObjectPointer)
}

/* function getRandomRefPath(json: JSONValue): string[] {
  const flatBase = flatten(json).filter((path) => path.endsWith('ref'));

  const randomRefPointer = flatBase[getRandomInt(flatBase.length)];

  return pathFromPtr(randomRefPointer)
} */

function getRandomArrayPath(json: JSONValue): string[] {

  const flatBase = flatten(json).filter((path) => path.endsWith('name'));

  const randomPointer = pathFromPtr(flatBase[getRandomInt(flatBase.length)]);

  pathsChanged.push(pathToPtr(randomPointer.slice(0, -2)));

  return randomPointer.slice(0, -2);
}

function getRandomInt(max: number): number {
  const min = 1
  return Math.floor(rng() * (max - min + 1)) + 1;
}

function flatten(obj: JSONValue, pointer = '#', result: string[] = []): string[] {

  if (obj !== null && typeof obj === 'object' && !Array.isArray(obj)) {
    for (const [key, value] of Object.entries(obj)) {
      const newPointer = `${pointer}/${key}`
      flatten(value, newPointer, result)
    }
  } else if (Array.isArray(obj)) {
    obj.forEach((item, index) => {
      const newPointer = `${pointer}/${index}`
      flatten(item, newPointer, result)
    })
  } else {
    result.push(pointer)
  }

  return result
}

// -------------------------------------------------

function getValue(json: Record<string, unknown>, path: string[]) {
  const tmp = json[path[0]]

  if (path.length > 1) {
    return getValue(tmp as Record<string, unknown>, path.slice(1))
  }

  return tmp;
}

function updateValue(json: Record<string, unknown>, path: string[], newValue: unknown) {
  const key = path[0]

  if (path.length === 1) {
    json[key] = newValue
    return
  }

  updateValue(json[key] as Record<string, unknown>, path.slice(1), newValue)
}

function removeValue(json: Record<string, unknown> | unknown[], path: string[]): void {
  const key = path[0] as keyof typeof json;

  if (path.length === 1) {
    if (Array.isArray(json)) {
      json.splice(Number(key), 1);
    } else {
      delete json[key];
    }
    return;
  }

  removeValue(json[key] as Record<string, unknown> | unknown[], path.slice(1));
}

function addValue(json: Record<string, unknown> | unknown[], path: string[], newValue: unknown) {
  const key = path[0] as keyof typeof json;

  if (path.length === 1) {

    if (!Array.isArray(json[key])) {
      throw new Error("Parent is not an array");
    } else {
      json[key].push(newValue);
      return ;
    }
  }

  console.log(Array.isArray(json), key)

  const newJson = (Array.isArray(json) ? json[parseInt(key)] : (json as Record<string, unknown>)[key]) as Record<string, unknown> | unknown[]
  addValue(newJson, path.slice(1), newValue);
}

function addKeyValue(json: Record<string, unknown> | unknown[], path: string[], newKey: string, newValue: unknown): void {
  const key = path[0] as keyof typeof json;

  if (path.length === 1) {

    if (Array.isArray(json[key])) {
      throw new Error("Parent is an array");
    }

    (json[key] as Record<string, unknown>)[newKey] = newValue;
    return;
  }

  const newJson = (Array.isArray(json) ? json[Number(key)] : (json as Record<string, unknown>)[key]) as Record<string, unknown> | unknown[]

  const newPath = addKeyValue(newJson, path.slice(1), newKey, newValue);
}

function measure<T>(name: string, fn: () => T): T {
  console.time(name);
  const result = fn();
  console.timeEnd(name);
  return result;
}


generateConflicts()
