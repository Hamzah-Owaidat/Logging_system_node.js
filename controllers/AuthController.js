const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

class AuthController {
    constructor(pool, JWT_SECRET) {
        this.pool = pool;
        this.JWT_SECRET = JWT_SECRET;
    }

    register = async (req, res) => {
        let { first_name, last_name, email, password } = req.body;
        const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    
        // Validate required fields
        if (!first_name || !last_name || !email || !password) {
            return res.status(400).json({ error: "All fields are required" });
        }
    
        // Validate email format
        if (!emailPattern.test(email)) {
            return res.status(400).json({ error: 'Invalid email format' });
        }
    
        // Validate password length
        if (password.length < 8) {
            return res.status(400).json({ error: "Password must be at least 8 characters" });
        }
    
        // Capitalize first letter of first and last name
        first_name = first_name.charAt(0).toUpperCase() + first_name.slice(1).toLowerCase();
        last_name = last_name.charAt(0).toUpperCase() + last_name.slice(1).toLowerCase();
    
        try {
            // Check if the email already exists
            const [existingUser] = await this.pool.execute('SELECT email FROM users WHERE email = ?', [email]);
            if (existingUser.length > 0) {
                return res.status(409).json({ error: "Email already exists" });
            }
    
            const hashedPassword = await bcrypt.hash(password, 10);
    
            // Insert new user if the email is unique
            const [rows] = await this.pool.execute(
                'INSERT INTO users(first_name, last_name, email, password, status) VALUES(?, ?, ?, ?, ?)',
                [first_name, last_name, email, hashedPassword, 'inactive']
            );
    
            // Respond with success message
            res.status(201).json({ message: "User registered successfully", userId: rows.insertId });
    
        } catch (error) {
            console.error("Database error:", error);
            res.status(500).json({ error: "Internal server error" });
        }
    };

    login = async (req, res) => {
        const { email, password } = req.body;

        // Check if email and password are provided
        if (!email || !password) {
            return res.status(400).json({ error: "Email and password are required" });
        }

        try {
            // Query the user by email
            const [rows] = await this.pool.execute(
                'SELECT * FROM users WHERE email = ?',
                [email]
            );

            // Check if the user exists
            if (rows.length === 0) {
                return res.status(401).json({ error: "Invalid credentials" });
            }

            const user = rows[0];

            // Check if the user is inactive
            if (user.status === 'inactive') {
                return res.status(403).json({ error: "Wait until the superadmin accepts your request" });
            }

            // Compare the hashed password
            const passwordMatch = await bcrypt.compare(password, user.password);
            if (!passwordMatch) {
                return res.status(401).json({ error: "Invalid credentials" });
            }

            // Generate a JWT token for the user
            const token = jwt.sign({ id: user.id, role: user.role }, this.JWT_SECRET, { expiresIn: '1h' });
            res.json({ token });

        } catch (error) {
            console.error("Database error:", error);
            res.status(500).json({ error: "Internal server error" });
        }
    }
}

module.exports = AuthController;