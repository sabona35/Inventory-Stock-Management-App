const mongoose = require("mongoose")
const bcrypt = require("bcryptjs"); 
const jwt = require("jsonwebtoken");

const userSchema = mongoose.Schema({
    name: {
        type: String,
        required: [true, "Please add a name"]
    },
    email: {
        type: String,
        required: [true, "Please add an email"],
        unique: true,
        trim: true,
        match: [
            /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
            "Please enter a valid email"
        ]
    },
    password: {
        type: String,
        required: [true, "Please add a password"],
        minLength: [6, "Password must be at least 6 characters"],
        // maxLength: [23, "Password cannot be more than 23 characters"]
    },
    photo: {
        type: String,
        required: [true, "Please add an image"],
        default: "https://cdn.freebiesupply.com/logos/large/2x/react-1-logo-png-transparent.png"
    },
    phone: {
        type: String,
        default: "+1"
    },
    bio: {
        type: String,
        maxLength: [250, "Bio cannot be more than 250 characters"],
        default: "Bio"
    },
    JsonWebToken: {
        type: String,
        maxLength: [250, "Jwt cannot be more than 250 characters"],
    }
}, {
    timestamps: true
});

//     User.userSchema.pre("save", async function(next) {
//     if(!this.isModified("password")) {
//         return next();
//     }

//     //hash password
//     const salt = await bcrypt.genSalt(10)
//     const hashedPassword = await bcrypt.hash(this.password, salt);
//     this.password = hashedPassword;

// })

const User = mongoose.model("User", userSchema)

module.exports = User