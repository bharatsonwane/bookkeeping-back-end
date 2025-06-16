// src/database/migrations/common/002-schema-config-table.js

const dashboardSchema = {
  name: "dashboardSchema",
  label: "Dashboard Schema",
  type: "schema",
  version: "1.0",
  children: [],
};

const productListSchema = {
  name: "dashboardSchema",
  label: "Dashboard Schema",
  type: "schema",
  version: "1.0",
  children: [],
};

// `SELECT name, "description", "price" from products;`
const productDetail = {
  name: "productDetailSchema",
  label: "Product Detail Schema",
  type: "schema",
  version: "1.0",
  children: [],
};

const sidebarItem = [
  {
    name: "dashboard",
    label: "Dashboard",
    schema: dashboardSchema,
  },
  {
    name: "productList",
    label: "Product List",

    schema: productListSchema,
  },
  {
    name: "productDetail",
    label: "Product Detail",

    schema: productDetail,
  },
];
export const up = async (client) => {
  const sideBarSchemaForDB = {
    name: "sidebarSchema",
    label: "Sidebar Schema",
    type: "schema",
    version: "1.0",
    children: [],
  };

  for (const schema of sidebarItem) {
    const result = await client.query(
      `INSERT INTO schema_config (name, label, "schema")
       VALUES ($1, $2, $3)
       RETURNING id`,
      [schema.name, schema.label, JSON.stringify(schema.schema)]
    );

    const insertedId = result.rows[0].id;

    sideBarSchemaForDB.children.push({
      name: schema.name,
      label: schema.label,
      schemaId: insertedId,
    });
  }

  await client.query(
    `INSERT INTO schema_config (name, label, "schema")
     VALUES ($1, $2, $3)
     RETURNING id`,
    [
      sideBarSchemaForDB.name,
      sideBarSchemaForDB.label,
      JSON.stringify(sideBarSchemaForDB),
    ]
  );
};

export const down = async (client) => {};
