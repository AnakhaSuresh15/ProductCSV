const express = require("express");
const { addUser, getUserValidation, validateUsername } = require("../controllers/user.controller.js");

const router = express.Router();

router.post('/register', addUser);
router.post('/login', getUserValidation);

module.exports = router;