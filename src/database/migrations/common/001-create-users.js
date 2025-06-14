// src/database/migrations/common/001-create-users.js

export const up = async (client) => {
  console.log("bharatClient")
  await client.query(`
    CREATE TABLE IF NOT EXISTS common.users (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL
    );
  `);
};

export const down = async (client) => {
  await client.query('DROP TABLE IF EXISTS common.users;');
};
