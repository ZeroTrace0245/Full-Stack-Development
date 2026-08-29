import express from 'express'
import Message from '../models/Message.js'
import { authMiddleware } from '../middleware/auth.js'
import { useMockData } from '../config/database.js'
import { mockId, mockStore } from '../db/mockStore.js'

const router = express.Router()
router.use(authMiddleware)
router.get('/team/:projectId', async (req, res, next) => { try { const limit = Math.min(Number(req.query.limit) || 50, 100); if (useMockData()) return res.json({ messages: mockStore.messages.filter((message) => message.kind === 'team' && message.projectId === req.params.projectId).slice(-limit) }); const messages = await Message.find({ kind: 'team', projectId: req.params.projectId }).populate('sender', 'username').sort({ createdAt: -1 }).limit(limit); res.json({ messages: messages.reverse() }) } catch (error) { next(error) } })
router.post('/team', async (req, res, next) => { try { if (useMockData()) { const message = { id: mockId(), kind: 'team', sender: req.user.userId, projectId: String(req.body.projectId), content: req.body.content, createdAt: new Date() }; mockStore.messages.push(message); return res.status(201).json({ message }) } const message = await Message.create({ kind: 'team', sender: req.user.userId, projectId: String(req.body.projectId), content: req.body.content }); res.status(201).json({ message }) } catch (error) { next(error) } })
router.get('/direct/:otherUserId', async (req, res, next) => { try { const limit = Math.min(Number(req.query.limit) || 50, 100); const a = req.user.userId, b = req.params.otherUserId; if (useMockData()) return res.json({ messages: mockStore.messages.filter((message) => message.kind === 'direct' && ((message.sender === a && message.receiver === b) || (message.sender === b && message.receiver === a))).slice(-limit) }); const messages = await Message.find({ kind: 'direct', $or: [{ sender: a, receiver: b }, { sender: b, receiver: a }] }).populate('sender receiver', 'username').sort({ createdAt: -1 }).limit(limit); res.json({ messages: messages.reverse() }) } catch (error) { next(error) } })
router.post('/direct', async (req, res, next) => { try { if (useMockData()) { const message = { id: mockId(), kind: 'direct', sender: req.user.userId, receiver: req.body.receiverId, content: req.body.content, createdAt: new Date() }; mockStore.messages.push(message); return res.status(201).json({ message }) } const message = await Message.create({ kind: 'direct', sender: req.user.userId, receiver: req.body.receiverId, content: req.body.content }); res.status(201).json({ message }) } catch (error) { next(error) } })

export default router
