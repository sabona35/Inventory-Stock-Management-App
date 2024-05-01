const mongoose = require("mongoose");

const productSchema = mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "User",
    },
    name: {
        type: String,
        requried: [true, "Please add a name"],
        trim: true
    },
    sku: {
        type: String,
        requried: true,
        default: "SKU",
        trim: true
    },
    category: {
        type: String,
        requried: [true, "Please add a category"],
        trim: true
    },
    quantity: {
        type: String,
        requried: [true, "Please add a quantity"],
        trim: true
    },
    price: {
        type: String,
        requried: [true, "Please set a price"],
        trim: true
    },
    description: {
        type: String,
        requried: [true, "Please add a description"],
        trim: true
    },
    image: {
        type: Object,
        default: {},
    }
    
}, {
    timestamp: true,
})

const Product = mongoose.model("Product", productSchema)
module.exports = Product;