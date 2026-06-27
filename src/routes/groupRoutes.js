import express from 'express'
import protect from '../middleware/authMiddlewares.js'
import { addStudentToGroup, generateGroups, getAllGroups, getGroupById, assignProject } from '../controllers/groupController.js'


const router = express.Router()

router.post('/generate', protect, generateGroups)
router.get('/', protect, getAllGroups)
router.get('/:id', protect, getGroupById)
router.post('/:teamId/add-student', protect, addStudentToGroup)
router.patch('/:teamId/assign-project', protect, assignProject)

export default router



