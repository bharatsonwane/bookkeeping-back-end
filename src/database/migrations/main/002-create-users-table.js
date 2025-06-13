export const up = (pgm) => {
  pgm.createTable(
    { schema: "main", name: "users" },
    {
      id: {
        type: "uuid",
        primaryKey: true,
        default: pgm.func("gen_random_uuid()"),
      },
      tenant_id: {
        type: "uuid",
        notNull: true,
        references: { schema: "main", name: "tenant", column: "id" },
        onDelete: "CASCADE",
      },
      email: { type: "varchar(255)", notNull: true, unique: true },
      password: { type: "varchar(255)", notNull: true },
      created_at: {
        type: "timestamp",
        notNull: true,
        default: pgm.func("current_timestamp"),
      },
    }
  );

  pgm.createIndex({ schema: "main", name: "users" }, "tenant_id");
};

export const down = (pgm) => {
  pgm.dropTable({ schema: "main", name: "users" });
};
