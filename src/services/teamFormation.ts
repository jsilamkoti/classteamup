import { createClient } from '@/lib/supabase'

interface TeamFormationRules {
  minTeamSize: number;
  maxTeamSize: number;
  courseId: string;
}

interface StudentForMatching {
  id: string;
  full_name: string;
  skills: {
    skill_id: string;
    proficiency_level: number;
  }[];
  looking_for_team: boolean;
  availability_status: string;
}

export class TeamFormationService {
  private supabase = createClient();

  async getAvailableStudents(courseId: string): Promise<StudentForMatching[]> {
    // Get students who are:
    // 1. Looking for team
    // 2. Not already in a team
    // 3. Enrolled in the course
    const { data: availableStudents, error } = await this.supabase
      .from('users')
      .select(`
        id,
        full_name,
        looking_for_team,
        availability_status,
        student_skills (
          skill_id,
          proficiency_level
        )
      `)
      .eq('looking_for_team', true)
      .eq('availability_status', 'available')
      .not('id', 'in', (
        this.supabase
          .from('team_members')
          .select('user_id')
      ))
      .eq('role', 'student');

    if (error) throw error;
    
    return (availableStudents || []).map(student => ({
      id: student.id,
      full_name: student.full_name,
      looking_for_team: student.looking_for_team,
      availability_status: student.availability_status,
      skills: student.student_skills
    }));
  }

  async formTeams(rules: TeamFormationRules) {
    const availableStudents = await this.getAvailableStudents(rules.courseId);
    
    // Shuffle students randomly (Fisher-Yates algorithm)
    const shuffledStudents = [...availableStudents];
    for (let i = shuffledStudents.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffledStudents[i], shuffledStudents[j]] = [shuffledStudents[j], shuffledStudents[i]];
    }

    const teams: StudentForMatching[][] = [];
    let currentTeam: StudentForMatching[] = [];

    // Form teams based on size rules
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
      // Distribute remaining students to existing teams
      for (const student of currentTeam) {
        const targetTeam = teams.reduce((prev, curr) => 
          prev.length <= curr.length ? prev : curr
        );
        targetTeam.push(student);
      }
    }

    // Save teams to database
    return this.saveTeams(teams, rules.courseId);
  }

  private async saveTeams(teams: StudentForMatching[][], courseId: string) {
    const { data: { user } } = await this.supabase.auth.getUser();
    
    for (const teamMembers of teams) {
      // Create team
      const { data: team, error: teamError } = await this.supabase
        .from('teams')
        .insert({
          course_id: courseId,
          name: `Team ${Math.random().toString(36).substring(7)}`, // Temporary name
          created_at: new Date().toISOString()
        })
        .select()
        .single();

      if (teamError) throw teamError;

      // Add team members
      const teamMemberPromises = teamMembers.map(student => 
        this.supabase
          .from('team_members')
          .insert({
            team_id: team.id,
            user_id: student.id,
            joined_at: new Date().toISOString()
          })
      );

      // Update student status
      const statusUpdatePromises = teamMembers.map(student =>
        this.supabase
          .from('users')
          .update({
            looking_for_team: false,
            updated_at: new Date().toISOString()
          })
          .eq('id', student.id)
      );

      await Promise.all([...teamMemberPromises, ...statusUpdatePromises]);
    }

    return teams;
  }
} 