const asyncHandler = require("express-async-handler");
const User = require("../models/UserModel");
const bcrypt = require("bcryptjs"); 
const jwt = require("jsonwebtoken");

const generateToken = (id) => {
    return jwt.sign({id}, process.env.JWT_SECRET, {expiresIn: "1d"})
}
//register user
const registerUser = asyncHandler( async (req, res) => {

    const {name, email, password} = req.body

    //Validation
    if (!name || !email || !password) {
        res.status(400);
        throw new Error("Please fill in all required fields");
    }

    if (password.length < 6) {
        res.status(400);
        throw new Error("Password must be at least 6 characters");
    }

    //Check if user email already exits
    const userExists = await User.findOne({email})

    if (userExists) {
        res.status(400);
        throw new Error("Email has been registed already");
    }

    //Password encryption before saving to DB
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(password, salt)

    //generate token

    const token = generateToken(user._id)

    //send http-only cookie to client (frontend)

    res.cookie("Token", token, {
        path: "/",
        httpOnly: true,
        expires: new Date(Date.now() + 1000 * 86400), //1 day
        sameSite: "none", 
        secure: true,
    })

    //Create new user
    const user = await User.create({
        name,
        email,
        password,
    })

    if (user) {
        const {_id, name, email, photo, phone, bio} = user
        res.status(201).json({
            _id, name, email, photo, phone, bio, token,
        })
    }  else {
        res.status(400);
        throw new Error("Invalid user data")
    }

});

//login user
const loginUser = asyncHandler( async (req, res) => {
    const {email, password} = req.body

    //validate requests
    if (!email || !password) {
        res.status(400);
    throw new Error("Please add email and password");
    }

    //check if user exists
    const user = await User.findOne({email})
    if (!user) {
        res.status(400);
    throw new Error("User not found. Please signup");
    }

    //user exists, check if password is correct
    const passwordIsCorrect = await bcrypt.compare(password, user.password)

    const token = generateToken(user._id)
    res.cookie("Token", token, {
        path: "/",
        httpOnly: true,
        expires: new Date(Date.now() + 1000 * 86400), //1 day
        sameSite: "none", 
        secure: true,
    })

    if (user && passwordIsCorrect) {
        const {_id, name, email, photo, phone, bio, token} = user;
        res.status(200).json({
            _id,
            name,
            email,
            photo,
            phone,
            bio,
            token,
        });
    } else {
        res.status(400);
        throw new Error("Invalid email or password. Please try again.");
    }

});

module.exports = {
    registerUser, loginUser
};