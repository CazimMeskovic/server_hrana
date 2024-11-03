

// Server Configuration
/* import express from 'express';
import mysql from 'mysql2';
import bcrypt from 'bcrypt';
import bodyParser from 'body-parser';
import cors from 'cors';
import jwt from 'jsonwebtoken'; */
/* import dotenv from 'dotenv/config' */
/* import dotenv from 'dotenv'; */
/* const dotenv = require('dotenv')  */
/* 
dotenv.config(); */

/* 
const express = require('express');
const mysql = require('mysql2');
const bcrypt = require('bcrypt');
const bodyParser = require('body-parser');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');

dotenv.config();



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



// Log database connection details
console.log("Connecting to database with the following details:");
console.log(`Host: ${process.env.DB_HOST}`);
console.log(`User: ${process.env.DB_USER}`);



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
 
// Start the Server
const PORT = 5000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
 
 */
/* 
// Server Configuration
const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const bodyParser = require('body-parser');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
app.use(cors());
app.use(bodyParser.json());

const secretKey = 'your_secret_key'; // Replace with a secure value

// Connect to MongoDB


mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => {
  console.log('Connected to MongoDB');
}).catch((err) => {
  console.error('Error connecting to MongoDB:', err);
});
///
// User Schema and Model
const userSchema = new mongoose.Schema({
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, unique: true, required: true },
    password: { type: String, required: true },
});

const User = mongoose.model('User', userSchema);

/// cart mongose shema start

mongoose.connect(process.env.MONGO_URI_CART, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  }).then(() => {
    console.log('Connected to MongoDB');
  }).catch((err) => {
    console.error('Error connecting to MongoDB:', err);
  });
  ///
  // User Schema and Model
  const cartSchema = new mongoose.Schema({
      user_id: { type: Number, required: true },
      product_id: { type: Number, required: true },
      quantity: { type: Number, unique: true, required: true },
    
  });
  
  const Cart = mongoose.model('Cart', cartSchema);
  
//// end

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

// Signup Route
app.post('/api/sign_up', async (req, res) => {
    try {
        const { firstName, lastName, email, password } = req.body;

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ error: 'User already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({
            firstName,
            lastName,
            email,
            password: hashedPassword,
        });

        await newUser.save();
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
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const token = jwt.sign({ id: user._id }, secretKey, { expiresIn: '1h' });
        res.json({ message: 'Login successful', token });
    } catch (error) {
        console.error('Error during user login:', error.message);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Start the Server
const PORT = 5000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
 */

// Server Configuration
const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const bodyParser = require('body-parser');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
app.use(cors());
app.use(bodyParser.json());

const secretKey = 'your_secret_key'; // Replace with a secure value

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => {
  console.log('Connected to MongoDB');
}).catch((err) => {
  console.error('Error connecting to MongoDB:', err);
});

// User Schema and Model
const userSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true },
});

const User = mongoose.model('User', userSchema);

/*  // Cart Schema and Model
const cartSchema = new mongoose.Schema({
  user_id: { type: Number },
  product_id: { type: Number },
  quantity: { type: Number },

});

const Cart = mongoose.model('Cart', cartSchema);   */
// Cart Schema and Model


const itemSchema = new mongoose.Schema({
    proizvod_id: {
      type: String, // Promijenjeno sa Number na String
      required: true
    },
    kolicina: {
      type: Number,
      required: true
    }
  });
  
  const cartSchema = new mongoose.Schema({
    user_id: {
      type: Number,
      required: true
    },
    items: [itemSchema]
  });
  const Cart = mongoose.model('Cart', cartSchema);

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

// Signup Route
app.post('/api/sign_up', async (req, res) => {
  try {
    const { firstName, lastName, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({
      firstName,
      lastName,
      email,
      password: hashedPassword,
    });

    await newUser.save();
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
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user._id }, secretKey, { expiresIn: '1h' });
    res.json({ message: 'Login successful', token });
  } catch (error) {
    console.error('Error during user login:', error.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});
/* 
 // API endpoint to save cart data
 app.post('/api/cart',async (req, res) => {
  console.log(req.body); // Da biste videli da li server prima podatke

    ////
    try {
        const { user_id, product_id, quantity } = req.body;
    
        const existingUser = await Cart.findOne({ user_id });
        if (existingUser) {
          return res.status(400).json({ error: 'User already exists' });
        }
    
        const newUser = new Cart({
            user_id,
         
        
        });
    
        await newUser.save();
        res.status(201).json({ message: 'cart registered successfully' });
      } catch (error) {
        console.error('Error during user registration:', error.message);
        res.status(500).json({ error: 'Internal Server Error' });
      }
  });  */
 // POST /api/cart - Save cart data
 
    app.post('/api/cart',async (req, res) => {
        console.log(req.body); // Da biste videli da li server prima podatke
    const { user_id, items } = req.body;
  
    if (!user_id || !items || items.length === 0) {
      return res.status(400).json({ error: 'Invalid data' });
    }
  
    try {
      // Create and save the new cart document
      const newCart = new Cart({
        user_id,
        items
      });
  
      const savedCart = await newCart.save();
      res.status(201).json({ message: 'Cart saved successfully', cart: savedCart });
    } catch (error) {
      console.error('Error saving cart:', error);
      res.status(500).json({ error: 'Failed to save cart' });
    }
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

// Start the Server
const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
