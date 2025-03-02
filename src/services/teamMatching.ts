import { createClient } from '@/lib/supabase';
import { Database } from '@/types/supabase';

export type Student = Database['public']['Tables']['users']['Row'] & {
  skills?: {
    skill_id: string;
    proficiency_level: number;
  }[];
  availability: string[];
  project_preferences: string[];
};

interface TeamMatchingCriteria {
  minTeamSize: number;
  maxTeamSize: number;
  considerSkills: boolean;
  balanceTeamSize?: boolean;
  considerProjectPreferences?: boolean;
  considerAvailability?: boolean;
  skillWeighting?: number; // 0-1, how much to weight skill compatibility
}

interface CompatibilityScore {
  total: number;
  skillScore: number;
  availabilityScore: number;
  preferenceScore: number;
}

export class TeamMatchingService {
  private supabase;

  constructor() {
    this.supabase = createClient();
  }

  /**
   * Main method to match students into teams based on given criteria
   */
  async matchTeams(criteria: TeamMatchingCriteria): Promise<Student[][]> {
    try {
      // Fetch all available students
      const { data: students, error } = await this.supabase
        .from('users')
        .select(`
          *,
          student_skills!user_id(skill_id, proficiency_level)
        `)
        .eq('role', 'student')
        .eq('looking_for_team', true);

      if (error) {
        console.error('Database query error:', error);
        throw error;
      }
      
      // Handle the case where no students are available
      if (!students?.length) {
        console.log('No students available for team formation');
        return [];
      }

      // Add debugging to see what's coming back from the database
      console.log('Retrieved students data:', JSON.stringify(students, null, 2));
      
      // Process and format the student data with more robust error handling
      const processedStudents = students.map(student => {
        // Ensure student_skills is always an array
        const skills = Array.isArray(student.student_skills) 
          ? student.student_skills 
          : [];
        
        return {
          ...student,
          skills: skills,
          // Set empty arrays for missing fields
          availability: [],
          project_preferences: []
        };
      });

      console.log('Processed students data:', JSON.stringify(processedStudents, null, 2));

      // Initialize teams array
      const teams: Student[][] = [];
      let unassignedStudents = [...processedStudents];

      // Check if we have enough students to form teams
      if (unassignedStudents.length < criteria.minTeamSize) {
        console.log('Not enough students to form teams of the minimum size');
        return [];
      }

      // Phase 1: Create initial teams based on optimal size
      while (unassignedStudents.length >= criteria.minTeamSize) {
        const newTeam = await this.formOptimalTeam(
          unassignedStudents,
          criteria
        );

        if (newTeam.length < criteria.minTeamSize) break;

        teams.push(newTeam);
        unassignedStudents = unassignedStudents.filter(
          student => !newTeam.find(s => s.id === student.id)
        );
      }

      // Phase 2: Handle remaining students
      if (unassignedStudents.length > 0) {
        await this.distributeRemainingStudents(
          unassignedStudents,
          teams,
          criteria
        );
      }

      // Validate teams based on required skills if applicable
      if (criteria.considerSkills) {
        for (const team of teams) {
          const isValid = await this.validateTeam(team, criteria);
          if (!isValid) {
            console.log('At least one team does not meet skill requirements');
            // You can decide whether to return invalid teams or not
            // For now, we'll return them and let the UI handle messaging
          }
        }
      }

      return teams;
    } catch (error) {
      console.error('Error in matchTeams:', error);
      throw error;
    }
  }

  /**
   * Forms an optimal team from available students
   */
  private async formOptimalTeam(
    students: Student[],
    criteria: TeamMatchingCriteria
  ): Promise<Student[]> {
    try {
      if (!students || students.length === 0) {
        console.log('No students available for team formation');
        return [];
      }

      const team: Student[] = [];
      const firstStudent = students[0];
      team.push(firstStudent);

      while (
        team.length < criteria.maxTeamSize &&
        team.length < students.length
      ) {
        let bestMatch: Student | null = null;
        let bestScore = -1;

        for (const candidate of students) {
          if (team.find(s => s.id === candidate.id)) continue;

          try {
            const score = await this.calculateTeamCompatibility(
              [...team, candidate],
              criteria
            );

            if (score.total > bestScore) {
              bestScore = score.total;
              bestMatch = candidate;
            }
          } catch (err) {
            console.error('Error calculating compatibility for candidate:', candidate.id, err);
          }
        }

        if (bestMatch) {
          team.push(bestMatch);
        } else {
          break;
        }
      }

      return team;
    } catch (err) {
      console.error('Error in formOptimalTeam:', err);
      // Return empty array since team variable is not accessible here
      return [];
    }
  }

  /**
   * Calculates compatibility score for a potential team
   */
  private async calculateTeamCompatibility(
    team: Student[],
    criteria: TeamMatchingCriteria
  ): Promise<CompatibilityScore> {
    const scores: CompatibilityScore = {
      total: 0,
      skillScore: 0,
      availabilityScore: 0,
      preferenceScore: 0
    };

    if (criteria.considerSkills) {
      scores.skillScore = this.calculateSkillCompatibility(team);
    }

    if (criteria.considerAvailability) {
      scores.availabilityScore = this.calculateAvailabilityCompatibility(team);
    }

    if (criteria.considerProjectPreferences) {
      scores.preferenceScore = this.calculatePreferenceCompatibility(team);
    }

    // Weight and combine scores
    scores.total = this.calculateWeightedScore(scores, criteria);
    return scores;
  }

  /**
   * Calculates skill compatibility score
   */
  private calculateSkillCompatibility(team: Student[]): number {
    // Handle case with no skills data
    if (team.some(student => !student.skills || student.skills.length === 0)) {
      return 0.5; // Default middle score when skill data is missing
    }

    let score = 0;
    const skillCoverage = new Map<string, number>();

    // Map skill distribution
    team.forEach(student => {
      student.skills?.forEach(skill => {
        if (skill && skill.skill_id) {
          const current = skillCoverage.get(skill.skill_id) || 0;
          skillCoverage.set(
            skill.skill_id,
            current + (skill.proficiency_level || 1)
          );
        }
      });
    });

    // Handle case with no skills found
    if (skillCoverage.size === 0) {
      return 0.5; // Default middle score
    }

    // Calculate diversity score
    const uniqueSkills = skillCoverage.size;
    const avgProficiency = 
      Array.from(skillCoverage.values()).reduce((a, b) => a + b, 0) / 
      Math.max(1, skillCoverage.size); // Avoid division by zero

    score = (uniqueSkills * 0.6 + avgProficiency * 0.4) / Math.max(1, team.length); // Avoid division by zero
    return Math.min(score, 1);
  }

  /**
   * Calculates availability compatibility score
   */
  private calculateAvailabilityCompatibility(team: Student[]): number {
    // Handle missing availability data
    if (!team[0]?.availability || team[0].availability.length === 0) {
      return 0.5; // Default middle score when availability data is missing
    }

    const commonAvailability = team.reduce((common, student) => {
      if (!student.availability || student.availability.length === 0) return common;
      return common.filter(time => student.availability?.includes(time));
    }, [...team[0].availability]);

    // Normalize to 0-1, with minimum score of 0.1
    return Math.max(0.1, commonAvailability.length / 10); 
  }

  /**
   * Calculates project preference compatibility score
   */
  private calculatePreferenceCompatibility(team: Student[]): number {
    // Handle missing preference data
    if (!team[0]?.project_preferences || team[0].project_preferences.length === 0) {
      return 0.5; // Default middle score when preference data is missing
    }

    const preferenceOverlap = team.reduce((common, student) => {
      if (!student.project_preferences || student.project_preferences.length === 0) 
        return common;
      return common.filter(pref => 
        student.project_preferences?.includes(pref)
      );
    }, [...team[0].project_preferences]);

    // Normalize to 0-1, with minimum score of 0.1
    return Math.max(0.1, preferenceOverlap.length / 3);
  }

  /**
   * Calculates weighted total score based on criteria
   */
  private calculateWeightedScore(
    scores: CompatibilityScore,
    criteria: TeamMatchingCriteria
  ): number {
    const weights = {
      skills: criteria.skillWeighting || 0.4,
      availability: 0.3,
      preferences: 0.3
    };

    return (
      scores.skillScore * weights.skills +
      scores.availabilityScore * weights.availability +
      scores.preferenceScore * weights.preferences
    );
  }

  /**
   * Distributes remaining students to existing teams
   */
  private async distributeRemainingStudents(
    remaining: Student[],
    teams: Student[][],
    criteria: TeamMatchingCriteria
  ): Promise<void> {
    for (const student of remaining) {
      let bestTeam = -1;
      let bestScore = -1;

      for (let i = 0; i < teams.length; i++) {
        if (teams[i].length >= criteria.maxTeamSize) continue;

        const score = await this.calculateTeamCompatibility(
          [...teams[i], student],
          criteria
        );

        if (score.total > bestScore) {
          bestScore = score.total;
          bestTeam = i;
        }
      }

      if (bestTeam !== -1) {
        teams[bestTeam].push(student);
      }
    }
  }

  /**
   * Validates if a team meets all criteria
   */
  async validateTeam(
    team: Student[],
    criteria: TeamMatchingCriteria
  ): Promise<boolean> {
    if (
      team.length < criteria.minTeamSize ||
      team.length > criteria.maxTeamSize
    ) {
      return false;
    }

    const compatibility = await this.calculateTeamCompatibility(team, criteria);
    return compatibility.total >= 0.5; // Minimum threshold for valid team
  }
} 