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
  if (path.startsWith("data.")) {
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
// Supports mixed syntax: $[data.property] for root data, $[item.property] for array items, and legacy $[property]
const resolveBulkInserts = (query, data) => {
  return query.replace(
    /\$<bulk:([^(]+)\(([\s\S]*?)\)>/g,
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
            let value;
            
            // Check for explicit root data syntax: $[data.property]
            if (path.startsWith("data.")) {
              value = getValueByPath(data, path);
              if (value === undefined) {
                throw new Error(`Missing ${path} in root data for ${arrayKey}`);
              }
            }
            // Check for explicit item syntax: $[item.property]
            else if (path.startsWith("item.")) {
              const itemPath = path.slice(5); // Remove 'item.' prefix
              value = getValueByPathFromItem(item, itemPath);
              if (value === undefined) {
                throw new Error(`Missing ${itemPath} in array item for ${arrayKey}`);
              }
            } else {
              // Legacy syntax: $[property] (backward compatibility - looks in item)
              value = getValueByPathFromItem(item, path);
              if (value === undefined) {
                throw new Error(`Missing ${path} in ${arrayKey}`);
              }
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

/** 
Handle bulk CUD (Create, Update, Delete) by specified keys with explicit logical operators:

Syntax: $<bulkCudByKey:arrayKey,[keyFields](insertTemplate|updateTemplate)>
- arrayKey: Path to array in data (e.g., $[data.ingredients])
- keyFields: Logical expression with key fields (e.g., [item.id && item.foodId])
- insertTemplate: SQL for INSERT operations
- updateTemplate: SQL for UPDATE operations

Key Field Logic:
- AND logic: [field1 && field2] - ALL fields must exist for UPDATE
- OR logic: [field1 || field2] - AT LEAST ONE field must exist for UPDATE  
- Single field: [field1] - Field must exist for UPDATE

CUD Operations:
- CREATE: Items without required key fields → execute insertTemplate
- UPDATE: Items with required key fields → execute updateTemplate  
- DELETE: Items with "isDeleteForQuery: true" → auto-generate DELETE statement

DELETE Logic:
- Uses same key fields from keyFields expression
- For AND logic: requires ALL key fields to be present
- For OR logic: uses ANY available key fields  
- Auto-extracts table name from UPDATE template
- Generates: DELETE FROM table WHERE keyField1 = value1 [AND/OR keyField2 = value2]

Examples:
{ id: 1, name: "Updated" }           → UPDATE (has key field)
{ name: "New Item" }                 → INSERT (missing key field)  
{ id: 5, isDeleteForQuery: true }    → DELETE FROM table WHERE id = 5
 */
const resolveBulkCudByKey = (query, data) => {
  return query.replace(
    /\$<bulkCudByKey:([^(]+)\(([\s\S]*?)\|([\s\S]*?)\)>/g,
    (_, arrayKeyAndPK, insertTemplate, updateTemplate) => {
      // Parse arrayKey and primaryKeyFields with logical operators
      // Look for pattern: arrayKey,[field1 && field2] or arrayKey,[field1 || field2]
      const arrayMatch = arrayKeyAndPK.match(/^(.*?),\[([^\]]+)\]$/);
      if (!arrayMatch) {
        throw new Error(
          `bulkCudByKey requires array syntax: [field1 && field2] or [field1 || field2]. Got: ${arrayKeyAndPK}`
        );
      }

      const arrayKeyPart = arrayMatch[1].trim();
      const fieldsExpression = arrayMatch[2].trim();

      // Determine if it's AND or OR logic
      let primaryKeyFields;
      let requireAllKeys;

      if (fieldsExpression.includes("&&")) {
        // AND logic: all fields must exist
        requireAllKeys = true;
        primaryKeyFields = fieldsExpression.split("&&").map((s) => s.trim());
      } else if (fieldsExpression.includes("||")) {
        // OR logic: at least one field must exist
        requireAllKeys = false;
        primaryKeyFields = fieldsExpression.split("||").map((s) => s.trim());
      } else {
        // Single field: treat as AND logic (field must exist)
        requireAllKeys = true;
        primaryKeyFields = [fieldsExpression.trim()];
      }

      // Check if arrayKey contains a placeholder like $[path]
      let resolvedArrayKey = arrayKeyPart;
      if (resolvedArrayKey.startsWith("$[") && resolvedArrayKey.endsWith("]")) {
        // Extract the path from $[path] format
        resolvedArrayKey = resolvedArrayKey.slice(2, -1);
      }

      const arrayData = getValueByPath(data, resolvedArrayKey);
      if (!Array.isArray(arrayData)) {
        throw new Error(`${resolvedArrayKey} must be an array`);
      }

      const statements = [];

            arrayData.forEach((item) => {
        // Check for deletion flag first
        if (item.isDeleteForQuery === true) {
          // Generate DELETE statement using the same key fields
          // Extract table name from UPDATE template
          const tableNameMatch = updateTemplate.match(/UPDATE\s+(\w+)\s+SET/i);
          if (!tableNameMatch) {
            throw new Error(`Cannot extract table name from UPDATE template for DELETE operation`);
          }
          const tableName = tableNameMatch[1];
          
          // Build WHERE clause - for OR logic, only include fields that exist
          const whereConditions = [];
          
          primaryKeyFields.forEach(field => {
            let value;
            let actualField = field;
            
            // Handle explicit item syntax: item.property
            if (field.startsWith("item.")) {
              actualField = field.slice(5); // Remove 'item.' prefix
              value = getValueByPathFromItem(item, actualField);
            } else {
              // Legacy syntax: property (backward compatibility)
              actualField = field; // Use field as-is for legacy syntax
              value = getValueByPathFromItem(item, field);
            }
            
            // For DELETE operations, handle missing fields based on logic type
            if (value !== null && value !== undefined) {
              // Field exists, add to WHERE clause
              whereConditions.push(`${actualField} = ${escapeLiteral(value)}`);
            } else if (requireAllKeys) {
              // AND logic requires all fields to exist
              throw new Error(`Cannot DELETE: missing key field '${actualField}' in item (AND logic requires all fields)`);
            }
            // For OR logic, missing fields are simply omitted from WHERE clause
          });
          
          // Ensure we have at least one condition for the DELETE
          if (whereConditions.length === 0) {
            throw new Error(`Cannot DELETE: no key fields found in item. Available fields: ${Object.keys(item).join(', ')}`);
          }
          
          const deleteStmt = `DELETE FROM ${tableName} WHERE ${whereConditions.join(requireAllKeys ? ' AND ' : ' OR')};`;
          statements.push(deleteStmt);
          return; // Skip UPDATE/INSERT logic
        }
        
        let shouldUpdate;
        
        if (requireAllKeys) {
          // ALL primary key fields must exist and be not null/undefined (AND logic)
          shouldUpdate = primaryKeyFields.every((field) => {
            let value;
            // Check for explicit item syntax: item.property
            if (field.startsWith("item.")) {
              const itemPath = field.slice(5); // Remove 'item.' prefix
              value = getValueByPathFromItem(item, itemPath);
            } else {
              // Legacy syntax: property (backward compatibility)
              value = getValueByPathFromItem(item, field);
            }
            return value !== null && value !== undefined;
          });
        } else {
          // AT LEAST ONE primary key field must exist and be not null/undefined (OR logic)
          shouldUpdate = primaryKeyFields.some((field) => {
            let value;
            // Check for explicit item syntax: item.property
            if (field.startsWith("item.")) {
              const itemPath = field.slice(5); // Remove 'item.' prefix
              value = getValueByPathFromItem(item, itemPath);
            } else {
              // Legacy syntax: property (backward compatibility)
              value = getValueByPathFromItem(item, field);
            }
            return value !== null && value !== undefined;
          });
        }
        
        // If conditions are met, do UPDATE; otherwise do INSERT
        if (shouldUpdate) {
          const stmt = updateTemplate.replace(
            /\$\[([\w.\[\]]+)\]/g,
            (_, path) => {
              let value;
              // Check for explicit root data syntax: $[data.property]
              if (path.startsWith("data.")) {
                value = getValueByPath(data, path);
              }
              // Check for explicit item syntax: $[item.property]
              else if (path.startsWith("item.")) {
                const itemPath = path.slice(5); // Remove 'item.' prefix
                value = getValueByPathFromItem(item, itemPath);
              } else {
                // Legacy syntax: $[property] (backward compatibility - looks in item)
                value = getValueByPathFromItem(item, path);
              }
              // For UPDATE operations, allow missing values to become NULL
              return escapeLiteral(value);
            }
          );
          statements.push(stmt.trim().endsWith(";") ? stmt : stmt + ";");
        } else {
          // Do INSERT - allow missing values and use NULL
          const stmt = insertTemplate.replace(
            /\$\[([\w.\[\]]+)\]/g,
            (_, path) => {
              let value;
              // Check for explicit root data syntax: $[data.property]
              if (path.startsWith("data.")) {
                value = getValueByPath(data, path);
              }
              // Check for explicit item syntax: $[item.property]
              else if (path.startsWith("item.")) {
                const itemPath = path.slice(5); // Remove 'item.' prefix
                value = getValueByPathFromItem(item, itemPath);
              } else {
                // Legacy syntax: $[property] (backward compatibility - looks in item)
                value = getValueByPathFromItem(item, path);
              }
              // For INSERT operations, missing values become NULL
              return escapeLiteral(value);
            }
          );
          statements.push(stmt.trim().endsWith(";") ? stmt : stmt + ";");
        }
      });

      return statements.join("\n");
    }
  );
};

// Handle bulk upsert placeholders: $<bulkUpsert:arrayKey(upsertTemplate)>
const resolveBulkUpserts = (query, data) => {
  return query.replace(
    /\$<bulkUpsert:([^(]+)\(([\s\S]*?)\)>/g,
    (_, arrayKey, upsertTemplate) => {
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

      const upsertStatements = arrayData.map((item) => {
        const stmt = upsertTemplate.replace(
          /\$\[([\w.\[\]]+)\]/g,
          (_, path) => {
            let value;
            // Check for explicit root data syntax: $[data.property]
            if (path.startsWith("data.")) {
              value = getValueByPath(data, path);
              if (value === undefined) {
                throw new Error(`Missing value for key: ${path} in root data for ${arrayKey}`);
              }
            }
            // Check for explicit item syntax: $[item.property]
            else if (path.startsWith("item.")) {
              const itemPath = path.slice(5); // Remove 'item.' prefix
              value = getValueByPathFromItem(item, itemPath);
              if (value === undefined) {
                throw new Error(`Missing value for key: ${itemPath} in array item for ${arrayKey}`);
              }
            } else {
              // Legacy syntax: $[property] (backward compatibility - looks in item)
              value = getValueByPathFromItem(item, path);
              if (value === undefined) {
                throw new Error(`Missing value for key: ${path} in ${arrayKey}`);
              }
            }
            return escapeLiteral(value);
          }
        );
        return stmt.trim().endsWith(";") ? stmt : stmt + ";";
      });

      return upsertStatements.join("\n");
    }
  );
};

// Handle multi-update placeholders: $<multiUpdate:arrayKey(updateTemplate)>
const resolveMultiUpdates = (query, data) => {
  return query.replace(
    /\$<multiUpdate:([^(]+)\(([\s\S]*?)\)>/g,
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
            let value;
            // Check for explicit root data syntax: $[data.property]
            if (path.startsWith("data.")) {
              value = getValueByPath(data, path);
              if (value === undefined) {
                throw new Error(`Missing value for key: ${path} in root data for ${arrayKey}`);
              }
            }
            // Check for explicit item syntax: $[item.property]
            else if (path.startsWith("item.")) {
              const itemPath = path.slice(5); // Remove 'item.' prefix
              value = getValueByPathFromItem(item, itemPath);
              if (value === undefined) {
                throw new Error(`Missing value for key: ${itemPath} in array item for ${arrayKey}`);
              }
            } else {
              // Legacy syntax: $[property] (backward compatibility - looks in item)
              value = getValueByPathFromItem(item, path);
              if (value === undefined) {
                throw new Error(`Missing value for key: ${path} in ${arrayKey}`);
              }
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

// Main function with mixed syntax support, logical operators, and full CUD operations
export const compileSQLTemplate = (templateQuery, data) => {
  // Process placeholders in order: bulk inserts → bulk CUD by key → bulk upserts → multi-updates → simple placeholders
  // 
  // Supported syntax:
  // - Root data access: $[data.property] - accesses properties from the root data object
  // - Item data access: $[item.property] - accesses properties from current array item
  // - Legacy syntax: $[property] - looks in current array item (backward compatibility)
  // 
  // CUD Operations:
  // - CREATE: Items without key fields get inserted
  // - UPDATE: Items with key fields get updated
  // - DELETE: Items with "isDeleteForQuery: true" get deleted using key fields
  // 
  // Examples:
  // - Mixed: $<bulk:$[data.ingredients]($[data.id], $[item.name], $[item.quantity])>
  // - Keys: $<bulkCudByKey:$[data.items],[item.id && item.categoryId](insertTemplate|updateTemplate)>
  // - Delete: { id: 5, isDeleteForQuery: true } → DELETE FROM table WHERE id = 5
  // 
  let compiledQuery = resolveBulkInserts(templateQuery, data);
  compiledQuery = resolveBulkCudByKey(compiledQuery, data);
  compiledQuery = resolveBulkUpserts(compiledQuery, data);
  compiledQuery = resolveMultiUpdates(compiledQuery, data);
  compiledQuery = resolveSimplePlaceholders(compiledQuery, data);
  
  return compiledQuery;
};

/**@insertExample1
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
console.log("insertCompiledQuery1:", insertCompiledQuery1);
*/

/**@insertExample2 - Mixed syntax: root data + item properties (recommended)
const insertTemplate2 = `
INSERT INTO ingredients ("foodId", name, quantity, unit) VALUES
$<bulk:$[data.ingredients]($[data.id], $[item.name], $[item.quantity], $[item.unit])>;
`;

const insertData2 = {
  id: 1, // Root data - food ID
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

/**@bulkUpsertExample1 - Basic bulk upsert with ON CONFLICT
const upsertTemplate1 = `
$<bulkUpsert:$[data.ingredients](
  INSERT INTO ingredients ("foodId", name, quantity, unit) 
  VALUES ($[foodId], $[name], $[quantity], $[unit])
  ON CONFLICT (id) DO UPDATE SET
    name = $[name],
    quantity = $[quantity],
    unit = $[unit]
)>`;

const upsertData1 = {
  ingredients: [
    { id: 101, foodId: 1, name: "Paneer", quantity: "300", unit: "grams" },
    { id: 102, foodId: 1, name: "Butter", quantity: "3", unit: "tbsp" },
    { foodId: 1, name: "Tomatoes", quantity: "4", unit: "pieces" }, // New item without id
  ],
};

const upsertCompiledQuery1 = compileSQLTemplate(upsertTemplate1, upsertData1);
console.log("upsertCompiledQuery1", upsertCompiledQuery1);
 */

/**@bulkUpsertExample2 - Bulk upsert for instructions with conditional logic
const upsertTemplate2 = `
$<bulkUpsert:$[data.instructions](
  INSERT INTO instructions ("foodId", "stepNumber", "stepDescription") 
  VALUES ($[foodId], $[stepNumber], $[stepDescription])
  ON CONFLICT (id) DO UPDATE SET
    "stepDescription" = $[stepDescription]
)>`;

const upsertData2 = {
  instructions: [
    {id: 1, foodId: 1, stepNumber: 1, stepDescription: "Heat butter in a large pan" },
    {id: 2, foodId: 1, stepNumber: 2, stepDescription: "Add tomato puree and cook until thick" },
    {id: 3, foodId: 1, stepNumber: 3, stepDescription: "Add paneer and simmer for 15 minutes" },
    {foodId: 1, stepNumber: 3, stepDescription: "Add paneer and simmer for 15 minutes" },
  ],
};

const upsertCompiledQuery2 = compileSQLTemplate(upsertTemplate2, upsertData2);
console.log("upsertCompiledQuery2", upsertCompiledQuery2);
 */

/**@bulkCudByKeyExample1 - Basic usage with explicit item syntax (recommended)
const bulkCudByKeyTemplate1 = `
$<bulkCudByKey:$[data.ingredients],[item.id && item.foodId](
  INSERT INTO ingredients ("foodId", name, quantity, unit) 
  VALUES ($[item.foodId], $[item.name], $[item.quantity], $[item.unit])
|
  UPDATE ingredients SET
    name = $[item.name],
    quantity = $[item.quantity],
    unit = $[item.unit]
  WHERE id = $[item.id] AND "foodId" = $[item.foodId]
)>`;

const bulkCudByKeyData1 = {
  ingredients: [
    { id: 101, foodId: 1, name: "Paneer", quantity: "300", unit: "grams" }, // Both id & foodId -> UPDATE
    { id: 102, foodId: 1, name: "Butter", quantity: "3", unit: "tbsp" },   // Both id & foodId -> UPDATE
    { foodId: 1, name: "Tomatoes", quantity: "4", unit: "pieces" },         // Missing id -> INSERT
    { id: 104, name: "Garam Masala", quantity: "1", unit: "tsp" },          // Missing foodId -> INSERT
  ],
};

const bulkCudByKeyCompiledQuery1 = compileSQLTemplate(bulkCudByKeyTemplate1, bulkCudByKeyData1);
console.log("bulkCudByKeyCompiledQuery1", bulkCudByKeyCompiledQuery1);
 */

/**@bulkCudByKeyDeleteExample - CUD operations with deletion support
const cudTemplate = `
$<bulkCudByKey:$[data.ingredients],[item.id](
  INSERT INTO ingredients ("foodId", name, quantity, unit) 
  VALUES ($[data.id], $[item.name], $[item.quantity], $[item.unit])
|
  UPDATE ingredients SET
    name = $[item.name],
    quantity = $[item.quantity],
    unit = $[item.unit]
  WHERE id = $[item.id]
)>`;

const cudData = {
  id: 1, // Food ID
  ingredients: [
    { id: 1, name: "Updated Paneer", quantity: "300", unit: "grams" },        // Has id → UPDATE
    { name: "New Ginger", quantity: "2", unit: "inches" },                   // No id → INSERT
    { id: 3, isDeleteForQuery: true },                                       // Has deletion flag → DELETE
    { id: 4, name: "Updated Garlic", quantity: "6", unit: "cloves" },        // Has id → UPDATE
    { id: 5, isDeleteForQuery: true },                                       // Has deletion flag → DELETE
    { name: "Fresh Cilantro", quantity: "1", unit: "bunch" },                // No id → INSERT
  ],
};

const cudCompiledQuery = compileSQLTemplate(cudTemplate, cudData);
console.log("🗑️ CUD with DELETE support:");
console.log(cudCompiledQuery);
 */

/**@bulkCudByKeyDeleteCompositeExample - DELETE with composite keys and logical operators
const compositeDeleteTemplate = `
$<bulkCudByKey:$[data.userRoles],[item.userId && item.roleId](
  INSERT INTO user_roles (userId, roleId, permissions, assignedBy) 
  VALUES ($[item.userId], $[item.roleId], $[item.permissions], $[data.currentUserId])
|
  UPDATE user_roles SET
    permissions = $[item.permissions],
    lastModified = NOW(),
    modifiedBy = $[data.currentUserId]
  WHERE userId = $[item.userId] AND roleId = $[item.roleId]
)>`;

const compositeDeleteData = {
  currentUserId: 100,
  userRoles: [
    { userId: 1, roleId: 2, permissions: "read,write,delete" },               // Both keys → UPDATE
    { userId: 2, roleId: 3, permissions: "read" },                           // Both keys → UPDATE  
    { userId: 1, roleId: 3, isDeleteForQuery: true },                        // Both keys + delete flag → DELETE
    { userId: 3, permissions: "admin" },                                     // Missing roleId → INSERT
    { userId: 2, roleId: 5, isDeleteForQuery: true },                        // Both keys + delete flag → DELETE
    { userId: 4, roleId: 1, permissions: "read,write" },                     // Both keys → UPDATE (or INSERT if not exists)
  ],
};

const compositeDeleteCompiled = compileSQLTemplate(compositeDeleteTemplate, compositeDeleteData);
console.log("🗑️ Composite keys with DELETE:");
console.log(compositeDeleteCompiled);
 */

/**@bulkUpsertByKeyExample2 - Usage with OR logic (at least one field required)
const bulkUpsertByKeyTemplate2 = `
$<bulkUpsertByKey:$[data.users],[userId || email](
  INSERT INTO users (userId, name, email, role) 
  VALUES ($[userId], $[name], $[email], $[role])
|
  UPDATE users SET
    name = $[name],
    email = $[email],
    role = $[role]
  WHERE userId = $[userId] OR email = $[email]
)>`;

const bulkUpsertByKeyData2 = {
  users: [
    { userId: 1, name: "John Doe", email: "john@example.com", role: "admin" },     // Has both -> UPDATE
    { name: "Jane Smith", email: "jane@example.com", role: "user" },               // Has email -> UPDATE
    { userId: 3, name: "Bob Wilson", role: "moderator" },                          // Has userId -> UPDATE
    { name: "New User", role: "guest" },                                           // Has neither -> INSERT
  ],
};

const bulkUpsertByKeyCompiledQuery2 = compileSQLTemplate(bulkUpsertByKeyTemplate2, bulkUpsertByKeyData2);
console.log("bulkUpsertByKeyCompiledQuery2", bulkUpsertByKeyCompiledQuery2);
 */

/**@bulkUpsertByKeyExample3 - Composite key with AND logic (all fields required)
const bulkUpsertByKeyTemplate3 = `
$<bulkUpsertByKey:$[data.userRoles],[userId && roleId](
  INSERT INTO user_roles (userId, roleId, permissions, assignedDate) 
  VALUES ($[userId], $[roleId], $[permissions], $[assignedDate])
|
  UPDATE user_roles SET
    permissions = $[permissions],
    assignedDate = $[assignedDate]
  WHERE userId = $[userId] AND roleId = $[roleId]
)>`;

const bulkUpsertByKeyData3 = {
  userRoles: [
    { userId: 1, roleId: 2, permissions: "read,write", assignedDate: "2024-01-15" },     // Both keys exist -> UPDATE
    { userId: 2, roleId: 3, permissions: "read", assignedDate: "2024-01-16" },           // Both keys exist -> UPDATE  
    { userId: 3, permissions: "admin", assignedDate: "2024-01-17" },                     // Missing roleId -> INSERT
    { roleId: 4, permissions: "guest", assignedDate: "2024-01-18" },                     // Missing userId -> INSERT
    { permissions: "viewer", assignedDate: "2024-01-19" },                               // Missing both -> INSERT
  ],
};

const bulkUpsertByKeyCompiledQuery3 = compileSQLTemplate(bulkUpsertByKeyTemplate3, bulkUpsertByKeyData3);
console.log("bulkUpsertByKeyCompiledQuery3", bulkUpsertByKeyCompiledQuery3);
 */

/**@bulkUpsertByKeyExample4 - Triple composite key with OR logic (at least one required)
const bulkUpsertByKeyTemplate4 = `
$<bulkUpsertByKey:$[data.orderItems],[orderId || productId || variantId](
  INSERT INTO order_items (orderId, productId, variantId, quantity, price) 
  VALUES ($[orderId], $[productId], $[variantId], $[quantity], $[price])
|
  UPDATE order_items SET
    quantity = $[quantity],
    price = $[price]
  WHERE (orderId = $[orderId] OR productId = $[productId] OR variantId = $[variantId])
)>`;

const bulkUpsertByKeyData4 = {
  orderItems: [
    { orderId: 1, productId: 10, variantId: 'red', quantity: 2, price: 25.99 },         // All 3 exist -> UPDATE
    { orderId: 1, productId: 11, quantity: 1, price: 15.99 },                          // 2 exist -> UPDATE  
    { productId: 12, quantity: 3, price: 9.99 },                                       // 1 exists -> UPDATE
    { variantId: 'green', quantity: 1, price: 12.99 },                                 // 1 exists -> UPDATE
    { quantity: 5, price: 8.99 },                                                      // None exist -> INSERT
  ],
};

const bulkUpsertByKeyCompiledQuery4 = compileSQLTemplate(bulkUpsertByKeyTemplate4, bulkUpsertByKeyData4);
console.log("bulkUpsertByKeyCompiledQuery4", bulkUpsertByKeyCompiledQuery4);
 */

/**@bulkUpsertByKeyExample5 - Complex AND logic example
const bulkUpsertByKeyTemplate5 = `
$<bulkUpsertByKey:$[data.items],[orderId && productId && variantId](
  INSERT INTO order_items (orderId, productId, variantId, quantity, price) 
  VALUES ($[orderId], $[productId], $[variantId], $[quantity], $[price])
|
  UPDATE order_items SET
    quantity = $[quantity],
    price = $[price]
  WHERE orderId = $[orderId] AND productId = $[productId] AND variantId = $[variantId]
)>`;

const bulkUpsertByKeyData5 = {
  items: [
    { orderId: 1, productId: 10, variantId: 'red', quantity: 2, price: 25.99 },     // All 3 exist → UPDATE
    { orderId: 1, productId: 11, quantity: 1, price: 15.99 },                       // Missing variantId → INSERT  
    { productId: 12, quantity: 3, price: 9.99 },                                    // Missing orderId & variantId → INSERT
    { quantity: 5, price: 12.99 },                                                  // All missing → INSERT
    { orderId: 2, variantId: 'blue', quantity: 1, price: 8.99 },                   // Missing productId → INSERT
  ],
};

const bulkUpsertByKeyCompiledQuery5 = compileSQLTemplate(bulkUpsertByKeyTemplate5, bulkUpsertByKeyData5);
console.log("bulkUpsertByKeyCompiledQuery5", bulkUpsertByKeyCompiledQuery5);
 */

/**@bulkUpsertByKeyExample6 - Single field array example
const bulkUpsertByKeyTemplate6 = `
-- Single field (treated as AND logic - field must exist)
$<bulkUpsertByKey:$[data.users],[id](
  INSERT INTO users (name, email, role) 
  VALUES ($[name], $[email], $[role])
|
  UPDATE users SET
    name = $[name],
    email = $[email],
    role = $[role]
  WHERE id = $[id]
)>`;

const bulkUpsertByKeyData6 = {
  users: [
    { id: 1, name: "John Doe", email: "john@example.com", role: "admin" },     // Has id -> UPDATE
    { name: "Jane Smith", email: "jane@example.com", role: "user" },           // No id -> INSERT
    { id: 3, name: "Bob Wilson", email: "bob@example.com", role: "moderator" }, // Has id -> UPDATE
    { name: "Alice Brown", role: "guest" },                                    // No id -> INSERT
  ],
};

const bulkUpsertByKeyCompiledQuery6 = compileSQLTemplate(bulkUpsertByKeyTemplate6, bulkUpsertByKeyData6);
console.log("bulkUpsertByKeyCompiledQuery6", bulkUpsertByKeyCompiledQuery6);
 */

/**@bulkUpsertByKeyExample7 - Comprehensive example showing all explicit item syntax
const comprehensiveTemplate = `
-- Bulk inserts with explicit item syntax
INSERT INTO products (category_id, name, price) VALUES
$<bulk:$[data.products](1, $[item.name], $[item.price])>;

-- Bulk CUD with explicit item syntax and logical operators
$<bulkCudByKey:$[data.inventory],[item.productId && item.warehouseId](
  INSERT INTO inventory (productId, warehouseId, quantity, lastUpdated) 
  VALUES ($[item.productId], $[item.warehouseId], $[item.quantity], NOW())
|
  UPDATE inventory SET
    quantity = $[item.quantity],
    lastUpdated = NOW()
  WHERE productId = $[item.productId] AND warehouseId = $[item.warehouseId]
)>

-- Multi-update with explicit item syntax
$<multiUpdate:$[data.orders](
  UPDATE orders SET status = $[item.status], updated_at = NOW() 
  WHERE id = $[item.orderId]
)>
`;

const comprehensiveData = {
  products: [
    { name: "Widget A", price: 19.99 },
    { name: "Widget B", price: 29.99 },
  ],
  inventory: [
    { productId: 1, warehouseId: 1, quantity: 100 },  // Both keys exist → UPDATE
    { productId: 2, quantity: 50 },                   // Missing warehouseId → INSERT
  ],
  orders: [
    { orderId: 1001, status: "shipped" },
    { orderId: 1002, status: "delivered" },
  ],
};

const comprehensiveCompiled = compileSQLTemplate(comprehensiveTemplate, comprehensiveData);
console.log("comprehensiveCompiled", comprehensiveCompiled);
 */

/**@bulkUpsertByKeyExample7 - Comparison: AND vs OR vs Single field
const bulkUpsertByKeyTemplate7a = `
-- ALL keys must exist (AND logic)
$<bulkUpsertByKey:$[data.records],[userId && sessionId](
  INSERT INTO user_sessions (userId, sessionId, lastActive) 
  VALUES ($[userId], $[sessionId], $[lastActive])
|
  UPDATE user_sessions SET lastActive = $[lastActive]
  WHERE userId = $[userId] AND sessionId = $[sessionId]
)>`;

const bulkUpsertByKeyTemplate7b = `
-- AT LEAST ONE key must exist (OR logic)
$<bulkUpsertByKey:$[data.records],[userId || sessionId](
  INSERT INTO user_sessions (userId, sessionId, lastActive) 
  VALUES ($[userId], $[sessionId], $[lastActive])
|
  UPDATE user_sessions SET lastActive = $[lastActive]
  WHERE userId = $[userId] OR sessionId = $[sessionId]
)>`;

const bulkUpsertByKeyTemplate7c = `
-- Single field (AND logic - field must exist)
$<bulkUpsertByKey:$[data.records],[userId](
  INSERT INTO user_sessions (userId, sessionId, lastActive) 
  VALUES ($[userId], $[sessionId], $[lastActive])
|
  UPDATE user_sessions SET lastActive = $[lastActive]
  WHERE userId = $[userId]
)>`;

const bulkUpsertByKeyData7 = {
  records: [
    { userId: 1, sessionId: 'abc123', lastActive: '2024-01-15 10:00:00' },    // Both exist
    { userId: 2, lastActive: '2024-01-15 11:00:00' },                         // Only userId exists
    { sessionId: 'def456', lastActive: '2024-01-15 12:00:00' },               // Only sessionId exists
    { lastActive: '2024-01-15 13:00:00' },                                    // Neither exists
  ],
};

console.log("=== AND logic (both required) ===");
const compiled7a = compileSQLTemplate(bulkUpsertByKeyTemplate7a, bulkUpsertByKeyData7);
console.log(compiled7a);

console.log("=== OR logic (at least one required) ===");
const compiled7b = compileSQLTemplate(bulkUpsertByKeyTemplate7b, bulkUpsertByKeyData7);
console.log(compiled7b);

console.log("=== Single field (userId required) ===");
const compiled7c = compileSQLTemplate(bulkUpsertByKeyTemplate7c, bulkUpsertByKeyData7);
console.log(compiled7c);
 */

/**@syntaxShowcase - Complete showcase of all supported syntax patterns
const showcaseTemplate = `
-- 1. Root data access only
INSERT INTO categories (name, created_by) VALUES ($[data.categoryName], $[data.userId]);

-- 2. Mixed syntax: root data + item properties (MOST COMMON)
INSERT INTO products (category_id, name, price, created_by) VALUES
$<bulk:$[data.products]($[data.categoryId], $[item.name], $[item.price], $[data.userId])>;

-- 3. Bulk CUD with mixed syntax and logical operators
$<bulkCudByKey:$[data.inventory],[item.id](
  INSERT INTO inventory (product_id, warehouse_id, quantity, updated_by) 
  VALUES ($[item.productId], $[data.warehouseId], $[item.quantity], $[data.userId])
|
  UPDATE inventory SET
    quantity = $[item.quantity],
    last_updated = NOW(),
    updated_by = $[data.userId]
  WHERE id = $[item.id]
)>

-- 4. Complex logical operators with mixed syntax
$<bulkCudByKey:$[data.orders],[item.orderId && item.customerId](
  INSERT INTO order_items (order_id, customer_id, product_id, quantity, created_by) 
  VALUES ($[item.orderId], $[item.customerId], $[item.productId], $[item.quantity], $[data.userId])
|
  UPDATE order_items SET
    quantity = $[item.quantity],
    updated_by = $[data.userId]
  WHERE order_id = $[item.orderId] AND customer_id = $[item.customerId]
)>

-- 5. Legacy syntax still works (item properties only)
$<multiUpdate:$[data.statusUpdates](
  UPDATE orders SET status = $[status], updated_by = $[data.userId] WHERE id = $[orderId]
)>
`;

const showcaseData = {
  userId: 100,
  categoryId: 5,
  categoryName: "Electronics",
  warehouseId: 1,
  products: [
    { name: "Laptop", price: 999.99 },
    { name: "Mouse", price: 29.99 },
  ],
  inventory: [
    { id: 1, productId: 10, quantity: 50 },        // Has id → UPDATE
    { productId: 11, quantity: 25 },              // No id → INSERT
  ],
  orders: [
    { orderId: 1001, customerId: 201, productId: 10, quantity: 2 }, // Both keys → UPDATE
    { orderId: 1002, productId: 11, quantity: 1 },                 // Missing customerId → INSERT
  ],
  statusUpdates: [
    { orderId: 1001, status: "shipped" },
    { orderId: 1002, status: "processing" },
  ],
};

const showcaseCompiled = compileSQLTemplate(showcaseTemplate, showcaseData);
console.log("🎯 Complete Syntax Showcase:");
console.log(showcaseCompiled);
 */
