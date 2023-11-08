const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    firstName: { 
        type: String,
        required: [true, "First name is required."] 
    },
    lastName: { 
        type: String, 
        required: [true, "Last name is required."]
    },
    username: { 
        type: String, 
        required: [true, "Username is required."],
        unique: true 
    },
    password: { 
        type: String, 
        required: [true, "Password is required."]
    }
});

const userModel = mongoose.model('User', UserSchema);

module.exports = userModel;