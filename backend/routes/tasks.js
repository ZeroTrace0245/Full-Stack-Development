import express from 'express';
import { getPool, sql } from '../config/database.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

// Get all tasks for a board
router.get('/board/:boardId', authMiddleware, async (req, res) => {
  try {
    const { boardId } = req.params;
    const pool = await getPool();

    const result = await pool.request()
      .input('boardId', sql.Int, boardId)
      .query(`
        SELECT t.*, u.username as assigneeName
        FROM Tasks t
        LEFT JOIN Users u ON t.assignee_id = u.id
        WHERE t.board_id = @boardId
        ORDER BY t.column_id, t.task_order
      `);

    res.json({ tasks: result.recordset });
  } catch (error) {
    console.error('Get tasks error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Create task
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { title, description, boardId, columnId, assigneeId, priority, type, dueDate, estimate } = req.body;
    const pool = await getPool();

    const result = await pool.request()
      .input('title', sql.VarChar, title)
      .input('description', sql.VarChar, description || '')
      .input('board_id', sql.Int, boardId)
      .input('column_id', sql.Int, columnId)
      .input('assignee_id', sql.Int, assigneeId || null)
      .input('priority', sql.VarChar, priority || 'Medium')
      .input('type', sql.VarChar, type || 'Feature')
      .input('due_date', sql.Date, dueDate || null)
      .input('estimate', sql.Int, estimate || 0)
      .input('created_by', sql.Int, req.user.userId)
      .input('created_at', sql.DateTime, new Date())
      .query(`
        INSERT INTO Tasks (title, description, board_id, column_id, assignee_id, priority, type, due_date, estimate, created_by, created_at)
        OUTPUT INSERTED.*
        VALUES (@title, @description, @board_id, @column_id, @assignee_id, @priority, @type, @due_date, @estimate, @created_by, @created_at)
      `);

    res.status(201).json({ task: result.recordset[0] });
  } catch (error) {
    console.error('Create task error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Update task
router.put('/:taskId', authMiddleware, async (req, res) => {
  try {
    const { taskId } = req.params;
    const { title, description, columnId, assigneeId, priority, type, dueDate, estimate } = req.body;
    const pool = await getPool();

    const result = await pool.request()
      .input('id', sql.Int, taskId)
      .input('title', sql.VarChar, title)
      .input('description', sql.VarChar, description || '')
      .input('column_id', sql.Int, columnId)
      .input('assignee_id', sql.Int, assigneeId || null)
      .input('priority', sql.VarChar, priority)
      .input('type', sql.VarChar, type)
      .input('due_date', sql.Date, dueDate || null)
      .input('estimate', sql.Int, estimate)
      .input('updated_at', sql.DateTime, new Date())
      .query(`
        UPDATE Tasks
        SET title = @title, description = @description, column_id = @column_id,
            assignee_id = @assignee_id, priority = @priority, type = @type,
            due_date = @due_date, estimate = @estimate, updated_at = @updated_at
        WHERE id = @id
        SELECT * FROM Tasks WHERE id = @id
      `);

    if (result.recordset.length === 0) {
      return res.status(404).json({ error: 'Task not found' });
    }

    res.json({ task: result.recordset[0] });
  } catch (error) {
    console.error('Update task error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Delete task
router.delete('/:taskId', authMiddleware, async (req, res) => {
  try {
    const { taskId } = req.params;
    const pool = await getPool();

    const result = await pool.request()
      .input('id', sql.Int, taskId)
      .query('DELETE FROM Tasks WHERE id = @id');

    res.json({ message: 'Task deleted successfully', deletedCount: result.rowsAffected[0] });
  } catch (error) {
    console.error('Delete task error:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
