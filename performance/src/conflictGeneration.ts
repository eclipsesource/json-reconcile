import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import seedrandom from 'seedrandom';
import { JSONValue } from "../../src/utils/jsonHelper.js";
import { pathFromPtr } from "json-refs";
import { writeJson } from "./utils.js";
import * as comparissonMergingService from "../../src/services/comparisonMerging.service.js";
import { InputModels } from "../../src/interfaces/inputmodels.js";


const rng = seedrandom('tt');

function generateConflicts() {

  const NUMBER_OF_CONFLICTS = 1

  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  const fullPath = path.join(__dirname, '../data/1_MEINS');
  const baseFileName = 'base.json'

  const base = getModel(path.join(fullPath, baseFileName));
  
  const leftSide = JSON.parse(JSON.stringify(base)) as Record<string, unknown>;
  const rightSide = JSON.parse(JSON.stringify(base)) as Record<string, unknown>;

  for (let i = 1; i <= NUMBER_OF_CONFLICTS; i++) {

    // generateUpdateUpdateConflict(base, leftSide, rightSide);

    generateDeleteUpdateConflict(base, leftSide, rightSide);
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
    // console.log(JSON.stringify((result)))
    return result;
  });

  // maybe compare diffmodel
}

// -------------------------------------------------

function generateDeleteUpdateConflict(base: JSONValue, leftSide: Record<string, unknown>, rightSide: Record<string, unknown>) {
  const pathToChange = getRandomNamePath(base);

  const pathToDelete = pathToChange.slice(undefined, -1);

  const valueToChange = getValue(base as unknown as Record<string, unknown>, pathToChange)

  setValue(leftSide, pathToChange, valueToChange + '_ttt');

  removeValue(rightSide, pathToDelete);

  // OR more complex:

  // on one side make sure every ref including this path full or starts with this path, these are deleted
  // then deelte this path

  // on the other side insert an object at this path
  // maybe get random sub path, starting with the deleted path
}


function generateUpdateUpdateConflict(base: JSONValue, leftSide: Record<string, unknown>, rightSide: Record<string, unknown>) {
  const pathToChange = getRandomNamePath(base);

  const valueToChange = getValue(base as unknown as Record<string, unknown>, pathToChange)

  setValue(leftSide, pathToChange, valueToChange + '_ttt')
  setValue(rightSide, pathToChange, valueToChange + '_zzz')
}

// special case: delete - insert use
function generateDeleteUseConflict(base: JSONValue, leftSide: Record<string, unknown>, rightSide: Record<string, unknown>) {
  // get a path of an array

  // insert object at the last position

  // reference this object somewhere in the json -> object that has no ref yet

  // OR reference in the same array in an object that has no ref yet
}


function generateDeleteMoveConflict(base: JSONValue, leftSide: Record<string, unknown>, rightSide: Record<string, unknown>) {
  // get a ref

  // ref points to array index normaly

  // if index is 1 switch to 2

  // if index > 1 then switch to index-1

  // change the ref link

  // ON THE OTHER SIDE: delete the newly referenced object
}


function generateMoveMoveConflict(base: JSONValue, leftSide: Record<string, unknown>, rightSide: Record<string, unknown>) {
  // similar to delete move

  // get a ref
  // ref points to array index normaly
  
  // filter all where the ref index is in array length > (found index + 3)

  // ON THE ONE SIDE switch to index + 1

  // ON THE OTHER SIDE switch to index + 2
}


// -------------------------------------------------


function getModel(fullPath: string): JSONValue | null {

  const fileContent = fs.readFileSync(fullPath, "utf-8");

  if (fileContent === "") return null;
  return JSON.parse(fileContent);
}

// return path
function getRandomNamePath(json: JSONValue): string[] {

  const flatBase = flatten(json).filter((path) => path.includes('name'));

  // console.log(flatBase)

  const tempElem = flatBase[getRandomInt(flatBase.length)];

  console.log(tempElem)

  return pathFromPtr(tempElem)
}

function getRandomObjectPath(json: JSONValue): string[] {

  const flatBase = flatten(json).filter((path) => /[0-9]$/.test(path));

  // console.log(flatBase)

  const tempElem = flatBase[getRandomInt(flatBase.length)];

  console.log(tempElem)

  return pathFromPtr(tempElem)
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

function getValue(json: Record<string, unknown>, path: string[]) {
  const tmp = json[path[0]]

  if (path.length > 1) {
    return getValue(tmp as Record<string, unknown>, path.slice(1))
  }

  return tmp;
}

function setValue(json: Record<string, unknown>, path: string[], newValue: unknown) {
  const key = path[0]

  if (path.length === 1) {
    json[key] = newValue
    return
  }

  setValue(json[key] as Record<string, unknown>, path.slice(1), newValue)
}

function removeValue(json: Record<string, unknown> | unknown[], path: string[]): void {
  const key = path[0];

  if (path.length === 1) {
    if (Array.isArray(json)) {
      json.splice(Number(key), 1);
    } else {
      delete json[key];
    }
    return;
  }

  removeValue(json[key as keyof typeof json] as Record<string, unknown> | unknown[], path.slice(1));
}

function measure<T>(name: string, fn: () => T): T {
  console.time(name);
  const result = fn();
  console.timeEnd(name);
  return result;
}


generateConflicts()
