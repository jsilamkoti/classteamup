import { TeamFormationRule } from "./teamRules"

interface Student {
  id: string
  full_name: string
  user_skills: {
    skill_id: string
    proficiency_level: number
    skills: {
      name: string
    }
  }[]
}

interface Team {
  members: Student[]
  skillCoverage: {
    [skillId: string]: number // Number of members with required proficiency
  }
  averageProficiency: number
}

// Add type for cached calculations
interface CachedSkillData {
  [studentId: string]: {
    skillCount: number
    skillCoverage: { [skillId: string]: number }
  }
}

// Add memoization for expensive calculations
const skillCache: CachedSkillData = {}

export function formTeams(
  students: Student[],
  rules: TeamFormationRule
): Team[] {
  // Clear cache for new formation
  Object.keys(skillCache).forEach(key => delete skillCache[key])

  // Pre-calculate skill data for all students
  students.forEach(student => {
    skillCache[student.id] = {
      skillCount: calculateStudentSkillCount(student, rules),
      skillCoverage: calculateStudentSkillCoverage(student, rules)
    }
  })

  // Sort students using cached data
  const sortedStudents = [...students].sort((a, b) => 
    skillCache[b.id].skillCount - skillCache[a.id].skillCount
  )

  const teams: Team[] = []
  const targetTeamSize = calculateTargetTeamSize(students.length, rules)

  // Batch process team creation
  while (sortedStudents.length >= rules.min_team_size) {
    const team = createOptimalTeam(
      sortedStudents,
      targetTeamSize,
      rules
    )
    teams.push(team)
  }

  // Handle remaining students
  if (sortedStudents.length > 0) {
    distributeRemainingStudents(sortedStudents, teams, rules)
  }

  return teams
}

function calculateStudentSkillCount(
  student: Student,
  rules: TeamFormationRule
): number {
  return student.user_skills.filter(skill =>
    rules.required_skills.some(req =>
      req.skillId === skill.skill_id &&
      skill.proficiency_level >= req.minProficiency
    )
  ).length
}

function calculateStudentSkillCoverage(
  student: Student,
  rules: TeamFormationRule
): { [skillId: string]: number } {
  const coverage: { [skillId: string]: number } = {}
  
  rules.required_skills.forEach(requirement => {
    coverage[requirement.skillId] = student.user_skills.some(skill =>
      skill.skill_id === requirement.skillId &&
      skill.proficiency_level >= requirement.minProficiency
    ) ? 1 : 0
  })

  return coverage
}

function calculateTargetTeamSize(
  totalStudents: number,
  rules: TeamFormationRule
): number {
  return Math.min(
    rules.max_team_size,
    Math.max(
      rules.min_team_size,
      Math.ceil(totalStudents / Math.floor(totalStudents / rules.max_team_size))
    )
  )
}

function createOptimalTeam(
  availableStudents: Student[],
  targetSize: number,
  rules: TeamFormationRule
): Team {
  const team: Team = {
    members: [availableStudents.shift()!],
    skillCoverage: {},
    averageProficiency: 0
  }

  team.skillCoverage = { ...skillCache[team.members[0].id].skillCoverage }

  while (team.members.length < targetSize && availableStudents.length > 0) {
    let bestStudentIndex = 0
    let bestScore = -1

    // Use batch processing for score calculation
    for (let i = 0; i < Math.min(availableStudents.length, 10); i++) {
      const score = calculateTeamScore(team, availableStudents[i], rules)
      if (score > bestScore) {
        bestScore = score
        bestStudentIndex = i
      }
    }

    const selectedStudent = availableStudents.splice(bestStudentIndex, 1)[0]
    team.members.push(selectedStudent)
    
    // Update team skill coverage using cached data
    Object.entries(skillCache[selectedStudent.id].skillCoverage).forEach(([skillId, count]) => {
      team.skillCoverage[skillId] = (team.skillCoverage[skillId] || 0) + count
    })
  }

  return team
}

function distributeRemainingStudents(
  remainingStudents: Student[],
  teams: Team[],
  rules: TeamFormationRule
): void {
  remainingStudents.forEach(student => {
    let bestTeam = teams[0]
    let bestScore = calculateTeamScore(bestTeam, student, rules)

    teams.forEach(team => {
      if (team.members.length >= rules.max_team_size) return
      const score = calculateTeamScore(team, student, rules)
      if (score > bestScore) {
        bestScore = score
        bestTeam = team
      }
    })

    bestTeam.members.push(student)
    Object.entries(skillCache[student.id].skillCoverage).forEach(([skillId, count]) => {
      bestTeam.skillCoverage[skillId] = (bestTeam.skillCoverage[skillId] || 0) + count
    })
  })
}

// Update score calculation to use cached data
function calculateTeamScore(
  team: Team,
  student: Student,
  rules: TeamFormationRule
): number {
  let score = 0
  const studentCoverage = skillCache[student.id].skillCoverage

  rules.required_skills.forEach(requirement => {
    const currentCoverage = team.skillCoverage[requirement.skillId] || 0
    const studentContribution = studentCoverage[requirement.skillId] || 0
    
    if (currentCoverage < requirement.minCount) {
      score += studentContribution * 10
    }
  })

  score += rules.skill_distribution_rules.diversityWeight * 
    Object.values(studentCoverage).reduce((sum, count) => sum + count, 0)

  return score
}

// Add this function back with the export
export function calculateTeamSkillCoverage(members: Student[], rules: TeamFormationRule): Record<string, number> {
  const coverage: Record<string, number> = {}
  
  rules.required_skills.forEach(requirement => {
    coverage[requirement.skillId] = members.reduce((count, member) => 
      count + (skillCache[member.id]?.skillCoverage[requirement.skillId] || 0), 0
    )
  })

  return coverage
}

// Make sure calculateTeamScore is also exported
export { calculateTeamScore } 