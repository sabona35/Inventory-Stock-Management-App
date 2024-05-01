const asyncHandler = require("express-async-handler");
const User = require("../models/UserModel");
const bcrypt = require("bcryptjs"); 
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const Token = require("../models/tokenModel");

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {expiresIn: "1d"})
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
    const userExists = await User.findOne({ email })

    if (userExists) {
        res.status(400);
        throw new Error("Email has been registered already");
    }

    const user = await User.create({
        name,
        email,
        password
    })
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

    if (passwordIsCorrect) {

    res.cookie("Token", token, {
        path: "/",
        httpOnly: true,
        expires: new Date(Date.now() + 1000 * 86400), //1 day
        sameSite: "none", 
        secure: true,
    })
}

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

//Logout User
const logoutUser = async (req, res) => {
    res.cookie("Token", "", {
        path: "/",
        httpOnly: true,
        expires: new Date(0),
        sameSite: "none", 
        secure: true,
    })
    return res.status(200).json({ message: "User has been logged out" })
};

//Get User Data
const getUser = asyncHandler (async (req, res) => {
    const user = User.findById(req.user._id)

    if (user) {
        const {_id, name, email, photo, phone, bio} = user;
        res.status(200).json({
            _id, 
            name, 
            email, 
            photo, 
            phone, 
            bio,
        })
    }
    else {
        res.status(400);
        throw new Error("User not found")
    }
})

//Get login status

const loginStatus = asyncHandler (async (req, res) => {

    const token = req.cookies.token
    if (!token) {
        return res.json(false)
    }
    //verify token
    const verified = jwt.verify(token, process.env.JWT_SECRET)
    if (verified) {
        return res.json(true)
    }
    return res.json(false)
})

//Update user
const updateUser = asyncHandler (async (req, res) => {
    const user = await User.findById(req.user._id)

    if (user) {
        const { name, email, photo, phone, bio} = user;
        user.email = email;
        user.name = req.body.name || name;
        user.phone = req.body.phone || phone;
        user.photo = req.body.photo || photo;
        user.bio = req.body.bio || bio;

        const updateUser = await user.save()
        res.status(200).json({
            name: updateUser.name,
            email: updateUser.email,
            photo: updateUser.photo,
            phone: updateUser.phone,
            bio: updateUser.bio,
        })
    }
    else {
        res.status(404)
        throw new Error("User not found")
    }
})

const changePassword = asyncHandler (async (req, res) => {
    const user = await User.findById(req.user._id);
    const {oldPassword, password} = req.body

    if(!user) {
        res.status(400);
        throw new Error("User not found, please register")
    }
    //validate
    if(!oldPassword || !password) {
        res.status(400)
        throw new Error("Please enter current password and new password")
    }

    //check if old password matches password in DB

    const passwordIsCorrect = await bcrypt.compare(oldPassword, user.password)

    //save new password
    if (user && passwordIsCorrect) {
        user.password = password
        await user.save()
        res.status(200).send("Password has been successfully changed")
    } else {
        res.status(400)
        throw new Error("Old password is incorrect")
    }

})

const forgotPassword = asyncHandler (async (req, res) =>{
    const { email } = req.body
    const user = await User.findOne({ email })

    if (!user) {
        res.status(404)
        throw new Error("User does not exist")
    }

    //delete token if it exists in DB
    let token = await Token.findOne({ userId: user._id})
    if (token) {
        await Token.deleteOne()
    }

    //create reset token
    let resetToken = crypto.randomBytes(32).toString("hex") + user._id
    console.log(resetToken)
    
    //hash token before saving to DB
    const hashedToken = crypto.createHash("sha256").update(resetToken).digest("hex")
    console.log(hashedToken)

    //save token to DB
    await new Token({
        userId: user._id,
        token: hashedToken,
        createdAt: Date.now(),
        expiresAt: Date.now + 30 * (60 * 1000) //30 minutes
    }).save()

    //construct reset url
    const resetUrl = `${process.env.FRONTEND_URL}/resetpassword/${resetToken}`

    //reset email
    const message = 
    `<h2>Hello ${user.name}</h2>
    <p>
        Please use the URL below to reset your password</p>
        <p>This reset link is only valid for 30 minutes.
        </p>

        <a href=${resetUrl} clicktracking=off>${resetUrl}</a>

        <p>Regards...</p>
        <p>Inventory Management Productions Team</p>`
    ;

    const subject = "Password Reset Request"
    const send_to = user.email
    const sent_from = process.env.EMAIL_USER

    try {
        await sendEmail(subject, message, send_to, sent_from);
        res.status(200).json({success: true, message: "Reset email has been sent"});
    }
    catch (error) {
        res.status(500);
        throw new Error("Email not sent. Please try again");
    }
}) 

//reset password
const resetPassword = asyncHandler (async (req, res) => {
    const {password} = req.body
    const {resetToken} = req.params

    //hash token then compare to token in DB
    const hashedToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex")

    //find token in DB

    const userToken = await Token.findOne({
        token: hashedToken,
        expiresAt: {$gt: Date.now()}
    })

    if (!userToken) {
        res.status(404);
        throw new Error("Invalid or Expired Token")
    }

    //find user
    const user = await User.findOne({_id: userToken.userId})
    user.password = password
    await user.save()
    res.status(200).json({
        message: "Password reset successful, please login"
    })

})

module.exports = {
    registerUser, loginUser, logoutUser, getUser, loginStatus, updateUser, changePassword, forgotPassword, resetPassword
};