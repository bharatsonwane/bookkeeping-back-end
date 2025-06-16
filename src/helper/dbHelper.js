export const compileSQLTemplate = (templateQuery, dataValue) => {
  const paramValues = [];
  let paramIndex = 1;

  const getValueByPath = (obj, path) =>
    path
      .replace(/\[(\w+)\]/g, ".$1")
      .split(".")
      .reduce((acc, key) => acc?.[key], obj);

  // 1. Handle bulk inserts first
  const resolveBulkInsert = (query) =>
    query.replace(/\$<bulk:(\w+)\(([^)]+)\)>/g, (_, arrayKey, content) => {
      const arrayData = dataValue[arrayKey];
      if (!Array.isArray(arrayData))
        throw new Error(`${arrayKey} must be an array`);

      const parts = content.split(",").map((s) => s.trim());

      const rows = arrayData.map((item) => {
        const rowParts = parts.map((part) => {
          if (part.startsWith("$[")) {
            const path = part.slice(2, -1); // strip $[ and ]
            const value = getValueByPath(item, path);
            if (value === undefined)
              throw new Error(`Missing ${path} in ${arrayKey}`);
            const placeholder = `$${paramIndex++}`;
            paramValues.push(value);
            return placeholder;
          } else {
            return part; // literal (e.g. 'new_food_id')
          }
        });

        return `(${rowParts.join(", ")})`;
      });

      return rows.join(",\n");
    });

  // 2. Handle basic $[key] placeholders
  const resolveSimplePlaceholders = (query) =>
    query.replace(/\$\[([\w.\[\]]+)\]/g, (_, path) => {
      const value = getValueByPath(dataValue, path);
      if (value === undefined)
        throw new Error(`Missing value for key: ${path}`);
      const placeholder = `$${paramIndex++}`;
      paramValues.push(value);
      return placeholder;
    });

  const parsedQuery = resolveSimplePlaceholders(
    resolveBulkInsert(templateQuery)
  );

  return { query: parsedQuery, paramValues };
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

const { query, paramValues } = compileSQLTemplate(template, data);
console.log(query);
// INSERT INTO orders (user_id, total, item1_price, item2_price)
// VALUES ($1, $2, $3, $4);

console.log(paramValues);
// [123, 456.78, 12.5, 34.9]
*/

/** 
 * @example2
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

const { query, paramValues } = compileSQLTemplate(template2, data2);
*/
