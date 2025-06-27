export const compileSQLTemplate = (templateQuery, dataValue) => {
  const escapeLiteral = (val) => {
    if (val === null || val === undefined) return 'NULL';
    if (typeof val === 'number') return val;
    if (typeof val === 'boolean') return val ? 'TRUE' : 'FALSE';
    return `'${String(val).replace(/'/g, "''")}'`; // escape single quotes
  };

  const getValueByPath = (obj, path) =>
    path
      .replace(/\[(\w+)\]/g, ".$1")
      .split(".")
      .reduce((acc, key) => acc?.[key], obj);

  // 1. Handle bulk inserts
  const resolveBulkInsert = (query) =>
    query.replace(/\$<bulk:(\w+)\(([^)]+)\)>/g, (_, arrayKey, content) => {
      const arrayData = dataValue[arrayKey];
      if (!Array.isArray(arrayData))
        throw new Error(`${arrayKey} must be an array`);
      const parts = content.split(",").map((s) => s.trim());

      const rows = arrayData.map((item) => {
        const rowParts = parts.map((part) => {
          if (part.startsWith("$[")) {
            const path = part.slice(2, -1);
            const value = getValueByPath(item, path);
            if (value === undefined)
              throw new Error(`Missing ${path} in ${arrayKey}`);
            return escapeLiteral(value);
          } else {
            return part; // literal or identifier
          }
        });
        return `(${rowParts.join(", ")})`;
      });

      return rows.join(",\n");
    });

  // 2. Handle multi-update blocks
  const resolveMultiUpdate = (query) =>
    query.replace(
      /\$<multiUpdate:(\w+)\(([^)]+)\)>/g,
      (_, arrayKey, updateTemplate) => {
        const arrayData = dataValue[arrayKey];
        if (!Array.isArray(arrayData))
          throw new Error(`${arrayKey} must be an array`);

        const updateStatements = arrayData.map((item) => {
          let stmt = updateTemplate.replace(
            /\$\[([\w.\[\]]+)\]/g,
            (_, path) => {
              const value = getValueByPath(item, path);
              if (value === undefined)
                throw new Error(
                  `Missing value for key: ${path} in ${arrayKey}`
                );
              return escapeLiteral(value);
            }
          );
          return stmt.trim().endsWith(";") ? stmt : stmt + ";";
        });

        return updateStatements.join("\n");
      }
    );

  // 3. Handle simple placeholders
  const resolveSimplePlaceholders = (query) =>
    query.replace(/\$\[([\w.\[\]]+)\]/g, (_, path) => {
      const value = getValueByPath(dataValue, path);
      if (value === undefined)
        throw new Error(`Missing value for key: ${path}`);
      return escapeLiteral(value);
    });

  const compiledQuery = resolveSimplePlaceholders(
    resolveMultiUpdate(resolveBulkInsert(templateQuery))
  );

  return compiledQuery
};

/** 
 * @example1
const template = `
  INSERT INTO orders (user_id, total, item1_price, item2_price)
  VALUES ($[user.id], $[total], $[items[0].price], $[items[1].price]);
`;

const data = {
  user: { id: 123 },
  total: 456.78,
  items: [{ price: 12.5 }, { price: 34.9 }],
};

const compiledQuery = compileSQLTemplate(template, data);
console.log(compiledQuery);
// INSERT INTO orders (user_id, total, item1_price, item2_price)
// VALUES ($1, $2, $3, $4);

// */

/**@example2
const template2 = `
INSERT INTO ingredients ("foodId", name, quantity, unit) VALUES
$<bulk:ingredients('new_food_id', $[name], $[quantity], $[unit])>;
;
`;

const data2 = {
  ingredients: [
    { name: "Paneer", quantity: "200", unit: "grams" },
    { name: "Butter", quantity: "2", unit: "tbsp" },
  ],
};

const compiledQuery2 = compileSQLTemplate(template2, data2);
console.log("compiledQuery2", compiledQuery2);
*/

/**@example3
const template3 = `$<multiUpdate:ingredients(UPDATE food SET name = $[name] WHERE id = $[id] )>`;

const data3 = {
  food: { id: 1, name: "Updated Food" },
  ingredients: [
    { id: 101, name: "Salt", quantity: "1", unit: "tsp" },
    { id: 102, name: "Butter", quantity: "2", unit: "tbsp" },
  ],
};

const compiledQuery3 = compileSQLTemplate(
  template3,
  data3
);
console.log("compiledQuery3", compiledQuery3);
 */
