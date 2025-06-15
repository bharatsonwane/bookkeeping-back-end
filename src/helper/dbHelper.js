export const compileSQLTemplate = (templateQuery, dataValue) => {
  const paramMap = {};
  const paramValues = [];
  let paramIndex = 1;

  const getValueByPath = (obj, path) => {
    return path
      .replace(/\[(\w+)\]/g, ".$1") // convert [0] or [key] into .0 or .key
      .split(".")
      .reduce((acc, key) => {
        if (acc && typeof acc === "object") return acc[key];
        return undefined;
      }, obj);
  };

  const parsedQuery = templateQuery.replace(/\$\[([\w.\[\]]+)\]/g, (_, key) => {
    const value = getValueByPath(dataValue, key);
    if (value === undefined) {
      throw new Error(`Missing value for key: ${key}`);
    }

    if (!(key in paramMap)) {
      paramMap[key] = `$${paramIndex++}`;
      paramValues.push(value);
    }

    return paramMap[key];
  });

  return { query: parsedQuery, paramValues: paramValues };
};



/** 
 * @example
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