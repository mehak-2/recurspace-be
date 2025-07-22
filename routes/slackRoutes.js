import express from 'express'
import { handleSlackEvent } from '../controllers/slackController.js'

const router = express.Router()
router.post('/events', handleSlackEvent)

export default router 