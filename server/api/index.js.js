

// Server Configuration
import express from 'express';
import mysql from 'mysql2';
import bcrypt from 'bcrypt';
import bodyParser from 'body-parser';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import Stripe from 'stripe';/* 
const Stripe = require('stripe'); */


const stripe = Stripe('YOUR_STRIPE_SECRET_KEY'); // Replace with your actual secret key
const app = express();
app.use(cors());
app.use(bodyParser.json());

const secretKey = 'your_secret_key'; // Replace with a secure value

// Middleware to Authenticate User
const authenticateUser = (req, res, next) => {
    const token = req.headers['authorization']?.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'No token provided' });
    }

    jwt.verify(token, secretKey, (err, decoded) => {
        if (err) {
            console.error('Token verification failed:', err.message);
            return res.status(401).json({ error: 'Invalid token' });
        }
        req.userId = decoded.id;
        next();
    });
};

// MySQL Connection
const db_signup = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'signup_app',
}).promise();

db_signup.connect()
    .then(() => console.log('Connected to signup_app'))
    .catch(err => console.error('Error connecting to signup_app:', err));

 // Signup Route
app.post('/api/sign_up', async (req, res) => {
    try {
        const { firstName, lastName, email, password } = req.body;

        const [rows] = await db_signup.query('SELECT * FROM users WHERE email = ?', [email]);
        if (rows.length > 0) {
            return res.status(400).json({ error: 'User already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        await db_signup.query(
            'INSERT INTO users (first_name, last_name, email, password) VALUES (?, ?, ?, ?)',
            [firstName, lastName, email, hashedPassword]
        );

        res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
        console.error('Error during user registration:', error.message);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}); 
 


// Login Route
app.post('/api/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const [rows] = await db_signup.query('SELECT * FROM users WHERE email = ?', [email]);

        if (rows.length === 0) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const user = rows[0];
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const token = jwt.sign({ id: user.id }, secretKey, { expiresIn: '1h' });
        res.json({ message: 'Login successful', token });
    } catch (error) {
        console.error('Error during user login:', error.message);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// API endpoint to save cart data
app.post("/api/cart", (req, res) => {
  const { user_id, items } = req.body;

  // Prepare insert queries
  const queries = items.map(item => {
    return new Promise((resolve, reject) => {
      const { proizvod_id, kolicina } = item;
      const query = `INSERT INTO cart (user_id, product_id, quantity) VALUES (?, ?, ?)
                     ON DUPLICATE KEY UPDATE quantity = quantity + ?`; // Update quantity if it already exists

                     db_signup.query(query, [user_id, proizvod_id, kolicina, kolicina], (error, results) => {
        if (error) return reject(error);
        resolve(results);
      });
    });
  });

  // Execute all insert queries
  Promise.all(queries)
    .then(results => {
      res.status(201).json({ message: "Cart saved successfully!", results });
    })
    .catch(error => {
      console.error("Error saving cart:", error);
      res.status(500).json({ error: "Failed to save cart" });
    });
});

// Endpoint to create a payment intent
app.post('/create-payment-intent', async (req, res) => {
    const { amount } = req.body; // amount in cents

    try {
        const paymentIntent = await stripe.paymentIntents.create({
            amount,
            currency: 'usd', // Adjust based on your currency
            automatic_payment_methods: { enabled: true },
        });

        res.send({
            clientSecret: paymentIntent.client_secret,
        });
    } catch (error) {
        console.error('Error creating payment intent:', error);
        res.status(500).json({ error: 'Payment failed' });
    }
});
/* 
// Start the Server
const PORT = 5000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
 */

export default app;
