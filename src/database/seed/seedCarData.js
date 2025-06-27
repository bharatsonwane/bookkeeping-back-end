import logger from "../../helper/logger.js";
import db from "../db.js";

const insertCarData = async () => {
  const client = await db.getDbClient();

  // Dummy car data
  const carData = [
    {
      name: "Model S",
      brand: "Tesla",
      model: "S",
      year: 2022,
      price: 80000,
      description: "Electric luxury sedan.",
      features: [
        { name: "Battery", value: "100 kWh" },
        { name: "Autopilot", value: "Full Self-Driving" },
      ],
    },
    {
      name: "Mustang",
      brand: "Ford",
      model: "GT",
      year: 2021,
      price: 55000,
      description: "Iconic American muscle car.",
      features: [
        { name: "Engine", value: "5.0L V8" },
        { name: "Horsepower", value: "450 HP" },
      ],
    },
    {
      name: "Civic",
      brand: "Honda",
      model: "EX",
      year: 2020,
      price: 25000,
      description: "Reliable compact sedan.",
      features: [
        { name: "Fuel Type", value: "Petrol" },
        { name: "Transmission", value: "Automatic" },
      ],
    },
  ];

  const ownerData = [
    {
      name: "Alice Johnson",
      phone: "9876543210",
      address: "123, Main St, Anytown, USA",
    },
    {
      name: "Bob Smith",
      phone: "7896789678",
      address: "456, Oak Ave, Anytown, USA",
    },
  ];

  try {
    await client.query("BEGIN");
    // 👇 Set the default schema to 'tenant_2'
    await client.query("SET search_path TO tenant_2");

    // Insert owners
    const ownerIds = [];
    for (const owner of ownerData) {
      const result = await client.query(
        `INSERT INTO owners (name, phone, address) VALUES ($1, $2, $3) RETURNING id`,
        [owner.name, owner.phone, owner.address]
      );
      ownerIds.push(result.rows[0].id);
    }
    logger.info(`Inserted ${ownerIds.length} owners`);

    // Insert cars and features
    const carIds = [];
    for (const car of carData) {
      const carResult = await client.query(
        `INSERT INTO cars (name, brand, model, year, price, description) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`,
        [car.name, car.brand, car.model, car.year, car.price, car.description]
      );
      const carId = carResult.rows[0].id;
      carIds.push(carId);
      logger.info(`Inserted car: ${car.name} (id: ${carId})`);

      // Insert features
      for (const feature of car.features) {
        await client.query(
          `INSERT INTO features (carId, name, value) VALUES ($1, $2, $3)`,
          [carId, feature.name, feature.value]
        );
      }
      logger.info(
        `  ↳ Inserted ${car.features.length} features for car id: ${carId}`
      );
    }

    // Insert sales (linking cars and owners)
    const salesData = [
      {
        carId: carIds[0],
        ownerId: ownerIds[0],
        price: 79000,
        saleDate: "2023-01-15",
      },
      {
        carId: carIds[1],
        ownerId: ownerIds[1],
        price: 54000,
        saleDate: "2023-02-20",
      },
      {
        carId: carIds[2],
        ownerId: ownerIds[0],
        price: 24500,
        saleDate: "2023-03-10",
      },
    ];
    for (const sale of salesData) {
      await client.query(
        `INSERT INTO sales (carId, ownerId, price, saleDate) VALUES ($1, $2, $3, $4)`,
        [sale.carId, sale.ownerId, sale.price, sale.saleDate]
      );
    }
    logger.info(`Inserted ${salesData.length} sales records`);

    await client.query("COMMIT");
    logger.info("✅ Seeding completed successfully!-car");
  } catch (error) {
    await client.query("ROLLBACK");
    logger.error("❌ Error occurred during seeding-car:", error);
  } finally {
    client.release?.();
    logger.info("Seeding reached finally block!-car");
    process.exit();
  }
};

insertCarData();
