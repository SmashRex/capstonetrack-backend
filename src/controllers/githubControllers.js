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


export  { getGithubProfile,getGithubRepos,getGithubCommits }