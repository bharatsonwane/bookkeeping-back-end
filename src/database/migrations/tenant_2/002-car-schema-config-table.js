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
      {
        name: "ownerList",
        label: "Owner List",
        icon: "",
        schemaName: "ownerListSchema",
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
        type: "tabs",
        label: "",
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
    sqlQueryList: [
      {
        queryName: "getCarDetailById",
        query: `SELECT id, name, brand, model, year, price, description FROM cars WHERE id = $[data.id];`,
        sampleDataValue: { id: 1 },
      },
      {
        queryName: "saveCarDetail",
        query: `
          INSERT INTO cars (name, brand, model, year, price, description)
          VALUES ($[data.name], $[data.brand], $[data.model], $[data.year], $[data.price], $[data.description])
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
            name = $[data.name],
            brand = $[data.brand],
            model = $[data.model],
            year = $[data.year],
            price = $[data.price],
            description = $[data.description]
          WHERE id = $[data.id];
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

  const ownerListSchema = {
    name: "ownerListSchema",
    label: "Owner List Schema",
    type: "schema",
    version: "1.0",
    defaultQueryName: "getOwnerList",
    children: [
      {
        type: "heading",
        label: "Owner List",
      },
      {
        type: "button",
        label: "Add Owner",
        schemaName: "ownerDetailSchema",
        onClick: {
          navigationPath: "/app/home/create/:schemaName",
          schemaName: "ownerDetailSchema",
        },
      },
      {
        type: "table",
        queryName: "getOwnerList",
        onRowClick: {
          navigationPath: "/app/home/:uiActionType/:schemaName/:id",
          schemaName: "ownerDetailSchema",
        },
        children: [
          { type: "tableColum", name: "id", label: "Id" },
          { type: "tableColum", name: "name", label: "Owner Name" },
          { type: "tableColum", name: "phone", label: "Phone" },
          { type: "tableColum", name: "address", label: "Address" },
        ],
      },
    ],
    sqlQueryList: [
      {
        queryName: "getOwnerList",
        query: `SELECT id, name, phone, address FROM owners;`,
      },
    ],
  };

  const ownerDetailSchema = {
    name: "ownerDetailSchema",
    label: "Owner Detail Schema",
    type: "schema",
    version: "1.0",
    defaultQueryName: "getOwnerDetailById",
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
        label: "Basic Information",
        children: [
          {
            label: "Owner Name",
            type: "text",
            dataMappingName: "name",
            validationType: "string",
            readOnly: false,
            isShowInTable: true,
          },
          {
            label: "Owner ID",
            type: "text",
            dataMappingName: "id",
            validationType: "string",
            readOnly: true,
            isShowInTable: true,
          },
          {
            label: "Phone",
            type: "text",
            dataMappingName: "phone",
            validationType: "string",
            readOnly: false,
            isShowInTable: true,
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
    sqlQueryList: [
      {
        queryName: "getOwnerDetailById",
        query: `SELECT id, name, phone, address FROM owners WHERE id = $[data.id];`,
        sampleDataValue: { id: 1 },
      },
      {
        queryName: "saveOwnerDetail",
        query: `
          INSERT INTO owners (name, phone, address)
          VALUES ($[data.name], $[data.phone], $[data.address])
          RETURNING id;
        `,
        sampleDataValue: {
          name: "Alice Johnson",
          phone: "9876543210",
          address: "123, Main St, Anytown, USA",
        },
      },
      {
        queryName: "updateOwnerDetail",
        query: `
          UPDATE owners SET
            name = $[data.name],
            phone = $[data.phone],
            address = $[data.address]
          WHERE id = $[data.id];
        `,
        sampleDataValue: {
          id: 1,
          name: "Alice Johnson",
          phone: "9876543210",
          address: "123, Main St, Anytown, USA",
        },
      },
    ],
  };

  const schemaList = [
    sideBarSchema,
    dashboardSchema,
    carListSchema,
    carDetailSchema,
    ownerListSchema,
    ownerDetailSchema,
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
