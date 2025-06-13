module.exports = {
  up: (pgm) => {
    pgm.createTable("users", {
      id: {
        type: "serial",
        primaryKey: true,
      },
      tenant_id: {
        type: "integer",
        notNull: true,
        references: "tenants(id)",
        onDelete: "cascade",
      },
      name: {
        type: "varchar(100)",
        notNull: true,
      },
      email: {
        type: "varchar(150)",
        notNull: true,
        unique: true,
      },
      role: {
        type: "varchar(50)",
        notNull: true,
        default: "user",
      },
      created_at: {
        type: "timestamp",
        default: pgm.func("current_timestamp"),
      },
    });
  },

  down: (pgm) => {
    pgm.dropTable("users");
  },
};
