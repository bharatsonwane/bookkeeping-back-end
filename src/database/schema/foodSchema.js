export default {
  name: "foodSchema",
  label: "Food Schema",
  type: "schema",
  version: "1.0",
  children: [
    {
      label: "Food Details",
      type: "parentTab",
      children: [
        {
          label: "Basic Information",
          type: "tab",
          children: [
            {
              label: "Food Name",
              type: "text",
              dataMappingName: "food.name",
              validationType: "string",
              validations: [
                { type: "min", params: [3, "Must be at least 3 characters"] },
                { type: "max", params: [50, "Must be at most 50 characters"] },
                { type: "trim" },
              ],
              readOnly: false,
              isMultilingual: false,
            },
            {
              label: "Food ID",
              type: "text",
              dataMappingName: "food.id",
              validationType: "string",
              validations: [
                { type: "min", params: [3, "Must be at least 3 characters"] },
                { type: "max", params: [50, "Must be at most 50 characters"] },
                { type: "trim" },
              ],
              readOnly: false,
              isMultilingual: false,
            },
            {
              label: "Category",
              type: "select",
              options: [
                { label: "Vegetarian", value: "Vegetarian" },
                { label: "Non-Vegetarian", value: "Non-Vegetarian" },
                { label: "Vegan", value: "Vegan" },
              ],
              dataMappingName: "food.category",
              readOnly: false,
              isMultilingual: false,
            },
            {
              label: "Cuisine",
              type: "text",
              dataMappingName: "food.cuisine",
              validationType: "string",
              validations: [
                { type: "min", params: [3, "Must be at least 3 characters"] },
                { type: "max", params: [50, "Must be at most 50 characters"] },
                { type: "trim" },
              ],
              readOnly: false,
              isMultilingual: false,
            },
            {
              label: "Preparation Time",
              type: "number",
              dataMappingName: "food.preparationTime",
              readOnly: false,
              isMultilingual: false,
            },
            {
              label: "Description",
              type: "textarea",
              dataMappingName: "food.description",
              readOnly: false,
              isMultilingual: true,
            },
          ],
        },
        {
          label: "Nutritional Information",
          type: "tab",
          children: [
            {
              label: "Calories",
              type: "number",
              dataMappingName: "nutrition.calories",
              readOnly: false,
              isMultilingual: false,
            },
            {
              label: "Protein",
              type: "number",
              dataMappingName: "nutrition.protein",
              readOnly: false,
              isMultilingual: false,
            },
            {
              label: "Carbohydrates",
              type: "number",
              dataMappingName: "nutrition.carbohydrates",
              readOnly: false,
              isMultilingual: false,
            },
            {
              label: "Fats",
              type: "number",
              dataMappingName: "nutrition.fats",
              readOnly: false,
              isMultilingual: false,
            },
            {
              label: "Vitamins",
              type: "textarea",
              dataMappingName: "nutrition.vitamins",
              readOnly: false,
              isMultilingual: false,
            },
          ],
        },
      ],
    },
    {
      label: "Ingredients",
      type: "tab",
      children: [
        {
          label: "Ingredient List",
          type: "section",
          children: [
            {
              label: "Ingredient Name",
              type: "text",
              dataMappingName: "ingredients.name",
              readOnly: false,
              isMultilingual: false,
            },
            {
              label: "Quantity",
              type: "text",
              dataMappingName: "ingredients.quantity",
              readOnly: false,
              isMultilingual: false,
            },
            {
              label: "Unit",
              type: "text",
              dataMappingName: "ingredients.unit",
              readOnly: false,
              isMultilingual: false,
            },
          ],
        },
      ],
    },
    {
      label: "Cooking Instructions",
      type: "tab",
      children: [
        {
          label: "Steps",
          type: "section",
          children: [
            {
              label: "Step Description",
              type: "textarea",
              dataMappingName: "instructions.steps",
              readOnly: false,
              isMultilingual: false,
            },
            {
              label: "Step Number",
              type: "number",
              dataMappingName: "instructions.stepNumber",
              readOnly: false,
              isMultilingual: false,
            },
          ],
        },
      ],
    },
  ],
};
