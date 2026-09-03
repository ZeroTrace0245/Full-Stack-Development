import express from 'express'
import { body, validationResult } from 'express-validator'
import { adminMiddleware, authMiddleware } from '../middleware/auth.js'
import { mockId, mockStore, persistStore } from '../db/mockStore.js'

const router = express.Router()
router.use(authMiddleware)

const visibleTo = (notification, userId) => !notification.targetUserId || String(notification.targetUserId) === String(userId)

router.get('/', (req, res) => {
  const notifications = mockStore.notifications
    .filter(item => visibleTo(item, req.user.userId))
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 100)
  res.json({ notifications })
})

router.post('/', adminMiddleware, [
  body('title').trim().isLength({ min: 1, max: 120 }),
  body('message').trim().isLength({ min: 1, max: 1000 }),
  body('type').optional().isIn(['news', 'meeting', 'important'])
], (req, res) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() })
  const notification = {
    id: mockId(), type: req.body.type || 'news', title: req.body.title, message: req.body.message,
    meetingAt: req.body.meetingAt || null, targetUserId: null, createdBy: req.user.userId,
    createdByName: req.user.username, readBy: [], createdAt: new Date().toISOString()
  }
  mockStore.notifications.push(notification)
  persistStore()
  req.app.get('io')?.emit('notification:new', notification)
  res.status(201).json({ notification })
})

router.patch('/:id/read', (req, res) => {
  const notification = mockStore.notifications.find(item => item.id === req.params.id && visibleTo(item, req.user.userId))
  if (!notification) return res.status(404).json({ error: 'Notification not found' })
  notification.readBy ||= []
  if (!notification.readBy.includes(String(req.user.userId))) notification.readBy.push(String(req.user.userId))
  persistStore()
  res.json({ notification })
})

router.delete('/:id', adminMiddleware, (req, res) => {
  const index = mockStore.notifications.findIndex(item => item.id === req.params.id)
  if (index < 0) return res.status(404).json({ error: 'Notification not found' })
  mockStore.notifications.splice(index, 1)
  persistStore()
  res.json({ message: 'Notification deleted' })
})

export default router
