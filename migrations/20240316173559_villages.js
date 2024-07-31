const knex = require("../db");


exports.up = function (knex) {
    return knex.schema.createTable("villages", function (table) {
      table.increments("id").primary().notNullable().defaultTo(null);
      table.string("villageName", 50).nullable();
      table.integer("block_id").notNullable();
      table.timestamp("created_at").notNullable().defaultTo(knex.fn.now());
      table.timestamp("updated_at").notNullable().defaultTo(knex.fn.now());
    });
  };
  
  exports.down = function (knex) {
    return knex.schema.dropTable("villages"); 
  };
  