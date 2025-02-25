interface Student {
  id: string
  skills: {
    skill_id: string
    proficiency_level: number
  }[]
  looking_for_team: boolean
}

interface TeamRule {
  min_team_size: number
  max_team_size: number
  required_skills: {
    skill_id: string
    min_level?: number
    required_count?: number
  }[]
  skill_distribution_rules?: {
    skill_id: string
    min_members_with_skill?: number
    max_members_with_skill?: number
  }[]
}

export class TeamMatcher {
  private students: Student[]
  private rules: TeamRule

  constructor(students: Student[], rules: TeamRule) {
    this.students = students.filter(s => s.looking_for_team)
    this.rules = rules
  }

  public generateTeams() {
    // Shuffle students for random distribution
    const shuffledStudents = this.shuffleArray([...this.students])
    const teams: Student[][] = []
    let currentTeam: Student[] = []

    for (const student of shuffledStudents) {
      if (this.shouldStartNewTeam(currentTeam)) {
        if (currentTeam.length > 0) {
          teams.push(currentTeam)
        }
        currentTeam = [student]
      } else {
        currentTeam.push(student)
      }
    }

    // Add last team if it meets minimum requirements
    if (currentTeam.length >= this.rules.min_team_size) {
      teams.push(currentTeam)
    }

    // Optimize teams based on skill distribution
    return this.optimizeTeams(teams)
  }

  private shouldStartNewTeam(currentTeam: Student[]): boolean {
    if (currentTeam.length === 0) return false
    return currentTeam.length >= this.rules.max_team_size
  }

  private optimizeTeams(teams: Student[][]): Student[][] {
    return teams.map(team => {
      if (!this.teamMeetsSkillRequirements(team)) {
        // Try to swap members with other teams to meet requirements
        for (const otherTeam of teams) {
          if (team === otherTeam) continue

          for (const member of team) {
            for (const otherMember of otherTeam) {
              if (this.wouldSwapImproveTeams(member, otherMember, team, otherTeam)) {
                this.swapMembers(member, otherMember, team, otherTeam)
                break
              }
            }
          }
        }
      }
      return team
    })
  }

  private teamMeetsSkillRequirements(team: Student[]): boolean {
    for (const requirement of this.rules.required_skills) {
      const membersWithSkill = team.filter(member =>
        member.skills.some(skill =>
          skill.skill_id === requirement.skill_id &&
          (!requirement.min_level || skill.proficiency_level >= requirement.min_level)
        )
      ).length

      if (requirement.required_count && membersWithSkill < requirement.required_count) {
        return false
      }
    }
    return true
  }

  private wouldSwapImproveTeams(
    member1: Student,
    member2: Student,
    team1: Student[],
    team2: Student[]
  ): boolean {
    // Create temporary teams with swapped members
    const newTeam1 = [...team1.filter(m => m !== member1), member2]
    const newTeam2 = [...team2.filter(m => m !== member2), member1]

    const currentScore = this.calculateTeamScore(team1) + this.calculateTeamScore(team2)
    const newScore = this.calculateTeamScore(newTeam1) + this.calculateTeamScore(newTeam2)

    return newScore > currentScore
  }

  private calculateTeamScore(team: Student[]): number {
    let score = 0

    // Score based on skill requirements
    for (const requirement of this.rules.required_skills) {
      const membersWithSkill = team.filter(member =>
        member.skills.some(skill =>
          skill.skill_id === requirement.skill_id &&
          (!requirement.min_level || skill.proficiency_level >= requirement.min_level)
        )
      ).length

      if (requirement.required_count) {
        score += membersWithSkill >= requirement.required_count ? 10 : 0
      }
    }

    // Score based on skill distribution
    if (this.rules.skill_distribution_rules) {
      for (const rule of this.rules.skill_distribution_rules) {
        const membersWithSkill = team.filter(member =>
          member.skills.some(skill => skill.skill_id === rule.skill_id)
        ).length

        if (rule.min_members_with_skill && membersWithSkill >= rule.min_members_with_skill) {
          score += 5
        }
        if (rule.max_members_with_skill && membersWithSkill <= rule.max_members_with_skill) {
          score += 5
        }
      }
    }

    return score
  }

  private swapMembers(
    member1: Student,
    member2: Student,
    team1: Student[],
    team2: Student[]
  ) {
    const index1 = team1.indexOf(member1)
    const index2 = team2.indexOf(member2)
    team1[index1] = member2
    team2[index2] = member1
  }

  private shuffleArray<T>(array: T[]): T[] {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]]
    }
    return array
  }
} 