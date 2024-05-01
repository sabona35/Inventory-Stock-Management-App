const asyncHandler = require("express-async-handler");
const Product = require("../models/productModel");

const createProduct = asyncHandler (async (req, res) => {
    res.send("Product Created");
})

module.exports = {
    createProduct, Product
}