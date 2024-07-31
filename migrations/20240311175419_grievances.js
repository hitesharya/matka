const knex = require("../db");

exports.up = function (knex) {
  return knex.schema.createTable("grievances", function (table) {
    table.increments("id").primary().notNullable().defaultTo(null);
    table.integer("user_id").notNullable();
    table
      .integer("type")
      .notNullable()
      .defaultTo(0)
      .comment("0: complaint, 1: demand, 2: others");
    table.string("grie_title", 50).notNullable();
    table.text("grievance_details").nullable();
    table.text("address_details").nullable();
    table.integer("district_id").notNullable();
    table.integer("block_id").notNullable();
    table.integer("village_id").notNullable();
    table.string("photo1", 255).nullable();
    table.string("photo2", 255).nullable();
    table.string("photo3", 255).nullable();
    table.string("photo4", 255).nullable();
    table.decimal("lat", 10, 8);
    table.decimal("long", 11, 8);
    table
      .integer("grievance_status")
      .notNullable()
      .defaultTo(0)
      .comment("0: pending, 1: closed, 2: rejected, 4: progress");
    table.integer("is_similar_grievance").notNullable().defaultTo(0);
    table.timestamp("created_at").notNullable().defaultTo(knex.fn.now());
    table.timestamp("updated_at").notNullable().defaultTo(knex.fn.now());
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable("grievances");
};
