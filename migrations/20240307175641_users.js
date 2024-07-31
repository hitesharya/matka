const knex = require("../db");

exports.up = function (knex) {
  return knex.schema.createTable("users", function (table) {
    table.increments("id").primary().notNullable().defaultTo(null);
    table.string("mobile", 50).nullable();
    table.string("email", 100).nullable().defaultTo(null);
    table.string("password", 500).nullable().defaultTo(null);
    table.string("firstName", 50).nullable();
    table.string("lastName", 50).nullable();
    table.string("gender", 50).nullable().defaultTo(null);
    table.string("token", 500).nullable().defaultTo(null);
    table.integer("district_id").nullable().defaultTo(null);
    table.integer("block_id").nullable().defaultTo(null);
    table.integer("village_id").nullable().defaultTo(null);
    table
      .integer("status")
      .notNullable()
      .defaultTo(0)
      .comment("0 for citizen, 1 for official");
    table.timestamp("created_at").notNullable().defaultTo(knex.fn.now());
    table.timestamp("updated_at").notNullable().defaultTo(knex.fn.now());
  });
};

exports.down = function () {
  return knex.schema.dropTable("users");
};
