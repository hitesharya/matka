const jwt = require("jsonwebtoken");
const knex = require("../../db");
const { trycatch } = require("../../utils/try_catch");
const util = require("util");
const { CreateError } = require("../../utils/create_err");
const verifyJwt = util.promisify(jwt.verify);

var citizen_token_val = async (req, res, next) => {
  try {
    let token = req.header("authorization");
    token = token.split(" ");
    token = token[1];
    if (!token) {
      return res.json({ status: "002", msg: "Please provide token in header" });
    }

    const decoded = await verifyJwt(token, process.env.citizen_key);
    const [Token] = await knex("users")
      .pluck("token")
      .where("id", decoded.id)
      .andWhere("status", 0);
    if (Token === null) {
      return res.send({
        status: "002",
        message: "Token has been revoked. Please log in again.",
      });
    }

    req.citizen_id = decoded.id;
    if (Token === token) {
      next();
    } else {
      return res.send({
        status: "002",
        message: "You are not the correct citizen.",
      });
    }
  } catch (error) {
    return res.send({
      status: "002",
      error,
      error,
      msg: "Invalid or expired token",
    });
  }
};

// var official_token_val = async (req, res, next) => {
//   try {
//     let token = req.header("authorization");
//     token = token.split(" ");
//     console.log(token[1]);
//     if (!token) {
//       return res.json({ status: '002', msg: "Please provide token in header" });
//     }

//     const { id } = jwt.verify(token[1], process.env.user_key);

//     //const decoded = await verifyJwt(token, process.env.official_key);

//     const [Token] = await knex("users").pluck("token").where("id", id);
//     console.log(Token);
//     if (Token === null) {
//       return res.send({
//         status: '002',
//         message: "Token has been revoked. Please log in again.",
//       });
//     }

//     req.official_id = id;
//     if (Token === token[1]) {
//       next();
//     } else {
//       res.send({ status: '002', message: "You are not the correct official." });
//     }
//   } catch (error) {
//     res.send({ status: '002', error, error, msg: "Invalid or expired token" });
//   }
// };

var official_token_val = async (req, res, next, transaction) => {
  const token = req.header("authorization");
  const tokenParts = token ? token.split(" ") : [];
  if (!tokenParts) {
    throw new CreateError("TokenError", "Header is empty");
  }

  try {
    const decoded = await verifyJwt(tokenParts[1], process.env.official_key);

    var { token: comp_token } = await transaction("users")
      .select("token")
      .where("id", decoded.id)
      .first();

    req.official_id = decoded.id;

    if (tokenParts[1] !== comp_token) {
      throw new CreateError("Token Error", "Invalid Token in admin table");
    }

    next();
  } catch (error) {
    console.log(error);
    throw new CreateError("TokenError", "Invalid Token during verify");
  }
};

// var user_token_val = async (req, res, next) => {
//   try {
//     let token = req.header("authorization");
//     token = token.split(" ");
//     token = token[1]
//     if (!token) {
//       return res.json({ status: '002', msg: "Please provide token in header" });
//     }

//     const {isOfficial} = req.body;

//     //const decoded = await verifyJwt(token, process.env.official_key);
//     const decoded = await verifyJwt(token, isOfficial === 1 ? process.env.official_key : process.env.citizen_key);

//     const [Token] = await knex("users").pluck("token").where("id", decoded.id)
//     if (Token === null) {
//       return res.send({
//         status: '002',
//         message: "Token has been revoked. Please log in again.",
//       });
//     }

//     req.user_id = decoded.id;
//     if (Token === token) {
//       next();
//     } else {
//       res.send({ status: '002', message: "You are not the correct user."});
//     }
//   } catch (error) {
//     res.send({ status: '002', error, error, msg: "Invalid or expired token" });
//   }
// };

var user_token_val = async (req, res, next, transaction) => {
  var { isOfficial } = req.body;
  const token = req.header("authorization");
  const tokenParts = token ? token.split(" ") : [];
  if (!tokenParts) {
    throw new CreateError("TokenError", "Header is empty");
  }

  try {
    var key;
    if (isOfficial == 1) {
      key = process.env.official_key;
    } else {
      key = process.env.citizen_key;
    }

    const decoded = await verifyJwt(tokenParts[1], key);

    req.user_id = decoded.id;

    var { token: comp_token } = await transaction("users")
      .select("token")
      .where("id", decoded.id)
      .first();

    if (tokenParts[1] !== comp_token) {
      throw new CreateError("Token Error", "Invalid Token in users table");
    }

    if (isOfficial == 1) {
      req.isOfficial = 1;
    } else {
      req.isOfficial = 0;
    }
    next();
  } catch (error) {
    console.log(error);
    throw new CreateError("TokenError", "Invalid Token during verify");
  }
};

citizen_token_val = trycatch(citizen_token_val);
official_token_val = trycatch(official_token_val);
user_token_val = trycatch(user_token_val);

module.exports = { citizen_token_val, official_token_val, user_token_val };
