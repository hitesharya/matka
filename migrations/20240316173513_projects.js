const knex = require("../db");

exports.up = function (knex) {
  return knex.schema.createTable("projects", function (table) {
    table.increments("id").primary().notNullable().defaultTo(null);
    table.integer("user_id").notNullable();
    table.integer("category_id").notNullable();
    table.integer("sub_cat_id").notNullable();
    table.string("work_title", 50).notNullable();
    table.text("remarks").nullable();
    table.integer("district_id").notNullable();
    table.integer("block_id").notNullable();
    table.integer("village_id").notNullable();
    table.date("start_date").notNullable();
    table.date("completion_date").notNullable();
    table.string("allotted_cost").notNullable();
    table.string("estimated_cost").notNullable();
    table.string("photo1", 255).nullable();
    table.string("photo2", 255).nullable();
    table.string("photo3", 255).nullable();
    table.string("photo4", 255).nullable();
    table.decimal("lat", 10, 8);
    table.decimal("long", 11, 8);
    table
      .integer("project_status")
      .notNullable()
      .defaultTo(0)
      .comment("0: pending, 1: completed, 2: rejected, 4:awarded");
      table
      .integer("times")
      .notNullable()
      .defaultTo(0)
      .comment("0:add, 1,2,3:update");
    table.timestamp("created_at").notNullable().defaultTo(knex.fn.now());
    table.timestamp("updated_at").notNullable().defaultTo(knex.fn.now());
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable("projects");
};
