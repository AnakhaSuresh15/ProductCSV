const userModel = require('../models/User');
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { generateToken } = require("../utils/Token");

const maxAge = 3 * 24 * 60 * 60 * 1000;

const addUser = async (req, res) => {
    try {
        let {firstName, lastName, username, password} = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);
        password = hashedPassword;
        const newUser = await userModel.create({firstName, lastName, username, password});
        res.status(200).json(newUser);
    } catch(error) {
        if(error.code === 11000) {
            res.status(400).json({error: "username already exists"});
        } else {
            res.status(500).json({error: "something went wrong"});
        }
    }
};

const getUserValidation = async (req, res) => {
    try {
        const { username, password } = req.body;
        let user = await userModel.findOne({ username: username  });
        if (!user) {
            return res.status(400).json({error: "invalid username/password"});
        }
        const result = await bcrypt.compare(password, user.password);
        if (result) {
            const token = generateToken(user._id);
            res.cookie("jwt", token, 
                { 
                    withCredentials: true,
                    httpOnly: false,
                    maxAge: maxAge,
                }).send(true);
        } else {
            res.status(400).json({error: "invalid username/password"}).send(false);
        }
    } catch(error) {
        res.status(500).json({ error : "something went wrong"});
    }
};

const validateUsername = async (req, res) => {
    const username = req.query.username;
    let user = await userModel.findOne({ username: username  });
    if (!user) return res.status(200).send(true);
    return res.status(200).send(false); 
}

module.exports = {addUser, getUserValidation, validateUsername};
