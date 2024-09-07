const express = require('express');
const router = express.Router();

module.exports = (authController) => {
    // Register route
    router.post("/register", authController.register);

    // Login route
    router.post("/login", authController.login);

    return router;
};