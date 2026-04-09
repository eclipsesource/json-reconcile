import fs from "fs";
import path from "path";
import { AllTheFiles } from "./test-matrix.test.js";
import { fileURLToPath } from "url";

export function getModel(filePath: string): AllTheFiles | null {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);

  const fullPath = path.join(__dirname, "data/", filePath);

  const fileContent = fs.readFileSync(fullPath, "utf-8");

  if (fileContent === "") return null;
  return JSON.parse(fileContent);
}
