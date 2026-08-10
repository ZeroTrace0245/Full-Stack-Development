import express from 'express';
import { getPool, sql } from '../config/database.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

// Get team chat messages for a project
router.get('/team/:projectId', authMiddleware, async (req, res) => {
  try {
    const { projectId } = req.params;
    const limit = req.query.limit || 50;
    const pool = await getPool();

    const result = await pool.request()
      .input('project_id', sql.Int, projectId)
      .input('limit', sql.Int, limit)
      .query(`
        SELECT TOP (@limit) m.*, u.username as sender_name
        FROM Messages m
        JOIN Users u ON m.sender_id = u.id
        WHERE m.project_id = @project_id
        ORDER BY m.created_at DESC
      `);

    res.json({ messages: result.recordset.reverse() });
  } catch (error) {
    console.error('Get team messages error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Send team chat message
router.post('/team', authMiddleware, async (req, res) => {
  try {
    const { projectId, content } = req.body;
    const pool = await getPool();

    const result = await pool.request()
      .input('sender_id', sql.Int, req.user.userId)
      .input('project_id', sql.Int, projectId)
      .input('content', sql.VarChar, content)
      .input('created_at', sql.DateTime, new Date())
      .query(`
        INSERT INTO Messages (sender_id, project_id, content, created_at)
        OUTPUT INSERTED.*
        VALUES (@sender_id, @project_id, @content, @created_at)
      `);

    res.status(201).json({ message: result.recordset[0] });
  } catch (error) {
    console.error('Send team message error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get direct messages between two users
router.get('/direct/:otherUserId', authMiddleware, async (req, res) => {
  try {
    const { otherUserId } = req.params;
    const limit = req.query.limit || 50;
    const userId = req.user.userId;
    const pool = await getPool();

    const result = await pool.request()
      .input('user_id', sql.Int, userId)
      .input('other_user_id', sql.Int, otherUserId)
      .input('limit', sql.Int, limit)
      .query(`
        SELECT TOP (@limit) dm.*, 
               sender.username as sender_name,
               receiver.username as receiver_name
        FROM DirectMessages dm
        JOIN Users sender ON dm.sender_id = sender.id
        JOIN Users receiver ON dm.receiver_id = receiver.id
        WHERE (dm.sender_id = @user_id AND dm.receiver_id = @other_user_id)
           OR (dm.sender_id = @other_user_id AND dm.receiver_id = @user_id)
        ORDER BY dm.created_at DESC
      `);

    res.json({ messages: result.recordset.reverse() });
  } catch (error) {
    console.error('Get direct messages error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Send direct message
router.post('/direct', authMiddleware, async (req, res) => {
  try {
    const { receiverId, content } = req.body;
    const senderId = req.user.userId;
    const pool = await getPool();

    const result = await pool.request()
      .input('sender_id', sql.Int, senderId)
      .input('receiver_id', sql.Int, receiverId)
      .input('content', sql.VarChar, content)
      .input('created_at', sql.DateTime, new Date())
      .query(`
        INSERT INTO DirectMessages (sender_id, receiver_id, content, created_at)
        OUTPUT INSERTED.*
        VALUES (@sender_id, @receiver_id, @content, @created_at)
      `);

    res.status(201).json({ message: result.recordset[0] });
  } catch (error) {
    console.error('Send direct message error:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
