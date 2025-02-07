import { CONFIG } from "../config.js";

export default function defaultHashMatching(
  object: Record<string, undefined>
): undefined {
  // return objRecord.name || objRecord.id || objRecord._id;
  return object[CONFIG.IDENTIFIER];
}
