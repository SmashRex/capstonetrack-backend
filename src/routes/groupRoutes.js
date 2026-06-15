import express from 'express'
import protect from '../middleware/authMiddlewares.js'
import { generateGroups, getAllGroups } from '../controllers/groupController.js'


const router = express.Router()

router.post('/generate', protect, generateGroups)
router.get('/', protect, getAllGroups)

export default router



