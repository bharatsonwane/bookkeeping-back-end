// Helper function to escape SQL literals
const escapeLiteral = (val) => {
  if (val === null || val === undefined) return "NULL";
  if (typeof val === "number") return val;
  if (typeof val === "boolean") return val ? "TRUE" : "FALSE";
  return `'${String(val).replace(/'/g, "''")}'`; // escape single quotes
};

// Helper function to get nested object values by path (for root data context)
const getValueByPath = (obj, path) => {
  // Check if path starts with 'data.' and remove it
  let actualPath = path;
  if (path.startsWith('data.')) {
    actualPath = path.slice(5); // Remove 'data.' prefix
  } else {
    throw new Error(`Path must start with 'data.': ${path}`);
  }
  
  return actualPath
    .replace(/\[(\w+)\]/g, ".$1")
    .split(".")
    .reduce((acc, key) => acc?.[key], obj);
};

// Helper function for item-level path resolution (doesn't require 'data.' prefix)
const getValueByPathFromItem = (obj, path) => {
  return path
    .replace(/\[(\w+)\]/g, ".$1")
    .split(".")
    .reduce((acc, key) => acc?.[key], obj);
};

// Handle bulk insert placeholders: $<bulk:arrayKey(content)>
const resolveBulkInserts = (query, data) => {
  return query.replace(
    /\$<bulk:([^(]+)\(([^)]+)\)>/g,
    (_, arrayKey, content) => {
      // Check if arrayKey contains a placeholder like $[path]
      let resolvedArrayKey = arrayKey.trim();
      if (resolvedArrayKey.startsWith("$[") && resolvedArrayKey.endsWith("]")) {
        // Extract the path from $[path] format
        resolvedArrayKey = resolvedArrayKey.slice(2, -1);
      }

      const arrayData = getValueByPath(data, resolvedArrayKey);
      if (!Array.isArray(arrayData)) {
        throw new Error(`${resolvedArrayKey} must be an array`);
      }

      const parts = content.split(",").map((s) => s.trim());

      const rows = arrayData.map((item) => {
        const rowParts = parts.map((part) => {
          if (part.startsWith("$[") && part.endsWith("]")) {
            const path = part.slice(2, -1);
            const value = getValueByPathFromItem(item, path);
            if (value === undefined) {
              throw new Error(`Missing ${path} in ${arrayKey}`);
            }
            return escapeLiteral(value);
          }
          return part; // literal or identifier
        });
        return `(${rowParts.join(", ")})`;
      });

      return rows.join(",\n");
    }
  );
};

// Handle multi-update placeholders: $<multiUpdate:arrayKey(updateTemplate)>
const resolveMultiUpdates = (query, data) => {
  return query.replace(
    /\$<multiUpdate:([^(]+)\(([^)]+)\)>/g,
    (_, arrayKey, updateTemplate) => {
      // Check if arrayKey contains a placeholder like $[path]
      let resolvedArrayKey = arrayKey.trim();
      if (resolvedArrayKey.startsWith("$[") && resolvedArrayKey.endsWith("]")) {
        // Extract the path from $[path] format
        resolvedArrayKey = resolvedArrayKey.slice(2, -1);
      }

      const arrayData = getValueByPath(data, resolvedArrayKey);
      if (!Array.isArray(arrayData)) {
        throw new Error(`${resolvedArrayKey} must be an array`);
      }

      const updateStatements = arrayData.map((item) => {
        const stmt = updateTemplate.replace(
          /\$\[([\w.\[\]]+)\]/g,
          (_, path) => {
            const value = getValueByPathFromItem(item, path);
            if (value === undefined) {
              throw new Error(`Missing value for key: ${path} in ${arrayKey}`);
            }
            return escapeLiteral(value);
          }
        );
        return stmt.trim().endsWith(";") ? stmt : stmt + ";";
      });

      return updateStatements.join("\n");
    }
  );
};

// Handle simple placeholders: $[path]
const resolveSimplePlaceholders = (query, data) => {
  return query.replace(/\$\[([\w.\[\]]+)\]/g, (_, path) => {
    const value = getValueByPath(data, path);
    if (value === undefined) {
      throw new Error(`Missing value for key: ${path}`);
    }
    return escapeLiteral(value);
  });
};

// Main function - now much simpler and easier to understand
export const compileSQLTemplate = (templateQuery, data) => {
  // Process placeholders in order: bulk inserts → multi-updates → simple placeholders
  let compiledQuery = resolveBulkInserts(templateQuery, data);
  compiledQuery = resolveMultiUpdates(compiledQuery, data);
  compiledQuery = resolveSimplePlaceholders(compiledQuery, data);

  return compiledQuery;
};

/** @insertExample1
const insertTemplate1 = `
  INSERT INTO orders (user_id, total, item1_price, item2_price)
  VALUES ($[data.user.id], $[data.total], $[data.items[0].price], $[data.items[1].price]);
`;

const insertData1 = {
  user: { id: 123 },
  total: 456.78,
  items: [{ price: 12.5 }, { price: 34.9 }],
};

const insertCompiledQuery1 = compileSQLTemplate(insertTemplate1, insertData1);
console.log(insertCompiledQuery1);
// INSERT INTO orders (user_id, total, item1_price, item2_price)
// VALUES ($1, $2, $3, $4);

*/

/**@insertExample2
const insertTemplate2 = `
INSERT INTO ingredients ("foodId", name, quantity, unit) VALUES
$<bulk:$[data.ingredients]('new_food_id', $[name], $[quantity], $[unit])>;
;
`;

const insertData2 = {
  ingredients: [
    { name: "Paneer", quantity: "200", unit: "grams" },
    { name: "Butter", quantity: "2", unit: "tbsp" },
  ],
};

const insertCompiledQuery2 = compileSQLTemplate(insertTemplate2, insertData2);
console.log("insertCompiledQuery2", insertCompiledQuery2);
*/

/**@insertExample3
const insertTemplate3 = `
INSERT INTO ingredients ("foodId", name, quantity, unit) VALUES
$<bulk:$[data.foodDetail.ingredients]('new_food_id', $[name], $[quantity], $[unit])>;
`;

const insertData3 = {
  foodDetail: {
    ingredients: [
      { name: "Paneer", quantity: "200", unit: "grams" },
      { name: "Butter", quantity: "2", unit: "tbsp" },
    ],
  },
};

const insertCompiledQuery3 = compileSQLTemplate(insertTemplate3, insertData3);
console.log("insertCompiledQuery3", insertCompiledQuery3);
*/

/**@insertExample4 - Enhanced syntax with placeholder in bulk key
const insertTemplate4 = `
INSERT INTO ingredients ("foodId", name, quantity, unit) VALUES
$<bulk:$[data.foodDetail.ingredients]('new_food_id', $[name], $[quantity], $[unit])>;
`;

const insertData4 = {
  foodDetail: {
    ingredients: [
      { name: "Paneer", quantity: "200", unit: "grams" },
      { name: "Butter", quantity: "2", unit: "tbsp" },
    ],
  },
};

const insertCompiledQuery4 = compileSQLTemplate(insertTemplate4, insertData4);
console.log("insertCompiledQuery4", insertCompiledQuery4);
*/

/**@updateExample1
const updateTemplate1 = `$<multiUpdate:$[data.ingredients](UPDATE food SET name = $[name] WHERE id = $[id] )>`;

const updateData1 = {
  food: { id: 1, name: "Updated Food" },
  ingredients: [
    { id: 101, name: "Salt", quantity: "1", unit: "tsp" },
    { id: 102, name: "Butter", quantity: "2", unit: "tbsp" },
  ],
};

const updateCompiledQuery1 = compileSQLTemplate(updateTemplate1, updateData1);
console.log("updateCompiledQuery1", updateCompiledQuery1);
*/

/**@updateExample2 - Enhanced syntax with placeholder in multiUpdate key
const updateTemplate2 = `$<multiUpdate:$[data.foodDetail.ingredients](UPDATE food SET name = $[name] WHERE id = $[id])>`;

const updateData2 = {
  foodDetail: {
    ingredients: [
      { id: 101, name: "Salt", quantity: "1", unit: "tsp" },
      { id: 102, name: "Butter", quantity: "2", unit: "tbsp" },
    ],
  },
};

const updateCompiledQuery2 = compileSQLTemplate(updateTemplate2, updateData2);
console.log("updateCompiledQuery2", updateCompiledQuery2);
*/
