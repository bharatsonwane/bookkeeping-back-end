import { getHashPassword } from "../../helper/authHelper.js";
import logger from "../../helper/logger.js";
import db from "../db.js";

const insertFoodData = async () => {
  const client = await db.getDbClient();

  // Dummy food data
  const foodData = [
    {
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
    // Add more food items if needed
  ];

  const userData = [
    {
      email: "abc@gmail.com",
      firstName: "abc",
      lastName: "xyz",
      phone: "9876543210",
      address: "123, Main St, Anytown, USA",
    },
    {
      email: "yuk@gmail.com",
      firstName: "yuk",
      lastName: "poi",
      phone: "7896789678",
      address: "678, Main St, Anytown, USA",
    },
    {
      email: "pqr@gmail.com",
      firstName: "pqr",
      lastName: "xyz",
      phone: "7896789678",
      address: "678, Main St, Anytown, USA",
    },
    {
      email: "mno@gmail.com",
      firstName: "mno",
      lastName: "xyz",
      phone: "7896789678",
      address: "678, Main St, Anytown, USA",
    },
  ];

  try {
    await client.query("BEGIN");

    // 👇 Set the default schema to 'tenant_1'
    await client.query("SET search_path TO tenant_1");

    for (const food of foodData) {
      // Insert into food table
      const foodResult = await client.query(
        `INSERT INTO food (name, category, cuisine, "preparationTime", description) VALUES ($1, $2, $3, $4, $5) RETURNING id`,
        [
          food.name,
          food.category,
          food.cuisine,
          food.preparationTime,
          food.description,
        ]
      );
      const foodId = foodResult.rows[0].id;
      logger.info(`Inserted food: ${food.name} (id: ${foodId})`);

      // Insert into nutrition table
      await client.query(
        `INSERT INTO nutrition ("foodId", calories, protein, carbohydrates, fats, vitamins) VALUES ($1, $2, $3, $4, $5, $6)`,
        [
          foodId,
          food.nutrition.calories,
          food.nutrition.protein,
          food.nutrition.carbohydrates,
          food.nutrition.fats,
          food.nutrition.vitamins,
        ]
      );
      logger.info(`  ↳ Inserted nutrition for food id: ${foodId}`);

      // Insert ingredients
      for (const ingredient of food.ingredients) {
        await client.query(
          `INSERT INTO ingredients ("foodId", name, quantity, unit) VALUES ($1, $2, $3, $4)`,
          [foodId, ingredient.name, ingredient.quantity, ingredient.unit]
        );
      }
      logger.info(
        `  ↳ Inserted ${food.ingredients.length} ingredients for food id: ${foodId}`
      );

      // Insert instructions
      for (const instruction of food.instructions) {
        await client.query(
          `INSERT INTO instructions ("foodId", "stepNumber", "stepDescription") VALUES ($1, $2, $3)`,
          [foodId, instruction.stepNumber, instruction.stepDescription]
        );
      }
      logger.info(
        `  ↳ Inserted ${food.instructions.length} instructions for food id: ${foodId}`
      );
    }

    // Insert user data
    for (const user of userData) {
      await client.query(
        `INSERT INTO users (email, "firstName", "lastName", phone, address) VALUES ($1, $2, $3, $4, $5)`,
        [user.email, user.firstName, user.lastName, user.phone, user.address]
      );
    }

    await client.query("COMMIT");
    logger.info("✅ Seeding completed successfully!-food");
  } catch (error) {
    await client.query("ROLLBACK");
    logger.error("❌ Error occurred during seeding-food:", error);
  } finally {
    client.release?.();
    logger.info("Seeding reached finally block!-food");
    process.exit();
  }
};

insertFoodData();
