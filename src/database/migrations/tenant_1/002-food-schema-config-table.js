// src/database/migrations/common/002-schema-config-table.js

export const up = async (client) => {
  const sideBarSchema = {
    name: "sidebarSchema",
    label: "Sidebar Schema",
    type: "schema",
    version: "1.0",
    children: [
      {
        name: "dashboard",
        label: "Dashboard",
        icon: "",
        schemaName: "dashboardSchema",
      },
      {
        name: "userList",
        label: "User List",
        icon: "",
        schemaName: "userListSchema",
      },
      {
        name: "foodList",
        label: "Food List",
        icon: "",
        schemaName: "foodListSchema",
      },
    ],
  };

  const dashboardSchema = {
    name: "dashboardSchema",

    label: "Dashboard Schema",
    type: "schema",
    version: "1.0",
    children: [],
  };

  const userListSchema = {
    name: "userListSchema",
    label: "User List Schema",
    type: "schema",
    version: "1.0",
    defaultQueryName: "getUserList",
    children: [
      {
        type: "heading",
        label: "User List",
      },
      {
        type: "button",
        label: "Add User",
        schemaName: "userDetailSchema",
        onClick: {
          navigationPath: "/app/home/create/:schemaName",
          schemaName: "userDetailSchema",
        },
      },
      {
        type: "table",
        queryName: "getUserList",
        onRowClick: {
          navigationPath: "/app/home/:uiActionType/:schemaName/:id",
          schemaName: "userDetailSchema",
        },
        children: [
          {
            type: "tableColum",
            name: "id",
            label: "Id",
          },
          {
            type: "tableColum",
            name: "email",
            label: "Email",
          },
          {
            type: "tableColum",
            name: "firstName",
            label: "First Name",
          },
          {
            type: "tableColum",
            name: "lastName",
            label: "Last Name",
          },
          {
            type: "tableColum",
            name: "phone",
            label: "Phone",
          },
          {
            type: "tableColum",
            name: "address",
            label: "Address",
          },
        ],
      },
    ],
    sqlQueryList: [
      {
        queryName: "getUserList",
        query: `SELECT id, email, "firstName", "lastName", phone, address FROM users;`,
      },
    ],
  };

  const foodListSchema = {
    name: "foodListSchema",
    label: "Food List Schema",
    type: "schema",
    version: "1.0",
    defaultQueryName: "getFoodList",
    children: [
      {
        type: "heading",
        label: "Food List",
      },
      {
        type: "button",
        label: "Add Food",
        schemaName: "foodDetailSchema",
        onClick: {
          navigationPath: "/app/home/create/:schemaName",
          schemaName: "foodDetailSchema",
        },
      },
      {
        type: "table",
        queryName: "getFoodList",
        onRowClick: {
          navigationPath: "/app/home/:uiActionType/:schemaName/:id", // uiActionType: view, create, update
          schemaName: "foodDetailSchema",
        },
        children: [
          {
            type: "tableColum",
            name: "id",
            label: "Id",
          },
          {
            type: "tableColum",
            name: "name",
            label: "Food Name",
          },
          {
            type: "tableColum",
            name: "category",
            label: "Food category",
          },
          {
            type: "tableColum",
            name: "cuisine",
            label: "Cuisine",
          },
          {
            type: "tableColum",
            name: "calories",
            label: "Calories",
          },
        ],
      },
    ],
    sqlQueryList: [
      {
        queryName: "getFoodList",
        query: `
          SELECT
            f.id,
            f.name,
            f.category,
            f.cuisine,
            n.calories
          FROM food f
          LEFT JOIN nutrition n ON n."foodId" = f.id;
          `,
      },
    ],
  };

  const foodDetailSchema = {
    name: "foodDetailSchema",
    label: "Food Detail Schema",
    type: "schema",
    version: "1.0",
    defaultQueryName: "getFoodDetailById",
    children: [
      {
        type: "section",
        label: "",
        children: [
          {
            type: "headingWithButton",
            label: "Save",
            onCreate: {
              queryName: "saveFoodDetail",
            },
            onUpdate: {
              queryName: "updateFoodDetail",
            },
          },
        ],
      },
      {
        type: "section",
        label: "",
        children: [
          {
            queryName: "getFoodDetailById",
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
                    dataMappingName: "name",
                    validationType: "string",
                    validations: [
                      {
                        type: "min",
                        params: [3, "Must be at least 3 characters"],
                      },
                      {
                        type: "max",
                        params: [50, "Must be at most 50 characters"],
                      },
                      { type: "trim" },
                    ],
                    readOnly: false,
                    isMultilingual: false,
                    isShowInTable: true,
                  },
                  {
                    label: "Food ID",
                    type: "text",
                    dataMappingName: "id",
                    validationType: "string",
                    validations: [
                      {
                        type: "min",
                        params: [3, "Must be at least 3 characters"],
                      },
                      {
                        type: "max",
                        params: [50, "Must be at most 50 characters"],
                      },
                      { type: "trim" },
                    ],
                    readOnly: false,
                    isMultilingual: false,
                    isShowInTable: true,
                  },
                  {
                    label: "Category",
                    type: "select",
                    options: [
                      { label: "Vegetarian", value: "Vegetarian" },
                      { label: "Non-Vegetarian", value: "Non-Vegetarian" },
                      { label: "Vegan", value: "Vegan" },
                    ],
                    dataMappingName: "category",
                    readOnly: false,
                    isMultilingual: false,
                    isShowInTable: true,
                  },
                  {
                    label: "Cuisine",
                    type: "text",
                    dataMappingName: "cuisine",
                    validationType: "string",
                    validations: [
                      {
                        type: "min",
                        params: [3, "Must be at least 3 characters"],
                      },
                      {
                        type: "max",
                        params: [50, "Must be at most 50 characters"],
                      },
                      { type: "trim" },
                    ],
                    readOnly: false,
                    isMultilingual: false,
                    isShowInTable: true,
                  },
                  {
                    label: "Preparation Time",
                    type: "number",
                    dataMappingName: "preparationTime",
                    readOnly: false,
                    isMultilingual: false,
                  },
                  {
                    label: "Description",
                    type: "textarea",
                    dataMappingName: "description",
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
            type: "tab", // it may be section, subsection, tab
            children: [
              {
                label: "Ingredient List",
                type: "section",
                children: [
                  {
                    type: "arrayItem",
                    dataMappingName: "ingredients",
                    children: [
                      {
                        label: "Ingredient Name",
                        type: "text",
                        childDataMappingName: "name",
                        readOnly: false,
                        isMultilingual: false,
                      },
                      {
                        label: "Quantity",
                        type: "text",
                        childDataMappingName: "quantity",
                        readOnly: false,
                        isMultilingual: false,
                      },
                      {
                        label: "Unit",
                        type: "text",
                        childDataMappingName: "unit",
                        readOnly: false,
                        isMultilingual: false,
                      },
                    ],
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
                    type: "arrayItem",
                    dataMappingName: "instructions",
                    children: [
                      {
                        label: "Step Number",
                        type: "number",
                        childDataMappingName: "stepNumber",
                        readOnly: false,
                        isMultilingual: false,
                      },
                      {
                        label: "Step Description",
                        type: "textarea",
                        childDataMappingName: "stepDescription",
                        readOnly: false,
                        isMultilingual: false,
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      },
    ],
    sqlQueryList: [
      {
        queryName: "getFoodDetailById",
        query: `
        SELECT 
          f.id,
          f.name,
          f.category,
          f.cuisine,
          f."preparationTime",
          f.description,
            
          jsonb_build_object(
            'calories', n.calories,
            'protein', n.protein,
            'carbohydrates', n.carbohydrates,
            'fats', n.fats,
            'vitamins', n.vitamins
          ) AS nutrition,
            
          (
            SELECT jsonb_agg(
              jsonb_build_object(
                'name', i.name,
                'quantity', i.quantity,
                'unit', i.unit
              )
            )
            FROM ingredients i
            WHERE i."foodId" = f.id
          ) AS ingredients,
            
          (
            SELECT jsonb_agg(
              jsonb_build_object(
                'stepNumber', ins."stepNumber",
                'stepDescription', ins."stepDescription"
              )
              ORDER BY ins."stepNumber"
            )
            FROM instructions ins
            WHERE ins."foodId" = f.id
          ) AS instructions
            
        FROM food f
        LEFT JOIN nutrition n ON n."foodId" = f.id
        WHERE f.id = $[id];
      `,
        sampleDataValue: {
          id: 16,
        },
      },
      {
        queryName: "saveFoodDetail",
        query: `
        DO $$
        DECLARE
          new_food_id INTEGER;
        BEGIN
          -- Insert into food and store id
          INSERT INTO food (
            name,
            category,
            cuisine,
            "preparationTime",
            description
          ) VALUES (
            $[name],
            $[category],
            $[cuisine],
            $[preparationTime],
            $[description]
          )
          RETURNING id INTO new_food_id;
  
          -- Insert into nutrition
          INSERT INTO nutrition (
            "foodId", calories, protein, carbohydrates, fats, vitamins
          ) VALUES (
            new_food_id,
            $[nutrition.calories],
            $[nutrition.protein],
            $[nutrition.carbohydrates],
            $[nutrition.fats],
            $[nutrition.vitamins]
          );
  
          -- Insert ingredients
          INSERT INTO ingredients ("foodId", name, quantity, unit) VALUES
          $<bulk:ingredients(new_food_id, $[name], $[quantity], $[unit])>;
  
          -- Insert instructions
          INSERT INTO instructions ("foodId", "stepNumber", "stepDescription") VALUES
          $<bulk:instructions(new_food_id, $[stepNumber], $[stepDescription])>;
        END $$;
      `,
        sampleDataValue: {
          name: "Paneer Butter Masala",
          category: "Vegetarian",
          cuisine: "Indian",
          preparationTime: 40,
          description:
            "A rich and creamy curry made with paneer in a tomato-butter base.",
  
          nutrition: {
            calories: 450,
            protein: 12,
            carbohydrates: 30,
            fats: 25,
            vitamins: "A, B12, D",
          },
          ingredients: [
            { name: "Paneer", quantity: "200", unit: "grams" },
            { name: "Butter", quantity: "2", unit: "tbsp" },
            { name: "Tomatoes", quantity: "3", unit: "pieces" },
            { name: "Cream", quantity: "0.5", unit: "cup" },
            { name: "Spices", quantity: "1", unit: "tbsp" },
          ],
          instructions: [
            {
              stepNumber: 1,
              stepDescription: "Heat butter in a pan and sauté onions.",
            },
            {
              stepNumber: 2,
              stepDescription: "Add tomato puree and cook until oil separates.",
            },
            {
              stepNumber: 3,
              stepDescription: "Add paneer and cook for 10 minutes.",
            },
            {
              stepNumber: 4,
              stepDescription: "Stir in cream and garnish with coriander.",
            },
          ],
        },
      },
      {
        queryName: "updateFoodDetail",
        query: `
        DO $$
        BEGIN
          -- Update food table
          UPDATE food SET
            name = $[name],
            category = $[category],
            cuisine = $[cuisine],
            "preparationTime" = $[preparationTime],
            description = $[description]
          WHERE id = $[id];
  
          -- Update nutrition table
          UPDATE nutrition SET
            calories = $[nutrition.calories],
            protein = $[nutrition.protein],
            carbohydrates = $[nutrition.carbohydrates],
            fats = $[nutrition.fats],
            vitamins = $[nutrition.vitamins]
          WHERE "foodId" = $[id];
  
          -- Update ingredients
          $<multiUpdate:ingredients(
            UPDATE ingredients SET
              name = $[name],
              quantity = $[quantity],
              unit = $[unit]
            WHERE id = $[id]
          )>
  
          -- Update instructions
          $<multiUpdate:instructions(
            UPDATE instructions SET
              "stepNumber" = $[stepNumber],
              "stepDescription" = $[stepDescription]
            WHERE id = $[id]
          )>
        END $$;
      `,
        sampleDataValue: {
          id: 1,
          name: "Updated Paneer Butter Masala",
          category: "Vegetarian",
          cuisine: "Indian",
          preparationTime: 45,
          description: "A rich tomato-based curry with paneer and butter.",
  
          nutrition: {
            calories: 480,
            protein: 14,
            carbohydrates: 32,
            fats: 28,
            vitamins: "A, B12, D",
          },
          ingredients: [
            { id: 10, name: "Paneer", quantity: "250", unit: "grams" },
            { id: 11, name: "Butter", quantity: "3", unit: "tbsp" },
            { id: 12, name: "Tomatoes", quantity: "4", unit: "pieces" },
          ],
          instructions: [
            {
              id: 21,
              stepNumber: 1,
              stepDescription: "Heat butter and sauté onions.",
            },
            {
              id: 22,
              stepNumber: 2,
              stepDescription: "Add tomato puree and cook well.",
            },
            {
              id: 23,
              stepNumber: 3,
              stepDescription: "Add paneer, simmer, and finish with cream.",
            },
          ],
        },
      },
    ],
  };
  

  const userDetailSchema = {
    name: "userDetailSchema",
    label: "User Detail Schema",
    type: "schema",
    version: "1.0",
    defaultQueryName: "getUserDetailById",
    children: [
      {
        type: "tabs",
        label: "User Details",
        children: [
          {
            label: "Basic Information",
            type: "tab",
            children: [
              {
                label: "User ID",
                type: "text",
                dataMappingName: "id",
                validationType: "string",
                readOnly: true,
                isShowInTable: true,
              },
              {
                label: "Email",
                type: "text",
                dataMappingName: "email",
                validationType: "string",
                validations: [
                  { type: "email", params: ["Invalid email address"] },
                ],
                readOnly: false,
                isShowInTable: true,
              },
              {
                label: "First Name",
                type: "text",
                dataMappingName: "firstName",
                validationType: "string",
                validations: [{ type: "min", params: [1, "Required"] }],
                readOnly: false,
                isShowInTable: true,
              },
              {
                label: "Last Name",
                type: "text",
                dataMappingName: "lastName",
                validationType: "string",
                readOnly: false,
                isShowInTable: true,
              },
              {
                label: "Phone",
                type: "text",
                dataMappingName: "phone",
                validationType: "string",
                readOnly: false,
              },
              {
                label: "Address",
                type: "textarea",
                dataMappingName: "address",
                readOnly: false,
              },
            ],
          },
        ],
      },
    ],
    sqlQueryList: [
      {
        queryName: "getUserDetailById",
        query: `SELECT id, email, "firstName", "lastName", phone, address FROM users WHERE id = $[id];`,
        sampleDataValue: { id: 1 },
      },
      {
        queryName: "saveUserDetail",
        query: `
          INSERT INTO users (email, "firstName", "lastName", phone, address)
          VALUES ($[email], $[firstName], $[lastName], $[phone], $[address])
          RETURNING id;
        `,
        sampleDataValue: {
          email: "user@example.com",
          firstName: "John",
          lastName: "Doe",
          phone: "1234567890",
          address: "123 Main St",
        },
      },
      {
        queryName: "updateUserDetail",
        query: `
          UPDATE users SET
            email = $[email],
            "firstName" = $[firstName],
            "lastName" = $[lastName],
            phone = $[phone],
            address = $[address]
          WHERE id = $[id];
        `,
        sampleDataValue: {
          id: 1,
          email: "user@example.com",
          firstName: "John",
          lastName: "Doe",
          phone: "1234567890",
          address: "123 Main St",
        },
      },
    ],
  };

  const schemaList = [
    sideBarSchema,
    dashboardSchema,
    userListSchema,
    foodListSchema,
    foodDetailSchema,
    userDetailSchema,
  ];

  for (const schema of schemaList) {
    await client.query(
      `INSERT INTO schema_config (name, label, "schema")
       VALUES ($1, $2, $3)
       `,
      [schema.name, schema.label, JSON.stringify(schema)]
    );
  }
};

export const down = async (client) => {};
