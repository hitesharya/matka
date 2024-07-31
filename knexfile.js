require("dotenv").config();

module.exports = {
  development: {
    client: "mysql2",
    connection: {
      host: process.env.db_host,
      database: process.env.db_name,
      user: process.env.db_username,
      password: process.env.db_password,
      port: process.env.db_port,
    },
    pool: {
      min: 2,
      max: 10,
    },
    migrations: {
      directory: "./migrations",
    },
  },
};
