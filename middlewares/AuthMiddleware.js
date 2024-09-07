const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
dotenv.config();

const JWT_SECRET = process.env.SECRET_KEY;

// Middleware to check if the user is authenticated

const isAuth = (req, res, next) => {
    const authHeader = req.headers['authorization'];

    if (authHeader) {
        const token = authHeader.split(' ')[1];

        if (token) {
            jwt.verify(token, JWT_SECRET, (err, user) => {
                if (err) {
                    console.error("Token verification failed:", err);
                    return res.status(401).json("Invalid token!");
                }
                req.user = user;
                next();
            });
        } else {
            return res.status(401).json("No token provided!");
        }
    } else {
        return res.status(401).json("No authorization header provided!");
    }
};


// Middleware to check user permissions
const authPage = (permissions) => {
    return (req, res, next) => {
        if (req.user) {
            const userRole = req.user.role;
            if (permissions.includes(userRole)) {
                next();
            } else {
                return res.status(403).json("You don't have permission!");
            }
        } else {
            return res.status(401).json("User not authenticated!");
        }
    }
};

module.exports = { isAuth, authPage };
