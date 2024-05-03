const dotenv = require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");
const UserRoute = require("./routes/UserRoute");
const ProductRoute = require("./routes/ProductRoute");
const contactRoute = require("./routes/contactRoute")
const errorHandler = require("./middleWare/errorMiddleware");
const cookieParser = require("cookie-parser");
const path = require("path")


const app = express();

//MiddleWare
app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(cors());

app.use("/uploads", express.static(path.join(__dirname, "uploads")))

//Routes Middleware
app.use("/api/users", UserRoute);
app.use("/api/products", ProductRoute);
app.use("/api/contactus", contactRoute);

//Routes
app.get("/", (req, res) => {
    res.send("Home Page");
})

//Error Middleware
app.use(errorHandler);


//Connect to mongoDB & start server
const PORT = process.env.PORT || 5000;
mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`)
        })
    })
    .catch((err) => console.log(err))