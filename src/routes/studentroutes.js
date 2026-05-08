const express = require('express');
const router = express.Router();
const multer = require('multer');
const protect = require('../middleware/authMiddlewares');
const { studentUpload } = require('../controllers/studentController');

const upload = multer ({ 
    storage : multer.memoryStorage(),
})

router.post(
    '/upload',
    protect,
    upload.single('csvFile'),
    studentUpload
)

module.exports = router;