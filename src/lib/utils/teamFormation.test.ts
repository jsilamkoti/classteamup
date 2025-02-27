import { formTeams, calculateTeamSkillCoverage, calculateTeamScore } from './teamFormation'
import { TeamFormationRule } from './teamRules'

describe('Team Formation Algorithm', () => {
  // Test data
  const mockStudents = [
    {
      id: '1',
      full_name: 'Student 1',
      user_skills: [
        { skill_id: 'skill1', proficiency_level: 4, skills: { name: 'Programming' } },
        { skill_id: 'skill2', proficiency_level: 3, skills: { name: 'Design' } }
      ]
    },
    {
      id: '2',
      full_name: 'Student 2',
      user_skills: [
        { skill_id: 'skill2', proficiency_level: 5, skills: { name: 'Design' } },
        { skill_id: 'skill3', proficiency_level: 4, skills: { name: 'Analysis' } }
      ]
    },
    {
      id: '3',
      full_name: 'Student 3',
      user_skills: [
        { skill_id: 'skill1', proficiency_level: 5, skills: { name: 'Programming' } },
        { skill_id: 'skill3', proficiency_level: 3, skills: { name: 'Analysis' } }
      ]
    }
  ]

  const mockRules: TeamFormationRule = {
    id: 'test',
    course_id: 'course1',
    min_team_size: 2,
    max_team_size: 3,
    required_skills: [
      { skillId: 'skill1', minCount: 1, minProficiency: 3 },
      { skillId: 'skill2', minCount: 1, minProficiency: 3 }
    ],
    skill_distribution_rules: {
      diversityWeight: 0.5,
      academicLevelBalance: true
    },
    created_at: new Date().toISOString()
  }

  test('forms teams of correct size', () => {
    const teams = formTeams(mockStudents, mockRules)
    teams.forEach(team => {
      expect(team.members.length).toBeGreaterThanOrEqual(mockRules.min_team_size)
      expect(team.members.length).toBeLessThanOrEqual(mockRules.max_team_size)
    })
  })

  test('distributes skills appropriately', () => {
    const teams = formTeams(mockStudents, mockRules)
    teams.forEach(team => {
      mockRules.required_skills.forEach(requirement => {
        const coverage = team.skillCoverage[requirement.skillId]
        expect(coverage).toBeGreaterThanOrEqual(requirement.minCount)
      })
    })
  })

  test('calculates team skill coverage correctly', () => {
    const team = {
      members: mockStudents.slice(0, 2),
      skillCoverage: {},
      averageProficiency: 0
    }
    const coverage = calculateTeamSkillCoverage(team.members, mockRules)
    expect(coverage['skill1']).toBe(1) // Student 1 has skill1
    expect(coverage['skill2']).toBe(2) // Both students have skill2
  })

  test('calculates team score appropriately', () => {
    const team = {
      members: [mockStudents[0]],
      skillCoverage: calculateTeamSkillCoverage([mockStudents[0]], mockRules),
      averageProficiency: 0
    }
    
    // Test adding a student with complementary skills
    const score1 = calculateTeamScore(team, mockStudents[1], mockRules)
    const score2 = calculateTeamScore(team, mockStudents[2], mockRules)
    
    // Student 1 has better complementary skills than Student 2
    expect(score1).toBeGreaterThan(score2)
  })

  test('handles edge cases', () => {
    // Empty student list
    expect(() => formTeams([], mockRules)).not.toThrow()
    
    // Single student
    const singleTeam = formTeams([mockStudents[0]], mockRules)
    expect(singleTeam).toHaveLength(1)
    
    // No required skills
    const noSkillRules = {
      ...mockRules,
      required_skills: []
    }
    expect(() => formTeams(mockStudents, noSkillRules)).not.toThrow()
  })
}) 