import express from 'express'
import multer from 'multer'
import protect from '../middleware/authMiddlewares.js'
import { studentUpload, getTrackCounts } from '../controllers/studentController.js'

const router = express.Router()
const upload = multer({
    storage: multer.memoryStorage(),
})


router.post(
    '/upload',
    protect,
    upload.single('csvFile'),
    studentUpload
)
router.get(
    '/tracks',
    protect,
    getTrackCounts
)

export default router;