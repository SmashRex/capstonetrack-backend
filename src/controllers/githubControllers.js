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
const members = await TeamMember.find({ teamId: teamDetails._id }).populate('studentId', 'githubUsername')
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



export  { getGithubProfile,getGithubRepos,getGithubCommits, getGroupHealth, gitRepoCreation }

