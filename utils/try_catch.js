const knex = require("../db");

const trycatch = (controller) => {
  return async (req, res, next) => {
    try {
      var transaction = await knex.transaction();
      await controller(req, res, next, transaction);
      console.log("in try pool");
      await transaction.commit();
    } catch (err) {
      console.error(err); // Log the error, including the stack trace

      if (transaction) {
        await transaction.rollback();
        console.log("in catch pool");
      }

      if (err.name === "ValidationError"){
        return res.send({ status: "VAL_ERR", Backend_Error: err.message });
      } else if (err.name === "TransactionError") {
        return res.send({ status: "TXN_ERR", Backend_Error: err.message });
      } else if (err.name === "FileUploadError") {
        return res.send({ status: "FILE_ERR", Backend_Error: err.message });
      } else if (err.name === "CustomError") {
        return res.send({ status: "CUSTOM_ERR", Backend_Error: err.message });
      } else if (err.name === "TokenError") {
        return res.send({ status: "TOKEN_ERR", Backend_Error: err.message });
      } else {
        return res.send({ status: "INT_ERR", Backend_Error: err.message });
      }
    }
  };
};

module.exports = { trycatch };