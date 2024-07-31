const knex = require("../db");

exports.up = function (knex) {
  return knex.schema.createTable("super_admins", function (table) {
    table.increments("id").primary().notNullable().defaultTo(null);
    table.string("username", 50).nullable();
    table.string("password", 500).nullable().defaultTo(null);
    table.string("token", 500).nullable().defaultTo(null);
    table.timestamp("created_at").notNullable().defaultTo(knex.fn.now());
    table.timestamp("updated_at").notNullable().defaultTo(knex.fn.now());
  });
};

exports.down = function () {
  return knex.schema.dropTable("super_admins");
};
