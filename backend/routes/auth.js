import express from 'express'
import bcryptjs from 'bcryptjs'
import { body, validationResult } from 'express-validator'
import User from '../models/User.js'
import Task from '../models/Task.js'
import { authMiddleware, adminMiddleware, generateToken } from '../middleware/auth.js'
import { isMockData as useMockData } from '../config/database.js'
import { mockId, mockStore, persistStore } from '../db/mockStore.js'

const router = express.Router()
const validate = (req, res, next) => { const errors = validationResult(req); if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() }); next() }

router.post('/register', [body('username').trim().notEmpty(), body('email').isEmail().normalizeEmail(), body('password').isLength({ min: 6 }), validate], async (req, res, next) => {
  try {
    const { username, email, password } = req.body
    if (useMockData()) {
      const existing = mockStore.users.find((user) => user.username === username || user.email === email)
      if (existing) return res.status(409).json({ error: existing.email === email ? 'Email address already exists' : 'Username already exists' })
      const user = { id: mockId(), username, email, role: 'Standard User', passwordHash: await bcryptjs.hash(password, 10), createdAt: new Date() }
      mockStore.users.push(user)
      persistStore()
      const { passwordHash: _passwordHash, ...safeUser } = user
      return res.status(201).json({ message: 'User registered successfully', token: generateToken(user.id, user.username, user.role), user: safeUser })
    }
    const existing = await User.findOne({ $or: [{ username }, { email }] })
    if (existing) return res.status(409).json({ error: existing.email === email ? 'Email address already exists' : 'Username already exists' })
    const user = await User.create({ username, email, passwordHash: await bcryptjs.hash(password, 10) })
    res.status(201).json({ message: 'User registered successfully', token: generateToken(user.id, user.username, user.role), user })
  } catch (error) { next(error) }
})

router.post('/login', [body('identifier').trim().notEmpty(), body('password').notEmpty(), validate], async (req, res, next) => {
  try {
    const { identifier, password } = req.body
    if (useMockData()) {
      const user = mockStore.users.find((item) => item.username === identifier || item.email === identifier.toLowerCase())
      if (!user || !(await bcryptjs.compare(password, user.passwordHash))) return res.status(401).json({ error: 'Invalid username or password' })
      user.lastLogin = new Date()
      persistStore()
      const { passwordHash: _passwordHash, ...safeUser } = user
      return res.json({ message: 'Login successful', token: generateToken(user.id, user.username, user.role), user: safeUser })
    }
    const user = await User.findOne({ $or: [{ username: identifier }, { email: identifier.toLowerCase() }] }).select('+passwordHash')
    if (!user || !(await bcryptjs.compare(password, user.passwordHash))) return res.status(401).json({ error: 'Invalid username or password' })
    user.lastLogin = new Date(); await user.save()
    res.json({ message: 'Login successful', token: generateToken(user.id, user.username, user.role), user })
  } catch (error) { next(error) }
})

router.get('/me', authMiddleware, async (req, res, next) => { try { if (useMockData()) { const user = mockStore.users.find((item) => item.id === req.user.userId); if (!user) return res.status(404).json({ error: 'User not found' }); const { passwordHash: _passwordHash, ...safeUser } = user; return res.json({ user: safeUser }) } const user = await User.findById(req.user.userId); if (!user) return res.status(404).json({ error: 'User not found' }); res.json({ user }) } catch (error) { next(error) } })
router.get('/users', authMiddleware, async (_req, res, next) => { try { if (useMockData()) return res.json({ users: mockStore.users.map(({ passwordHash: _passwordHash, ...user }) => user) }); res.json({ users: await User.find().sort({ username: 1 }) }) } catch (error) { next(error) } })

router.patch('/users/:id/role', authMiddleware, adminMiddleware, [body('role').isIn(['Admin', 'Standard User']), validate], async (req, res, next) => {
  try {
    if (req.params.id === req.user.userId) return res.status(400).json({ error: 'You cannot change your own administrator role' })
    if (useMockData()) {
      const user = mockStore.users.find(item => item.id === req.params.id)
      if (!user) return res.status(404).json({ error: 'User not found' })
      user.role = req.body.role
      persistStore()
      const { passwordHash: _passwordHash, ...safeUser } = user
      return res.json({ message: 'User role updated', user: safeUser })
    }
    const user = await User.findByIdAndUpdate(req.params.id, { role: req.body.role }, { new: true, runValidators: true })
    if (!user) return res.status(404).json({ error: 'User not found' })
    res.json({ message: 'User role updated', user })
  } catch (error) { next(error) }
})

router.post('/users', authMiddleware, adminMiddleware, [body('username').trim().notEmpty(), body('email').isEmail().normalizeEmail(), body('password').isLength({ min: 6 }), body('role').isIn(['Admin', 'Standard User']), validate], async (req, res, next) => { try { const { username, email, password, role } = req.body; if (useMockData()) { if (mockStore.users.some(user => user.username === username || user.email === email)) return res.status(409).json({ error: 'Username or email already exists' }); const user = { id: mockId(), username, email, role, passwordHash: await bcryptjs.hash(password, 10), createdAt: new Date() }; mockStore.users.push(user); persistStore(); const { passwordHash: _passwordHash, ...safeUser } = user; return res.status(201).json({ user: safeUser }) } const exists = await User.findOne({ $or: [{ username }, { email }] }); if (exists) return res.status(409).json({ error: 'Username or email already exists' }); const user = await User.create({ username, email, role, passwordHash: await bcryptjs.hash(password, 10) }); res.status(201).json({ user }) } catch (error) { next(error) } })

router.put('/users/:id', authMiddleware, adminMiddleware, [body('username').trim().notEmpty(), body('email').isEmail().normalizeEmail(), body('role').isIn(['Admin', 'Standard User']), validate], async (req, res, next) => { try { const updates = { username: req.body.username, email: req.body.email, role: req.body.role }; if (req.body.password) { if (req.body.password.length < 6) return res.status(400).json({ error: 'Password must contain at least 6 characters' }); updates.passwordHash = await bcryptjs.hash(req.body.password, 10) } if (useMockData()) { const user = mockStore.users.find(item => item.id === req.params.id); if (!user) return res.status(404).json({ error: 'User not found' }); Object.assign(user, updates); persistStore(); const { passwordHash: _passwordHash, ...safeUser } = user; return res.json({ user: safeUser }) } const user = await User.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true }); if (!user) return res.status(404).json({ error: 'User not found' }); res.json({ user }) } catch (error) { next(error) } })

router.delete('/users/:id', authMiddleware, adminMiddleware, async (req, res, next) => { try { if (req.params.id === req.user.userId) return res.status(400).json({ error: 'You cannot delete your own administrator account' }); if (useMockData()) { const index = mockStore.users.findIndex(item => item.id === req.params.id); if (index < 0) return res.status(404).json({ error: 'User not found' }); const [user] = mockStore.users.splice(index, 1); mockStore.tasks.forEach(task => { if (task.assignedUserId === user.id) { task.assignedUserId = null; task.assignmentLocked = false } }); persistStore(); return res.json({ message: 'User deleted' }) } const user = await User.findByIdAndDelete(req.params.id); if (!user) return res.status(404).json({ error: 'User not found' }); await Task.updateMany({ assignedUserId: user._id }, { assignedUserId: null, assignmentLocked: false }); res.json({ message: 'User deleted' }) } catch (error) { next(error) } })

export default router
