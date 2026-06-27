import axios from 'axios'
import User from '../models/user.js'

const githubHeaders = {
    Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
    Accept: 'application/vnd.github.v3+json'
}

const getGithubProfile = async (req , res) => {
    try {
        const {username} = req.params
        const response = await axios.get(`https://api.github.com/users/${username}`,
            {headers : githubHeaders}
        )
        res.status(200).json({
            username: response.data.login,
            name: response.data.name,
            avatarUrl: response.data.avatar_url,
            profileUrl: response.data.html_url,
            followers: response.data.followers,
            publicRepos: response.data.public_repos,
            
        })
    } catch (err) {
        if (err.response && err.response.status === 404) {
            return res.status(404).json({ message: 'GitHub user not found' });
        } 
        res.status(500).json(
            { message: 'Error fetching GitHub profile' });
    }
}

const getGithubRepos = async (req, res) => {
    try{
        const {username} = req.params
        const response = await axios.get(`https://api.github.com/users/${username}/repos?sort=updated&per_page=10`,
             {headers:githubHeaders})

             const repos = response.data.map (repo =>({
                name:repo.name,
                description: repo.description,
                language: repo.language,
                star: repo.stargazers_count,
                url:repo.html_url,
                updatedAt:repo.updated_at

             })
            )

            res.status(200).json({
                username,
                totalRepos: repos.length,
                repos
            })
    } catch (err) {
        if (err.response && err.response.status === 404) {
            return res.status(404).json({ message: 'GitHub user not found' });
        } 
        res.status(500).json(
            { message: 'Error fetching repos' });
}
}


const getGithubCommits = async (req, res) => {
    try {
        const {username, repo} = req.params
    const response = await axios.get(`https://api.github.com/repos/${username}/${repo}/commits?per_page=10`, 
        {headers:githubHeaders})

        const commits = response.data.map(commit=>({
            message: commit.commit.message,
            author:commit.commit.author.name,
            date: commit.commit.author.date,
            sha:commit.sha.substring(0,7)
        }))

        res.status(200).json({
            username,
            totalCommits:commits.length,
            commits
        })
    } catch (err) {
        if (err.response && err.response.status === 404) {
            return res.status(404).json({
                message: 'Repo not found'
            })
        }
        res.status(500).json({
            message: 'Error fetching commits'
        })
    }

    
}

const getGroupHealth = async (req, res) => {
// Get teamId from req.params 
const {teamId} = req.params
// Validate both exist
if(!teamId){
    res.status(400).json({
        message: 'No Team ID'
    })
}

// Find all TeamMembers where teamId matches
const thatTeam = await TeamMembers.findbyId()
// For each member, populate their studentId to get githubUsername
// For each student, call GitHub API to get their commits on that repo
// Calculate days since their last commit
// Flag if inactive 5+ days
// Flag if any commit has 500+ lines changed
// Calculate overall group health — green, yellow, red
// Return all members with their stats plus the group health score
}



export  { getGithubProfile,getGithubRepos,getGithubCommits, getGroupHealth }

