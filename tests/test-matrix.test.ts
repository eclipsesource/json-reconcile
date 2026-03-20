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
    | "4_xx_update-update_ordered"
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
          "delete Project class and add reference from Project to Category",
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
        description:
          "update type of attribute SDG of Category class to 'string', delete Category",
      },
      {
        variant: "3_3_edge_name_class_delete",
        description:
          "update name of containment (SmartCity-Project), delete Project",
      },
      {
        variant: "3_4_attr_class_delete_pseudo",
        description:
          "delete attribute SDG of Category, delete Category  --  HOW TO HANDLE PSEUDO CONFLICTS (delte-delete)",
      },
      {
        variant: "3_5_delete_edge_source_pseudo",
        description:
          "delete the containment of SmartCity-Category, delete Category  --  HOW TO HANDLE PSEUDO CONFLICTS (delte-delete)",
      },
    ],
  },
  {
    name: "4_update-update",
    scenarios: [
      {
        variant: "4_1_attr_name",
        description: "update Category name on both sides with different values",
      },
      {
        variant: "4_2_multiplicity_containment",
        description:
          "update containment from SmartCity to Category, the multiplicity upper bound on both sides with different values",
      },
    ],
  },
  {
    name: "4_xx_update-update_ordered",
    scenarios: [
      {
        variant: "4_10_class_order_beginning",
        description:
          "add Project class at the beginning (index 0), add InfrastructureComponent class also at the beginning (index 0)",
      },
      {
        variant: "4_11_delete_insert_class",
        description:
          "delete Category from index 0, add Project class between Category and SmartCity (index 1)",
      },
      {
        variant: "4_12_order_no_conflict_class",
        description:
          "add InfrastructureComponent class between Category and Project (index 1), add Location class between Project and Smart City (index 2)",
      },
      {
        variant: "4_13_reordering_with_class",
        description:
          "move Category class from first to second position between Project and SmartCity, move Category to third position after Project and SmartCity",
      },
    ],
  },
  {
    name: "5_move-move",
    scenarios: [
      {
        variant: "5_1_category_containment",
        description:
          "move category containment from SmartCity to Project, move category containment from SmartCity to InfrastructureComponent",
      },
      {
        variant: "5_2_containment_cycle_category",
        description:
          "move category containment from SmartCity to Project, move project containment from SmartCity to Category (cycle Project-Category)",
      },
      {
        variant: "5_10_with_package",
        description:
          "move Category class from newPackage1 to newPackage2, move Category class from newPackage1 to newPackage2 (containment SmartCity to Category change)",
      },
    ],
  },
  {
    name: "6_insert-insert",
    scenarios: [
      {
        variant: "6_1_category_no_container",
        description:
          "add new containment from SmartCity to Category class, add new containment from Project to Category class",
      },
    ],
  },
  {
    name: "7_not-categorized",
    scenarios: [
      {
        variant: "7_1_same_self_reference",
        description:
          "add new self containment and self reference to InfrastructureComponent class, add new self containment and self reference to InfrastructureComponent class, both with same id",
      },
      {
        variant: "7_2_create_same_class",
        description:
          "add new Location class and the containment from InfrastructureComponent to Location, add new Location class and containment from InfrastructureComponent to Location, both with same id",
      },
    ],
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
