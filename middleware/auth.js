const jwt = require("jsonwebtoken");
const User = require("../models/User.model");
const utils = require("../utils/utils")
const auth = async (req, res, next) => {
    try {
        const token = req.header("Authorization").replace("Bearer ", "");
        const decoded = utils.jwtDecode(token);
        const user = await User.findOne({ _id: decoded.userId });
        if (!user) {
            throw new Error("User Verification failed");
        }
        req.currUser = user;
        next();
    } catch (e) {
        res.status(401).send({ error: "Please authenticate request." });
    }
};
module.exports = auth;