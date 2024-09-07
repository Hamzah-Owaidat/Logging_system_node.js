const express = require('express');
const router = express.Router();
const { isAuth, authPage } = require('../middlewares/AuthMiddleware');

module.exports = () => {
    // Protected dashboard route
    router.get("/", isAuth, (req, res) => {
        res.json({ message: "Welcome to the dashboard" });
    });

    return router;
};