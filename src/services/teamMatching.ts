import { SupabaseClient } from '@supabase/supabase-js'

interface TeamMatchingRules {
  minTeamSize: number;
  maxTeamSize: number;
  courseId: string;
  considerSkills?: boolean;
}

interface Student {
  id: string;
  full_name: string;
  skills: {
    skill_id: string;
    proficiency_level: number;
  }[];
}

export class TeamMatchingService {
  private supabase: SupabaseClient;

  constructor(supabase: SupabaseClient) {
    this.supabase = supabase;
  }

  async getAvailableStudents(courseId: string): Promise<Student[]> {
    const { data, error } = await this.supabase
      .from('users')
      .select(`
        id,
        full_name,
        student_skills (
          skill_id,
          proficiency_level
        )
      `)
      .eq('role', 'student')
      .eq('looking_for_team', true)
      .not('id', 'in', (
        this.supabase
          .from('team_members')
          .select('user_id')
      ));

    if (error) throw error;
    return (data || []).map(student => ({
      id: student.id,
      full_name: student.full_name,
      skills: student.student_skills
    }));
  }

  async createTeams(rules: TeamMatchingRules) {
    const students = await this.getAvailableStudents(rules.courseId);
    
    // Shuffle students for random distribution
    const shuffledStudents = this.shuffleArray(students);
    
    // Create teams
    const teams: Student[][] = [];
    let currentTeam: Student[] = [];

    for (const student of shuffledStudents) {
      currentTeam.push(student);
      
      if (currentTeam.length >= rules.maxTeamSize) {
        teams.push(currentTeam);
        currentTeam = [];
      }
    }

    // Handle remaining students
    if (currentTeam.length >= rules.minTeamSize) {
      teams.push(currentTeam);
    } else if (currentTeam.length > 0) {
      // Distribute remaining students across existing teams
      for (const student of currentTeam) {
        const smallestTeam = teams.reduce((a, b) => 
          a.length <= b.length ? a : b
        );
        smallestTeam.push(student);
      }
    }

    // Save teams to database
    await this.saveTeams(teams, rules.courseId);
    
    return teams;
  }

  private shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  private async saveTeams(teams: Student[][], courseId: string) {
    for (const teamMembers of teams) {
      // Create team
      const { data: team, error: teamError } = await this.supabase
        .from('teams')
        .insert({
          course_id: courseId,
          name: `Team ${Math.random().toString(36).substr(2, 6)}`,
          created_at: new Date().toISOString()
        })
        .select()
        .single();

      if (teamError) throw teamError;

      // Add team members
      const memberPromises = teamMembers.map(student => 
        this.supabase
          .from('team_members')
          .insert({
            team_id: team.id,
            user_id: student.id,
            joined_at: new Date().toISOString()
          })
      );

      // Update student availability status
      const statusPromises = teamMembers.map(student =>
        this.supabase
          .from('users')
          .update({
            looking_for_team: false,
            updated_at: new Date().toISOString()
          })
          .eq('id', student.id)
      );

      await Promise.all([...memberPromises, ...statusPromises]);
    }
  }
} 