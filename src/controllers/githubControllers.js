import axios from 'axios'
import User from '../models/user.js'
import Team from '../models/team.js'
import TeamMember from '../models/teamMember.js'

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


const gitRepoCreation = async (req,res) => {
// Get teamId from req.params
const {teamId} = req.params
// Find the Team document to get project and cohort
try{
if(!teamId){
    return res.status(400).json({
        message: 'Team Id Needed'
    })
}
const teamDetails = await Team.findById(teamId)
if(!teamDetails){
    return res.status(400).json({
        message: 'Team not Found'
    })
}
// Check that team.project exists — can't create a repo with no name
if(!teamDetails.project){
    return res.status(400).json({
        message: 'project name needs to be provided'
    })
}

const createRepo = await axios.post(
  `https://api.github.com/orgs/${process.env.GITHUB_ORG}/repos`,
  { name: teamDetails.project, private: false, auto_init: true },
  { headers: githubHeaders }
)
// Get all TeamMembers for this team → populate studentId to get githubUsername
const members = await TeamMember.find({ teamId: teamDetails._id }).populate('studentId', 'name githubUsername')
// For each member, call GitHub API to add them as collaborator
   for (const member of members) {
  const username = member.studentId.githubUsername;
  if(!username) continue;
  try {
    await axios.put(
      `https://api.github.com/repos/${process.env.GITHUB_ORG}/${teamDetails.project}/collaborators/${username}`,
      {},
      { headers: githubHeaders }
    )
  } catch(collaboratorErr) {
    console.warn(`Could not add ${username} as collaborator:`, collaboratorErr.response?.data?.message)
  }
}
// Store the repo URL on the Team document → team.repoUrl
 const gitrepoURL = await Team.findByIdAndUpdate(teamId, {repoUrl: createRepo.data.html_url }, {new: true})
 

// Return 201 with repo URL and collaborators added
return res.status(201).json({
    message: 'Add Collaborators',
    repoURL: gitrepoURL.repoUrl,
    collaborators: members.map(m => m.studentId.githubUsername)
})

} catch(err){
    console.error('Repo creation error:', err.response?.data || err.message)
    return res.status(500).json({
        message: 'Error Creating Repo'
    })
}
}



const getGroupHealth = async (req, res) => {
// Get teamId from req.params
const {teamId} = req.params

try{
// Find the team — get project for the repo name
const team = await Team.findById(teamId)
if(!team) return res.status(404).json({ 
    message: 'Team not found' 
})

// Check team.project exists — 400 if not
if(!team.project){
    return res.status(400).json({
        message:'project shouldnt be empty or null'
    })
}
// Get all members with githubUsername
const members = await TeamMember.find({ teamId: team._id }).populate('studentId', 'name githubUsername')

// For each member, call GitHub API to get commits on that repo
const memberStats = []

for(const member of members){
    const username = member.studentId.githubUsername;
  if(!username) continue;

try{
    const response = await axios.get(`https://api.github.com/repos/${process.env.GITHUB_ORG}/${team.project}/commits?per_page=10`, 
        {headers:githubHeaders})

    const commits = response.data.map(commit=>({
            message: commit.commit.message,
            author:commit.commit.author.name,
            date: commit.commit.author.date,
            sha:commit.sha.substring(0,7)
        }))

        // Calculate days since last commit
const lastCommitDate = new Date(commits[0].date)
const today = new Date()
const diffInMs = today - lastCommitDate
const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24))
// Flag inactive if 5+ days
const inactive = diffInDays > 5

    memberStats.push({
      name: member.studentId.name,
      username,
      lastCommitDaysAgo: diffInDays,
      inactive,
      commits
    })
  } catch(err) {
    // handle member with no commits or invalid username
    memberStats.push({
      name: member.studentId.name,
      username,
      lastCommitDaysAgo: null,
      inactive: true,
      commits: []
    })
  }

}

// Calculate health score
const inactiveCount = memberStats.filter(m => m.inactive).length
const totalMembers = memberStats.length

let healthScore
if (inactiveCount === 0) {
  healthScore = 'green'
} else if (inactiveCount > totalMembers / 2) {
  healthScore = 'red'
} else {
  healthScore = 'yellow'
}
// Return results
return res.status(200).json({
    message: 'Health score retrieved',
    healthScore,
    totalMembers,
    inactiveCount,
    members: memberStats
})

}catch(err){
    return res.status(500).json({
        message: 'Error getting Group Health'
    })
}

}


export  { getGithubProfile,getGithubRepos,getGithubCommits, getGroupHealth, gitRepoCreation }

