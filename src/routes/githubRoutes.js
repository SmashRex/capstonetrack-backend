import express from 'express'
import { getGithubCommits, getGithubRepos, getGithubProfile } from '../controllers/githubControllers.js'
import protect from '../middleware/authMiddlewares.js'


const router = express.Router()

router.get('/user/:username', protect, getGithubProfile)
router.get('/user/:username/repos', protect, getGithubRepos)
router.get('/user/:username/repos/:repo/commits', protect, getGithubCommits)

export default router
