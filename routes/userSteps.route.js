const router = require("express").Router();
const UserSteps = require("../controllers/userSteps.controller.js");

router
    .route("/user/:id")
    .post(UserSteps.updateUserSuggestion)

router
    .route("/group/:id")
    .post(UserSteps.updateGroupSuggestion)

module.exports = router