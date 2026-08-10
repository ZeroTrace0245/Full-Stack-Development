import express from 'express';
import bcryptjs from 'bcryptjs';
import { getPool, sql } from '../config/database.js';
import { authMiddleware, generateToken } from '../middleware/auth.js';
import { body, validationResult } from 'express-validator';

const router = express.Router();

// Validation middleware
const validateRegister = [
  body('username').notEmpty().trim().escape(),
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 })
];

const validateLogin = [
  body('username').notEmpty().trim(),
  body('password').notEmpty()
];

// Register
router.post('/register', validateRegister, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { username, email, password } = req.body;
    const pool = await getPool();

    // Check if user exists
    const existingUser = await pool.request()
      .input('username', sql.VarChar, username)
      .query('SELECT id FROM Users WHERE username = @username');

    if (existingUser.recordset.length > 0) {
      return res.status(409).json({ error: 'Username already exists' });
    }

    // Hash password
    const hashedPassword = await bcryptjs.hash(password, 10);

    // Create user
    const result = await pool.request()
      .input('username', sql.VarChar, username)
      .input('email', sql.VarChar, email)
      .input('password_hash', sql.VarChar, hashedPassword)
      .input('role', sql.VarChar, 'Standard User')
      .input('created_at', sql.DateTime, new Date())
      .query(`
        INSERT INTO Users (username, email, password_hash, role, created_at)
        OUTPUT INSERTED.id
        VALUES (@username, @email, @password_hash, @role, @created_at)
      `);

    const userId = result.recordset[0].id;
    const token = generateToken(userId, username, 'Standard User');

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: { id: userId, username, email, role: 'Standard User' }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Login
router.post('/login', validateLogin, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { username, password } = req.body;
    const pool = await getPool();

    // Find user
    const result = await pool.request()
      .input('username', sql.VarChar, username)
      .query('SELECT id, username, email, password_hash, role FROM Users WHERE username = @username');

    if (result.recordset.length === 0) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    const user = result.recordset[0];

    // Verify password
    const validPassword = await bcryptjs.compare(password, user.password_hash);
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    // Generate token
    const token = generateToken(user.id, user.username, user.role);

    res.json({
      message: 'Login successful',
      token,
      user: { id: user.id, username: user.username, email: user.email, role: user.role }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get current user
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const pool = await getPool();

    const result = await pool.request()
      .input('id', sql.Int, req.user.userId)
      .query('SELECT id, username, email, role, created_at FROM Users WHERE id = @id');

    if (result.recordset.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ user: result.recordset[0] });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get all users
router.get('/users', authMiddleware, async (req, res) => {
  try {
    const pool = await getPool();

    const result = await pool.request()
      .query('SELECT id, username, email, role, created_at FROM Users');

    res.json({ users: result.recordset });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
