CREATE TABLE IF NOT EXISTS schema_config (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    label TEXT,
    "schema" JSONB
);

CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    "firstName" VARCHAR(100),
    "lastName" VARCHAR(100),
    phone VARCHAR(20),
    address TEXT,
    "createdAt" TIMESTAMP DEFAULT NOW()
);

-- 1. FOOD TABLE
CREATE TABLE IF NOT EXISTS food (
  id SERIAL PRIMARY KEY,
  name VARCHAR(50) NOT NULL CHECK (char_length(name) >= 3),
  category VARCHAR(20) CHECK (category IN ('Vegetarian', 'Non-Vegetarian', 'Vegan')),
  cuisine VARCHAR(50) CHECK (char_length(cuisine) >= 3),
  "preparationTime" INTEGER,
  description TEXT
);

-- 2. NUTRITION TABLE
CREATE TABLE IF NOT EXISTS nutrition (
  id SERIAL PRIMARY KEY,
  calories NUMERIC,
  protein NUMERIC,
  carbohydrates NUMERIC,
  fats NUMERIC,
  vitamins TEXT,
  "foodId" INTEGER REFERENCES food(id) ON DELETE CASCADE
);

-- 3. INGREDIENTS TABLE
CREATE TABLE IF NOT EXISTS ingredients (
  id SERIAL PRIMARY KEY,
  name TEXT,
  quantity TEXT,
  unit TEXT,
  "foodId" INTEGER REFERENCES food(id) ON DELETE CASCADE
);

-- 4. INSTRUCTIONS TABLE
CREATE TABLE IF NOT EXISTS instructions (
  id SERIAL PRIMARY KEY,
  "stepNumber" INTEGER,
  "stepDescription" TEXT,
  "foodId" INTEGER REFERENCES food(id) ON DELETE CASCADE
);
