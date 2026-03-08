import { DiffModel } from "../src/interfaces/diffmodel.js";
import { CustomOp } from "../src/interfaces/util.js";
import { createDiff2Way, createDiff3Way } from "../src/services/createDiff.js";
import { JSONValue } from "../src/utils/jsonHelper.js";
import { testsEnabled } from "./configs.js";
import { getModel } from "./read-test-file.js";

interface ConflictType {
  name:
    | "basic"
    | "1_delete-use"
    | "2_delete-move"
    | "3_delete-update"
    | "4_update-update"
    | "5_move-move"
    | "6_insert-insert"
    | "7_not-categorized";
  scenarios: TestSuite[];
}

interface TestSuite {
  variant: string;
  description: string;
}

export interface AllTheFiles {
  base: JSONValue;
  left: JSONValue;
  right: JSONValue;
  expected: {
    "2way-a": CustomOp[];
    "2way-b": CustomOp[];
    "3way": DiffModel;
  };
}

const CONFLICT_TYPES_SUITS: ConflictType[] = [
  {
    name: "1_delete-use",
    scenarios: [
      {
        variant: "1_1_target_delete",
        description:
          "delete Category class and add reference from Project to Category",
      },
      {
        variant: "1_3_source_delete",
        description:
          "delete Project class and add reference from Project to Category -- KNOWN GITHUB ISSUE https://github.com/eclipsesource/json-reconcile/issues/7",
      },
      {
        variant: "1_4_feature_update",
        description:
          "reference from Project to Category already exists, update name and multiplicity of reference and delete Category",
      },
    ],
  },
  {
    name: "2_delete-move",
    scenarios: [],
  },
  {
    name: "3_delete-update",
    scenarios: [],
  },
];

CONFLICT_TYPES_SUITS.forEach((type) => {
  if (testsEnabled[`${type.name}`] === true) {
    describe(`${type.name}`, () => {
      type.scenarios.forEach((scenario) => {
        describe(`${scenario.variant} -- ${scenario.description}`, () => {
          const models = (() => {
            const variantFilePath = `${type.name}/${scenario.variant}.json`;
            return getModel(variantFilePath);
          })();

          it("2-way: original - A", () => {
            const result = createDiff2Way(models.base, models.left);
            expect(result).toEqual(models.expected["2way-a"]);
          });

          it("2-way: orignal - B", () => {
            const result = createDiff2Way(models.base, models.right);
            expect(result).toEqual(models.expected["2way-b"]);
          });

          it("3-way: conflict detection", () => {
            const result = createDiff3Way(
              models.base,
              models.left,
              models.right,
            );
            expect(result).toEqual(models.expected["3way"]);
          });
        });
      });
    });
  }
});
