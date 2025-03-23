import logger from "../helper/logger.js";
import connectDB from "./db.js";
import { getHashPassword } from "../helper/authHelper.js";
import Organization from "../models/Organization.js";
import User from "../models/User.js";
import Schema from "../models/Schema.js";

import foodSchema from "./schema/foodSchema.js";
import fastFoodSchema from "./schema/fastFoodSchema.js";
import streetFoodSchema from "./schema/streetFoodSchema.js";

import medicalStoreSchema from "./schema/medicalStoreSchema.js";

import transactionSchema from "./schema/transactionSchema.js";

async function main() {
  try {
    // Connect to database
    await connectDB();

    console.log("Seeding database...");

    // Clear existing data
    await User.deleteMany({});
    await Organization.deleteMany({});

    const organizationList = [
      {
        name: "bookkeeping",
        details: "A bookkeeping organization.",
        schemas: [],
        users: [
          {
            name: `Bharat Sonwane`,
            email: `bharat@gmail.com`,
            password: "Super@123",
            role: "superAdmin",
          },
        ],
      },
      {
        name: "Food Corporation Pvt. Ltd.",
        details: "A food-focused organization.",
        schemas: [foodSchema, fastFoodSchema, streetFoodSchema],
        users: [
          {
            name: `Akshay Sonwane`,
            email: `akshay@gmail.com`,
            password: "Password@123",
            role: "admin",
          },
          {
            name: "Yogesh Muli",
            email: "yogesh@gmail.com",
            password: "Password@123",
            role: "admin",
          },
        ],
      },
      {
        name: "Health Solutions",
        details: "A healthcare service provider.",
        schemas: [medicalStoreSchema],
        users: [
          {
            name: "Shreyesh Kholhe",
            email: "shreyesh@gmail.com",
            password: "Password@123",
            role: "superAdmin",
          },
          {
            name: "Kunal Kamat",
            email: "kunal@gmail.com",
            password: "Password@123",
            role: "admin",
          },
        ],
      },
      {
        name: "Bank of India",
        details: "A banking organization.",
        schemas: [transactionSchema],
        users: [
          {
            name: "Sagar Kadam",
            email: "sagar@gmail.com",
            password: "Password@123",
            role: "superAdmin",
          },
        ],
      },
    ];

    // Create organizations

    // for loop
    for (let i = 0; i < organizationList.length; i++) {
      const organization = organizationList[i];
      const org = await Organization.create({
        name: organization.name,
        details: organization.details,
        schemas: organization.schemas,
      });

      console.log("Organization created:", org.name);

      // Create users for the organization
      for (let j = 0; j < organization.users.length; j++) {
        const user = organization.users[j];
        const hashedPassword = await getHashPassword(user.password);
        await User.create({
          name: user.name,
          email: user.email,
          passwordHash: hashedPassword,
          role: user.role,
          organizationId: org._id,
        });
      }
      console.log("Users created for the organization:", org.name);

      for (let j = 0; j < organization.schemas.length; j++) {
        const schema = organization.schemas[j];
        await Schema.create({
          name: schema.name,
          label: schema.label,
          version: schema.version,
          type: schema.type,
          children: schema.children,
          organizationId: org._id,
        });
      }
    }

    console.log("Users created successfully!");

    console.log("Database seeded successfully!");
  } catch (error) {
    logger.error("Error occurred during seeding:", error);
  } finally {
    logger.info("Seeding reached to finally!");
    process.exit();
  }
}

main();
