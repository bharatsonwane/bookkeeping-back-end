/**
 * @type {import('node-pg-migrate').ColumnDefinitions | undefined}
 */
export const shorthands = undefined;

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
export const up = (pgm) => {
  pgm.createSchema("main");
  pgm.createTable(
    { schema: "main", name: "tenant" },
    {
      id: {
        type: "uuid",
        primaryKey: true,
        default: pgm.func("gen_random_uuid()"),
      },
      name: { type: "varchar(255)", notNull: true },
      schema_name: { type: "varchar(255)", notNull: true, unique: true },
      template_type: { type: "varchar(50)", notNull: true },
      created_at: {
        type: "timestamp",
        notNull: true,
        default: pgm.func("current_timestamp"),
      },
    }
  );
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
export const down = (pgm) => {
  pgm.createTable(
    { schema: "main", name: "tenant" },
    {
      id: {
        type: "uuid",
        primaryKey: true,
        default: pgm.func("gen_random_uuid()"),
      },
      name: { type: "varchar(255)", notNull: true },
      schema_name: { type: "varchar(255)", notNull: true, unique: true },
      template_type: { type: "varchar(50)", notNull: true },
      created_at: {
        type: "timestamp",
        notNull: true,
        default: pgm.func("current_timestamp"),
      },
    }
  );
};
