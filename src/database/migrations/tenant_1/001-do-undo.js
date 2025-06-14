export const up = async (db, schema) => {
    await db.query(`
      CREATE TABLE IF NOT EXISTS tenant_1.projects (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL
      );
    `);
  };
  
  export const down = async (db, schema) => {
    await db.query(`DROP TABLE IF EXISTS tenant_1.projects;`);
  };
  