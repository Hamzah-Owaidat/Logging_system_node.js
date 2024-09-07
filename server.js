const express = require("express");
const dotenv = require("dotenv");
const mysql = require("mysql2/promise");
const AuthController = require("./controllers/AuthController");
const authRoutes = require("./routes/authRoute");
const dashboardRoutes = require("./routes/dashboardRoute");

dotenv.config();

const app = express();
const PORT = process.env.PORT;
const JWT_SECRET = process.env.SECRET_KEY;

app.use(express.json());

// Database connection
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

const authController = new AuthController(pool, JWT_SECRET);

// Use auth routes
app.use('/auth', authRoutes(authController));

app.use('/dashboard', dashboardRoutes());


// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something broke!' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});