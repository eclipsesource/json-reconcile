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
      {
        variant: "1_5_delete_insert_use",
        description:
          "newly inserted Project class, the containment to SmartCity and the reference to Category, delete Category",
      },
    ],
  },
  {
    name: "2_delete-move",
    scenarios: [
      {
        variant: "2_1_insert_new_containment",
        description:
          "add Location class and InfrastructureComponent as container for Location, delete InfrastructureComponent",
      },
      {
        variant: "2_2_target_delete",
        description:
          "container of InfrastructureComponent moved from SmartCity to Project, delete InfrastructureComponent",
      },
      {
        variant: "2_3_source_delete",
        description:
          "container of Category moved from Project to InfrastructureComponent, delete InfrastructureComponent",
      },
      {
        variant: "2_4_move_to_new_delete_target",
        description:
          "add InfrastructureComponent class and and container of existing Category moved from Project to InfrastructureComponent, deleted Category",
      },
    ],
  },
  {
    name: "3_delete-update",
    scenarios: [
      {
        variant: "3_1_insert_attr_delete_class",
        description:
          "add Atribute SDG to existing Category class, delete Category",
      },
      {
        variant: "3_2_attr_typ_delete_class",
        description: "",
      },
      {
        variant: "3_3_edge_name_class_delete",
        description: "",
      },
      {
        variant: "3_4_attr_class_delete_pseudo",
        description: "",
      },
      {
        variant: "3_5_delete_edge_source_pseudo",
        description: "",
      },
    ],
  },
  {
    name: "4_update-update",
    scenarios: [],
  },
  {
    name: "5_move-move",
    scenarios: [],
  },
  {
    name: "6_insert-insert",
    scenarios: [],
  },
  {
    name: "7_not-categorized",
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

          if (models !== null) {
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
          }
        });
      });
    });
  }
});
