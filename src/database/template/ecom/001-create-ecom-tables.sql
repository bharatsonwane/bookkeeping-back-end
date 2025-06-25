CREATE TABLE IF NOT EXISTS schema_config (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) UNIQUE NOT NULL,
    label TEXT,
    "schema" JSONB,
    "isArchived" BOOLEAN DEFAULT FALSE,
    "isDeleted" BOOLEAN DEFAULT FALSE,
    "createdBy" INT DEFAULT NULL,
    "updatedBy" INT DEFAULT NULL,
    "archivedBy" INT DEFAULT NULL,
    "deletedBy" INT DEFAULT NULL,
    "createdAt" TIMESTAMP DEFAULT NOW(),
    "updatedAt" TIMESTAMP DEFAULT NOW(),
    "archivedAt" TIMESTAMP DEFAULT NOW(),
    "deletedAt" TIMESTAMP DEFAULT NOW()
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

CREATE TABLE IF NOT EXISTS products (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    "createdAt" TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS orders (
    id SERIAL PRIMARY KEY,
    "userId" INT NOT NULL,
    "totalAmount" DECIMAL(10, 2),
    status VARCHAR(50) DEFAULT 'pending',
    "createdAt" TIMESTAMP DEFAULT NOW(),
    FOREIGN KEY ("userId") REFERENCES "users"(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS order_items (
    id SERIAL PRIMARY KEY,
    "orderId" INT NOT NULL,
    "productId" INT NOT NULL,
    quantity INT NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    "createdAt" TIMESTAMP DEFAULT NOW(),
    FOREIGN KEY ("orderId") REFERENCES "orders"(id) ON DELETE CASCADE,
    FOREIGN KEY ("productId") REFERENCES "products"(id) ON DELETE CASCADE
);
