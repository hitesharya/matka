const jwt = require("jsonwebtoken");
const knex = require('../../db.js');
const { trycatch } = require("../../utils/try_catch");
const util = require("util");
const { CreateError } = require("../../utils/create_err");
const verifyJwt = util.promisify(jwt.verify);

var admin_token_val = async (req, res, next) => {
  
    var token = req.header("authorization");
    const tokenParts = token ? token.split(" ") : [];
    if (!tokenParts) {
      throw new CreateError("TokenError", "Header is empty");
    }

    try {
    const decoded = await verifyJwt(tokenParts[1], process.env.admin_key);
    const [Token] = await knex("super_admins").pluck("token").where("id", decoded.id);
    if (Token === null) {
      return res.send({
        status: '003',
        message: "Token has been revoked. Please log in again.",
      });
    }

    req.admin_id = decoded.id;
    if (Token === tokenParts[1]) {
      next();
    } else {
      res.send({ status: '003', message: "You are not the correct user." });
    }
  } catch (error) {
    res.send({ status: '003', msg: "Invalid or expired token" });
  }
};

admin_token_val = trycatch(admin_token_val);

module.exports = admin_token_val;


