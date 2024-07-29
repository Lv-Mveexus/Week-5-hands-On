const express = require('express');
const app = express();
const mysql = require('mysql2');
const cors = require('cors');
const bcrypt = require('bcrypt');
const dotenv = require('dotenv');

app.use(express.json());
app.use(cors());
dotenv.config();

// Connect to MySQL database
const db = mysql.createConnection({
	host: process.env.DB_HOST,
	user: process.env.DB_USER,
	password: process.env.DB_PASSWORD,
});

// Check if connection is established
db.connect((err) => {
	if (err) return console.log('Error connecting to MySQL');

	console.log('Connected to MySQL as id: ', db.threadId);

	// Create a database
	db.query('CREATE DATABASE IF NOT EXISTS expense_tracker', (err, result) => {
		if (err) return console.log(err);

		console.log('Database created/checked');

		// Change database
		db.changeUser({ database: 'expense_tracker' }, (err, result) => {
			if (err) return console.log(err);

			console.log('Changed use to expense_tracker');

			// Create users table
			const usersTable = `
            CREATE TABLE IF NOT EXISTS users (
               id INT AUTO_INCREMENT PRIMARY KEY,
               email VARCHAR(100) NOT NULL UNIQUE,
               username VARCHAR(50) NOT NULL,
               password VARCHAR(255)
            )
         `;

			db.query(usersTable, (err, result) => {
				if (err) return console.log(err);

				console.log('Users table created/checked');
			});
		});
	});
});

// User registration route
app.post('/api/users/register', async (req, res) => {
	try {
		const users = `SELECT * FROM users WHERE email = ?`;
		// CHeck if user is already registered
		db.query(users, [req.body.email], (err, data) => {
			if (data.length > 0)
				return res.status(409).json('User already registered');

			// Hashing of the password
			const salt = bcrypt.genSaltSync(10);
			const hashedPassword = bcrypt.hashSync(req.body.password, salt);

			const newUser = `INSERT INTO users (email, username, password) VALUES (?)`;
			value = [req.body.email, re.body.username, hashedPassword];

			db.query(newUser, [value], (err, data) => {
				if (err) res.status(400).json('Something went wrong');

				return res.status(200).json('User registration successful');
			});
		});
	} catch (err) {
		res.status(500).json('Internal Server Error');
	}
});

// User login route
app.post('/api/users/login', async (req, res) => {
	try {
		const users = `SELECT * FROM users WHERE email = ?`;
		db.query(users, [req.body.email], (err, data) => {
			if (data.length === 0) return res.status(404).json('User not found');

			const passwordVeri = bcrypt.compareSync(
				req.body.password,
				data[0].password
			);

			if (!passwordVeri)
				return res.status(400).json('Invalid email or password!');

			return res.status(200).json('login successful');
		});
	} catch (err) {
		res.status(500).json('Internal Server Error');
	}
});

app.listen(3000, () => {
	console.log('server is running on PORT 3000...');
});
