// src/database/migrations/common/002-schema-config-table.js

const dashboardSchema = {
  name: "dashboardSchema",
  label: "Dashboard Schema",
  type: "schema",
  version: "1.0",
  children: [],
};

const dashboardQuerySchema = {
  name: "dashboardSchema",
  label: "Dashboard Schema",
  type: "querySchema",
  version: "1.0",
};

const productListSchema = {
  name: "dashboardSchema",
  label: "Dashboard Schema",
  type: "schema",
  version: "1.0",
  children: [],
};

const productListQuerySchema = {
  name: "dashboardSchema",
  label: "Dashboard Schema",
  type: "querySchema",
  version: "1.0",
};

const productDetail = {
  name: "productDetailSchema",
  label: "Product Detail Schema",
  type: "schema",
  version: "1.0",
  children: [],
};

const productDetailQuerySchema = {
  name: "productDetailSchema",
  label: "Product Detail Schema",
  type: "querySchema",
  version: "1.0",
};

const sidebarItem = [
  {
    name: "dashboard",
    label: "Dashboard",

    uiSchema: dashboardSchema,
    querySchema: dashboardQuerySchema,
  },
  {
    name: "productList",
    label: "Product List",

    uiSchema: productListSchema,
    querySchema: productListQuerySchema,
  },
  {
    name: "productDetail",
    label: "Product Detail",

    uiSchema: productDetail,
    querySchema: productDetailQuerySchema,
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
      `INSERT INTO schema_config (name, label, "uiSchema", "sqlQuery")
       VALUES ($1, $2, $3, $4)
       RETURNING id`,
      [
        schema.name,
        schema.label,
        JSON.stringify(schema.uiSchema),
        JSON.stringify(schema.querySchema),
      ]
    );

    const insertedId = result.rows[0].id;

    sideBarSchemaForDB.children.push({
      name: schema.name,
      label: schema.label,
      schemaId: insertedId,
    });
  }

  await client.query(
    `INSERT INTO schema_config (name, label, "uiSchema", "sqlQuery")
     VALUES ($1, $2, $3, $4)
     RETURNING id`,
    [
      sideBarSchemaForDB.name,
      sideBarSchemaForDB.label,
      JSON.stringify(sideBarSchemaForDB),
      JSON.stringify({}),
    ]
  );
};

export const down = async (client) => {};
