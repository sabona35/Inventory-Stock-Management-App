const express = require("express");
const router = express.Router();
const protect = require("../middleWare/authMiddleware");
const { ContactUs } = require("../controllers/contactController");

router.post("/", protect, ContactUs);

module.exports = router;