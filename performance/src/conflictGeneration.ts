import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import seedrandom from 'seedrandom';
import { JSONValue } from "../../src/utils/jsonHelper.js";
import { pathFromPtr, pathToPtr } from "json-refs";
import { writeJson } from "./utils.js";
import * as comparissonMergingService from "../../src/services/comparisonMerging.service.js";
import { InputModels } from "../../src/interfaces/inputmodels.js";

const rng = seedrandom('5555');

const TESTING_ONLY_UP_UP = false;
const TESTING_SPECIAL_CASE_5 = false;
const NUMBER_OF_CONFLICTS = 50;   // or 100
const NUMBER_OF_DIFFERENCES = 0; // 0 means, no addition differences except for conflicts
const PATH = '../data/1_MEINS/nominal';   // or '../data/1_MEINS/large' or '../data/1_MEINS/special-5'

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const fullPath = path.join(__dirname, PATH);

let base: JSONValue = {}
let leftSide: Record<string, unknown> = {}
let rightSide: Record<string, unknown> = {}

const pathsChanged: string[] = [];

const myCache: { baseAllNamePaths: string[] } = {
  baseAllNamePaths: []
}

const counters = {
  conflictsCounter: 0,
  deleteUpdateCounter: 0,
  updateUpdateCounter: 0,
  deleteUseCounter: 0,
  deleteMoveCounter: 0,
  moveMoveCounter: 0,
  additionalDifferencesCounter: 0,
}

function performanceTesting() {
  const inputModels = generateDifferencesAndConflicts();

  if (global.gc) {
    global.gc();
  } else {
    console.warn("Run with NODE_OPTIONS=--expose-gc to enable manual GC before measurement");
  }

  const cpuBefore = process.cpuUsage();
  const memoryBefore = process.memoryUsage();

  const diffmodel = measure(`${PATH} -- TOTAL TIME: `, () => {
    const result = comparissonMergingService.createDiff(inputModels);
    return result;
  });

  const cpuAfter = process.cpuUsage(cpuBefore);
  const memoryAfter = process.memoryUsage();

  const cpuUsagePercent = ((cpuAfter.user + cpuAfter.system) / 1000000).toFixed(2);

  console.log(`CPU Usage: ${cpuUsagePercent}%`);
  console.log(` User: ${cpuAfter.user / 1000}ms`);
  console.log(` System: ${cpuAfter.system / 1000}ms`);
  
  console.log("RSS (RAM?):", formatMemory(memoryAfter.rss - memoryBefore.rss));   // RAM
  console.log("Heap total:", formatMemory(memoryAfter.heapTotal - memoryBefore.heapTotal));
  console.log("Heap used:", formatMemory(memoryAfter.heapUsed - memoryBefore.heapUsed));
  // heapUsed should be the smallest number of the three
  // but ONLY the TOTAL numbers not the deltas !!!
  
  console.log('Memory Usage:');
  console.log(` RSS (RAM?): ${Math.round((memoryAfter.rss - memoryBefore.rss) / 1024 / 1024)} MB`);
  console.log(` Heap Total: ${Math.round((memoryAfter.heapTotal - memoryBefore.heapTotal) / 1024 / 1024)} MB`);
  console.log(` Heap Used: ${Math.round((memoryAfter.heapUsed - memoryBefore.heapUsed) / 1024 / 1024)} MB`);
  
  // TODO maybe compare diffmodel

  // console.log(diffmodel.differencesL.slice(0, 10))
  // console.log(diffmodel.differencesR.slice(0, 10))
  // console.log(JSON.stringify(diffmodel.conflicts.slice(0,10), null, 2))
}


function generateDifferencesAndConflicts(): InputModels {
  const baseFileName = 'base.json';

  base = getModel(path.join(fullPath, baseFileName));

  const tmpCounters = {
    deleteDiff: 0,
    updateDiff: 0,
    useDiff: 0,
    moveDiff: 0,
  }

  if (TESTING_SPECIAL_CASE_5) {
    leftSide = getModel(path.join(fullPath, 'left.json')) as Record<string, unknown>;
    rightSide = JSON.parse(JSON.stringify(leftSide)) as Record<string, unknown>;

    myCache.baseAllNamePaths = flatten(leftSide as JSONValue).filter((path) => path.endsWith('name'));

    for (let i = 1; i <= NUMBER_OF_CONFLICTS; i++) {
      const pick = Math.floor(rng() * 4);

      if (pick === 0) {
        generateDeleteDifference(false)
        tmpCounters.deleteDiff++
      } else if (pick === 1) {
        generateUpdateDifference(false)
        tmpCounters.updateDiff++
      } else if (pick === 2) {
        generateUseDifference(false)
        tmpCounters.useDiff++
      } else {
        generateMoveDifference(false)
        tmpCounters.moveDiff++
      }
    }

    console.log('RIGHT DIFFS COUNTERS: ', tmpCounters);

    console.log('---- COUNTEEERS ----:', counters);

    writeJson(fullPath, JSON.stringify(rightSide, null, 2), 'right');

    return {
      left: leftSide as JSONValue,
      right: rightSide as JSONValue,
      original: base
    };
  }
  
  leftSide = JSON.parse(JSON.stringify(base)) as Record<string, unknown>;
  rightSide = JSON.parse(JSON.stringify(base)) as Record<string, unknown>;

  myCache.baseAllNamePaths = flatten(base).filter((path) => path.endsWith('name'));

  for (let i = 1; i <= (NUMBER_OF_DIFFERENCES-NUMBER_OF_CONFLICTS); i++) {
    const pickLeft = Math.floor(rng() * 4);

    if (pickLeft === 0) {
      generateDeleteDifference(true)
      tmpCounters.deleteDiff++
    } else if (pickLeft === 1) {
      generateUpdateDifference(true)
      tmpCounters.updateDiff++
    } else if (pickLeft === 2) {
      generateUseDifference(true)
      tmpCounters.useDiff++
    } else {
      generateMoveDifference(true)
      tmpCounters.moveDiff++
    }

    const pickRight = Math.floor(rng() * 4);
    if (pickRight === 0) {
      generateDeleteDifference(false)
    } else if (pickRight === 1) {
      generateUpdateDifference(false)
    } else if (pickRight === 2) {
      generateUseDifference(false)
    } else {
      generateMoveDifference(false)
    }
  }

  console.log('LEFT DIFFS COUNTERS: ', tmpCounters);

  for (let i = 1; i <= NUMBER_OF_CONFLICTS; i++) {
    
    if (TESTING_ONLY_UP_UP) {
      generateUpdateUpdateConflict();
    } else {
      const pick = Math.floor(rng() * 5);

      if (pick === 0) {
        generateDeleteUpdateConflict();
      } else if (pick === 1) {
        generateUpdateUpdateConflict();
      } else if (pick === 2) {
        generateDeleteUseConflict();
      } else if (pick === 3) {
        generateDeleteMoveConflict();
      } else {
        generateMoveMoveConflict();
      }
    }
  }

  console.log('---- COUNTEEERS ----:', counters);
  
  writeJson(fullPath, JSON.stringify(leftSide, null, 2), 'left');
  writeJson(fullPath, JSON.stringify(rightSide, null, 2), 'right');

  return {
    left: leftSide as JSONValue,
    right: rightSide as JSONValue,
    original: base
  };
}

function formatMemory(bytes: number) {
  return (bytes / 1024 / 1024).toFixed(2) + " MB";
}


// -------------------------------------------------


function generateUpdateDifference(isLeft: boolean) {
  const pathToChange = getRandomNamePath();

  const changeValue = '_' + (Math.floor(rng() * (999 - 100 + 1)) + 100).toString();

  if (isLeft) {
    const valueToChange = getValue(leftSide, pathToChange)

    updateValue(leftSide, pathToChange, valueToChange + changeValue)
  } else {
    const valueToChange = getValue(rightSide, pathToChange)

    updateValue(rightSide, pathToChange, valueToChange + changeValue)
  }

  counters.additionalDifferencesCounter++
}

function generateUseDifference(isLeft: boolean) {
  const objectPathToRef = getRandomObjectPath();
  
  const objectPath = getRandomObjectPath()
  
  if (isLeft) {
    addKeyValue(leftSide, objectPath, '$ref', objectPathToRef)
  } else {
    addKeyValue(rightSide, objectPath, '$ref', objectPathToRef)
  }

  counters.additionalDifferencesCounter++
}

function generateMoveDifference(isLeft: boolean) {
  const objectPath = getRandomObjectPath();
  
  const arrayPathLeft = getRandomArrayPath();

  if (isLeft) {
    const objectValue = getValue(leftSide, objectPath);

    removeValue(leftSide, objectPath)
    addValue(leftSide, arrayPathLeft, objectValue);
  } else {
    const objectValue = getValue(rightSide, objectPath);

    removeValue(rightSide, objectPath)
    addValue(rightSide, arrayPathLeft, objectValue);
  }

  counters.additionalDifferencesCounter++
}

function generateDeleteDifference(isLeft: boolean) {
  const objectPathToDelete = getRandomObjectPath()
  
  if (isLeft) {
    removeValue(leftSide, objectPathToDelete);
  } else {
    removeValue(rightSide, objectPathToDelete);
  }

  counters.additionalDifferencesCounter++
}


// -------------------------------------------------


function generateDeleteUpdateConflict() {
  const pathToChange = getRandomNamePath();

  const pathToDelete = pathToChange.slice(0, -1);

  try {
    getValue(rightSide, pathToDelete)
    if (
      JSON.stringify(getValue(rightSide, pathToDelete)) !== JSON.stringify(getValue(base as unknown as Record<string, unknown>, pathToDelete))
    ) return
  }
  catch(error) {
    return;
  }

  const valueToChange = getValue(base as unknown as Record<string, unknown>, pathToChange)

  const changeValue = '_' + (Math.floor(rng() * (999 - 100 + 1)) + 100).toString();

  updateValue(leftSide, pathToChange, valueToChange + changeValue);

  removeValue(rightSide, pathToDelete);

  counters.conflictsCounter++
  counters.deleteUpdateCounter++
}


function generateUpdateUpdateConflict() {
  const pathToChange = getRandomNamePath();

  const valueToChange = getValue(base as unknown as Record<string, unknown>, pathToChange)

  try {
    getValue(leftSide, pathToChange)

    getValue(rightSide, pathToChange)
    if (
      JSON.stringify(getValue(rightSide, pathToChange)) !== JSON.stringify(getValue(base as unknown as Record<string, unknown>, pathToChange))
    ) return
  }
  catch(error) {
    return;
  }

  const changeValueLeft = '_' + (Math.floor(rng() * (999 - 100 + 1)) + 100).toString();
  const changeValueRight = '_' + (Math.floor(rng() * (999 - 100 + 1)) + 100).toString();

  updateValue(leftSide, pathToChange, valueToChange + changeValueLeft)
  updateValue(rightSide, pathToChange, valueToChange + changeValueRight)

  counters.conflictsCounter++
  counters.updateUpdateCounter++
}


function generateDeleteUseConflict() {
  const objectPathToRef = getRandomObjectPath();
  
  const objectPathToDelete = getRandomObjectPath()
  
  try {
    getValue(leftSide, objectPathToDelete)
    if (
      (JSON.stringify(getValue(rightSide, objectPathToDelete)) !== JSON.stringify(getValue(base as unknown as Record<string, unknown>, objectPathToDelete))) &&
      (JSON.stringify(getValue(leftSide, objectPathToDelete)) !== JSON.stringify(getValue(base as unknown as Record<string, unknown>, objectPathToDelete)))
    ) {
      console.log('FAIIL');
      return;
    }
  }
  catch(error) {
    console.log('FAIIL 2');
    return;
  }

  addKeyValue(leftSide, objectPathToDelete, '$ref', objectPathToRef)

  removeValue(rightSide, objectPathToDelete);

  counters.conflictsCounter++
  counters.deleteUseCounter++
}


function generateDeleteMoveConflict() {
  const pick = Math.floor(rng() * 2);

    if (pick === 0) {
      generateDeleteMoveSourceConflict();
    } else {
      generateDeleteMoveTargetConflict();
    }

}


function generateDeleteMoveSourceConflict() {
  const objectPath = getRandomObjectPath();
  const objectValue = getValue(leftSide, objectPath);

  const arrayPathLeft = getRandomArrayPath();

  try {
    getValue(rightSide, objectPath)
    if (
      JSON.stringify(getValue(rightSide, objectPath)) !== JSON.stringify(getValue(base as unknown as Record<string, unknown>, objectPath))
    ) return
  }
  catch(error) {
    return;
  }

  removeValue(leftSide, objectPath)
  addValue(leftSide, arrayPathLeft, objectValue);

  removeValue(rightSide, objectPath);

  counters.conflictsCounter++
  counters.deleteMoveCounter++
}


function generateDeleteMoveTargetConflict() {
  const objectPath = getRandomObjectPath();

  try {
    getValue(leftSide, objectPath);
  }
  catch(error) {
    return;
  }

  const objectValue = getValue(leftSide, objectPath);

  const arrayPathLeft = getRandomArrayPath();

  try {
    getValue(leftSide, arrayPathLeft)

    getValue(rightSide, arrayPathLeft)
    if (JSON.stringify(getValue(rightSide, arrayPathLeft)) !== JSON.stringify(getValue(base as unknown as Record<string, unknown>, arrayPathLeft))
    ) return
  }
  catch(error) {
    return;
  }

  removeValue(leftSide, objectPath)
  addValue(leftSide, arrayPathLeft, objectValue);

  removeValue(rightSide, arrayPathLeft);

  counters.conflictsCounter++
  counters.deleteMoveCounter++
}


function generateMoveMoveConflict() {
  const objectPath = getRandomObjectPath();

  try {
    getValue(leftSide, objectPath);
  }
  catch(error) {
    return;
  }
 
  const objectValue = getValue(leftSide, objectPath);

  const arrayPathLeft = getRandomArrayPath();

  const arrayPathRight = getRandomArrayPath();

  try {
    getValue(leftSide, arrayPathLeft)
    
    getValue(rightSide, objectPath)
    getValue(rightSide, arrayPathRight)

    if (JSON.stringify(getValue(rightSide, arrayPathLeft)) !== JSON.stringify(getValue(base as unknown as Record<string, unknown>, arrayPathLeft))
    ) return
  }
  catch(error) {
    return;
  }

  removeValue(leftSide, objectPath)
  addValue(leftSide, arrayPathLeft, objectValue);

  removeValue(rightSide, objectPath);
  addValue(rightSide, arrayPathRight, objectValue);

  counters.conflictsCounter++
  counters.moveMoveCounter++
}


// -------------------------------------------------


function getModel(fullPath: string): JSONValue | null {

  const fileContent = fs.readFileSync(fullPath, "utf-8");

  if (fileContent === "") return null;
  return JSON.parse(fileContent);
}


// -------------------------------------------------


function getRandomNamePath(): string[] {
  const tempElem = myCache.baseAllNamePaths[getRandomInt(myCache.baseAllNamePaths.length)];

  pathsChanged.push(tempElem);
  // console.log(tempElem)

  return pathFromPtr(tempElem)
}

function getRandomObjectPath(): string[] {
  const objectPaths = myCache.baseAllNamePaths.map((val) => val = val.slice(0, -6));

  const randomVal = getRandomInt(objectPaths.length)

  const randomObjectPointer = objectPaths[randomVal];

  const tmp = pathsChanged.find(elem => elem === randomObjectPointer || randomObjectPointer.startsWith(elem))
  if (tmp) {
    return getRandomObjectPath()
  } else {
    pathsChanged.push(randomObjectPointer);

    return pathFromPtr(randomObjectPointer)
  }
}

function getRandomArrayPath(): string[] {

  const randomPointer = pathFromPtr(myCache.baseAllNamePaths[getRandomInt(myCache.baseAllNamePaths.length)]);

  const arrayPath = !isNaN(Number(randomPointer.at(-2))) ? randomPointer.slice(0, -2) :  randomPointer.slice(0, -3);

  const tmp = pathsChanged.find(elem => elem === pathToPtr(arrayPath) || elem.startsWith(pathToPtr(arrayPath)))
  if (tmp) {
    return getRandomArrayPath();
  } else {
    pathsChanged.push(pathToPtr(arrayPath));
    // console.log(pathToPtr(arrayPath))

    return arrayPath;
  }
}

function getRandomInt(max: number): number {
  const min = 1
  return Math.floor(rng() * (max - min)) + min;
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

  // console.log(key, pathToPtr(path))

  if (path.length === 1) {
    // console.log(json[key], key, path)
    
    if (!Array.isArray(json[key])) {
      throw new Error("Parent is not an array");
    } else {
      json[key].push(newValue);
      return ;
    }
  }

  // console.log(json, key)
  // console.log(pathsChanged)

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


performanceTesting()
