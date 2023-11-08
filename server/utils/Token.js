require("dotenv").config();
const jwt = require("jsonwebtoken");
const userModel = require("../models/User");

const maxAge = 3 * 24 * 60 * 60;

generateToken = (id) => {
  return jwt.sign({id}, process.env.JWT_SECRET, {
    expiresIn: maxAge,
  });
};

const authCheck = (req, res) => {
  const token = req.cookies.jwt;
  if (!token) {
    return res.json({ status: false })
  }
  jwt.verify(token, process.env.JWT_SECRET, async (err, data) => {
    if (err) {
    return res.json({ status: false })
    } else {
      const user = await userModel.findById(data.id)
      if (user) return res.json({ status: true, user: user.username })
      else return res.json({ status: false })
    }
  })
}

module.exports = {generateToken, authCheck};