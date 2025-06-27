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
        name: "carList",
        label: "Car List",
        icon: "",
        schemaName: "carListSchema",
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

  const carListSchema = {
    name: "carListSchema",
    label: "Car List Schema",
    type: "schema",
    version: "1.0",
    defaultQueryName: "getCarList",
    children: [
      {
        type: "heading",
        label: "Car List",
      },
      {
        type: "button",
        label: "Add Car",
        schemaName: "carDetailSchema",
        onClick: {
          navigationPath: "/app/home/create/:schemaName",
          schemaName: "carDetailSchema",
        },
      },
      {
        type: "table",
        queryName: "getCarList",
        onRowClick: {
          navigationPath: "/app/home/:uiActionType/:schemaName/:id",
          schemaName: "carDetailSchema",
        },
        children: [
          { type: "tableColum", name: "id", label: "Id" },
          { type: "tableColum", name: "name", label: "Car Name" },
          { type: "tableColum", name: "brand", label: "Brand" },
          { type: "tableColum", name: "model", label: "Model" },
          { type: "tableColum", name: "year", label: "Year" },
          { type: "tableColum", name: "price", label: "Price" },
        ],
      },
    ],
    sqlQueryList: [
      {
        queryName: "getCarList",
        query: `SELECT id, name, brand, model, year, price FROM cars;`,
      },
    ],
  };

  const carDetailSchema = {
    name: "carDetailSchema",
    label: "Car Detail Schema",
    type: "schema",
    version: "1.0",
    defaultQueryName: "getCarDetailById",
    children: [
      {
        type: "section",
        label: "",
        children: [
          {
            type: "headingWithButton",
            label: "Save",
            onClick: () => {
              console.log("Save");
            },
          },
        ],
      },
      {
        type: "section",
        label: "",
        children: [
          {
            queryName: "getCarDetailById",
            label: "Car Details",
            type: "parentTab",
            children: [
              {
                label: "Basic Information",
                type: "tab",
                children: [
                  {
                    label: "Car Name",
                    type: "text",
                    dataMappingName: "name",
                    validationType: "string",
                    readOnly: false,
                    isShowInTable: true,
                  },
                  {
                    label: "Car ID",
                    type: "text",
                    dataMappingName: "id",
                    validationType: "string",
                    readOnly: true,
                    isShowInTable: true,
                  },
                  {
                    label: "Brand",
                    type: "text",
                    dataMappingName: "brand",
                    validationType: "string",
                    readOnly: false,
                    isShowInTable: true,
                  },
                  {
                    label: "Model",
                    type: "text",
                    dataMappingName: "model",
                    validationType: "string",
                    readOnly: false,
                    isShowInTable: true,
                  },
                  {
                    label: "Year",
                    type: "number",
                    dataMappingName: "year",
                    readOnly: false,
                    isShowInTable: true,
                  },
                  {
                    label: "Price",
                    type: "number",
                    dataMappingName: "price",
                    readOnly: false,
                    isShowInTable: true,
                  },
                  {
                    label: "Description",
                    type: "textarea",
                    dataMappingName: "description",
                    readOnly: false,
                  },
                ],
              },
              {
                label: "Features",
                type: "tab",
                children: [
                  {
                    type: "arrayItem",
                    dataMappingName: "features",
                    children: [
                      {
                        label: "Feature Name",
                        type: "text",
                        childDataMappingName: "name",
                        readOnly: false,
                      },
                      {
                        label: "Value",
                        type: "text",
                        childDataMappingName: "value",
                        readOnly: false,
                      },
                    ],
                  },
                ],
              },
              {
                label: "Sales",
                type: "tab",
                children: [
                  {
                    type: "arrayItem",
                    dataMappingName: "sales",
                    children: [
                      {
                        label: "Sale Date",
                        type: "date",
                        childDataMappingName: "saleDate",
                        readOnly: true,
                      },
                      {
                        label: "Price",
                        type: "number",
                        childDataMappingName: "price",
                        readOnly: true,
                      },
                      {
                        label: "Owner Name",
                        type: "text",
                        childDataMappingName: "ownerName",
                        readOnly: true,
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
        queryName: "getCarDetailById",
        query: `SELECT id, name, brand, model, year, price, description FROM cars WHERE id = $[id];`,
        sampleDataValue: { id: 1 },
      },
      {
        queryName: "saveCarDetail",
        query: `
          INSERT INTO cars (name, brand, model, year, price, description)
          VALUES ($[name], $[brand], $[model], $[year], $[price], $[description])
          RETURNING id;
        `,
        sampleDataValue: {
          name: "Model S",
          brand: "Tesla",
          model: "S",
          year: 2022,
          price: 80000,
          description: "Electric sedan",
        },
      },
      {
        queryName: "updateCarDetail",
        query: `
          UPDATE cars SET
            name = $[name],
            brand = $[brand],
            model = $[model],
            year = $[year],
            price = $[price],
            description = $[description]
          WHERE id = $[id];
        `,
        sampleDataValue: {
          id: 1,
          name: "Model S",
          brand: "Tesla",
          model: "S",
          year: 2022,
          price: 80000,
          description: "Electric sedan",
        },
      },
    ],
  };

  const schemaList = [
    sideBarSchema,
    dashboardSchema,
    carListSchema,
    carDetailSchema,
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
