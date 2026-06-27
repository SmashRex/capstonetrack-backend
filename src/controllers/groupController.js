import Student from "../models/student.js"
import Team from "../models/team.js"
import TeamMember from "../models/teamMember.js"
import { sendGroupEmail, sleep } from "../utils/emailSystem.js"

// ── Fisher-Yates Shuffle ──────────────────
function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[array[i], array[j]] = [array[j], array[i]]
  }
  return array
}

// ── Generate Groups ───────────────────────
const generateGroups = async (req, res) => {
  const { cohort, composition } = req.body;
  if (!cohort || !composition) {
    return res.status(400).json({ message: 'Provide composition and cohort' });
  }

  try {
    // Prevent duplicate generation for cohort
    const existing = await Team.findOne({ cohort });
    if (existing) {
      return res.status(400).json({ message: 'Groups already generated for this cohort' });
    }

    // Load and shuffle students per track, compute groupsPossible per track
    const studentsByTrack = {};
    const groupsPossibleByTrack = {};

    for (const [track, count] of Object.entries(composition)) {
      const students = await Student.find({ track, cohort, qualified: true }).lean();
      studentsByTrack[track] = shuffleArray(students);
      groupsPossibleByTrack[track] = Math.floor(studentsByTrack[track].length / count);
    }

    // Determine numberOfGroups as the minimum across tracks
    const numberOfGroups = Math.min(...Object.values(groupsPossibleByTrack));
    if (!numberOfGroups || numberOfGroups === 0 || !isFinite(numberOfGroups)) {
      return res.status(400).json({ message: 'Not enough students to form groups' });
    }

    // Create groups and team members
    const createdGroups = [];

    for (let i = 0; i < numberOfGroups; i++) {
      const newTeam = await Team.create({
        name: `Group ${i + 1}`,
        cohort
      });

      const members = [];

      // For each track, assign composition[track] students to this group
      for (const [track, count] of Object.entries(composition)) {
        const startIndex = i * count;
        const assignedSlice = studentsByTrack[track].slice(startIndex, startIndex + count);

        if (assignedSlice.length < count) {
          // Unexpected shortage; ideally rollback if using transactions
          return res.status(500).json({ message: 'Unexpected shortage of students while assigning groups' });
        }

        // Create TeamMember for each student in the slice
        for (const student of assignedSlice) {
          await TeamMember.create({
            teamId: newTeam._id,
            studentId: student._id,
            name: student.name,
            track: student.track
          });

          members.push({
            name: student.name,
            email: student.email,
            track: student.track,
            githubUsername: student.githubUsername
          });
        }
      }

      createdGroups.push({
        groupName: newTeam.name,
        teamId: newTeam._id,
        members
      });
    }

    // Collect unassigned students (leftovers) per track
    const unassignedStudents = [];
    for (const [track, count] of Object.entries(composition)) {
      const assignedCount = numberOfGroups * count;
      const leftovers = studentsByTrack[track].slice(assignedCount);
      for (const student of leftovers) {
        unassignedStudents.push({
          name: student.name,
          email: student.email,
          track: student.track,
          githubUsername: student.githubUsername
        });
      }
    }


    for (const group of createdGroups) {
  for (const member of group.members) {
    const teammates = group.members.filter(m => m.email !== member.email)
    // call sendGroupEmail here
    await sendGroupEmail(member.name, member.email, group.groupName,teammates, 'https://github.com/capstonetrack')

    await sleep(300)
  }
}

    return res.status(201).json({
      message: 'Groups generated successfully',
      totalGroups: createdGroups.length,
      groups: createdGroups,
      unassignedCount: unassignedStudents.length,
      unassigned: unassignedStudents
    });
  } catch (err) {
    console.error('Group generation error:', err);
    return res.status(500).json({ message: 'Error generating groups' });
  }
};


// ── Get All Groups ────────────────────────
const getAllGroups = async (req, res) => {
  try {
    const { cohort } = req.query; // optional filter

    // If cohort is provided, filter teams by cohort
    const query = cohort ? { cohort } : {};
    const teams = await Team.find(query);

    const groups = await Promise.all(
      teams.map(async (team) => {
        const members = await TeamMember.find({ teamId: team._id })
          .populate('studentId', 'name email track githubUsername');

        return {
          groupName: team.name,
          teamId: team._id,
          cohort: team.cohort, // include cohort for clarity
          members: members.map(m => ({
            name: m.studentId.name,
            email: m.studentId.email,
            track: m.track,
            githubUsername: m.studentId.githubUsername
          }))
        };
      })
    );

    res.status(200).json({
      message: 'Groups fetched successfully',
      totalGroups: groups.length,
      groups,
      unassignedCount: 0,   // consistent shape with generateGroups
      unassigned: []
    });

  } catch (err) {
    console.error('Get groups error:', err);
    res.status(500).json({ message: 'Error fetching groups' });
  }
};

// ── Get Single Group ──────────────────────
const getGroupById = async (req, res) => {
  try {
    const { id } = req.params;

    // Find the team by ID
    const team = await Team.findById(id);
    if (!team) {
      return res.status(404).json({ message: 'Group not found' });
    }

    // Fetch members of this team
    const members = await TeamMember.find({ teamId: team._id })
      .populate('studentId', 'name email track githubUsername');

    const group = {
      groupName: team.name,
      teamId: team._id,
      cohort: team.cohort,
      members: members.map(m => ({
        name: m.studentId.name,
        email: m.studentId.email,
        track: m.track,
        githubUsername: m.studentId.githubUsername
      }))
    };

    res.status(200).json({
      message: 'Group fetched successfully',
      totalGroups: 1,
      groups: [group],
      unassignedCount: 0,   // consistent shape
      unassigned: []
    });

  } catch (err) {
    console.error('Get group error:', err);
    res.status(500).json({ message: 'Error fetching group' });
  }
};


// ── Add Students to group maually ──────────────────────
const addStudentToGroup = async (req, res) => {
  const {teamId} = req.params

  const {studentId} = req.body

  

  try{

  const teamIdExists = await Team.findById(teamId)
   if(!teamIdExists){
    return res.status(404).json({
      message: 'Group not found'
    })
  }

  const studentIdExists = await Student.findById(studentId)
    if(!studentIdExists){
    return res.status(404).json({
      message: 'Student not Found'
    })
  }
  const studentAlreadyInAGroup = await TeamMember.findOne({studentId})
    if(studentAlreadyInAGroup){
      return res.status(400).json({
        message:'Student Already in a Group'
      })
    }

    await TeamMember.create({
            teamId,
            studentId,
            name: studentIdExists.name,
            track: studentIdExists.track
          });

          return res.status(201).json({
            message: `${studentIdExists.name} has been Added to ${teamIdExists.name} Successfully`,
            groupName : teamIdExists.name,
            studentName: studentIdExists.name
          })
        } catch(err){
          return res.status(500).json({
            message: 'Error adding student'
          })
        }
  
}


export {generateGroups, getAllGroups, getGroupById, addStudentToGroup}