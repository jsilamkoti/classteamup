import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    
    // Get the current user's session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    if (sessionError || !session) {
      return new NextResponse(
        JSON.stringify({ error: 'Unauthorized' }),
        { 
          status: 401,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Get user role
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('role')
      .eq('id', session.user.id)
      .single();

    if (userError) {
      return new NextResponse(
        JSON.stringify({ error: 'Error fetching user role' }),
        { 
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Fetch teams with their members
    let query = supabase
      .from('teams')
      .select(`
        *,
        team_members!inner (
          user_id,
          role,
          users!inner (
            id,
            full_name,
            email,
            role,
            academic_level,
            skills (
              skill_id,
              proficiency_level
            )
          )
        )
      `);

    // If user is a student, only show their team and other teams' basic info
    if (userData.role === 'student') {
      // First check if student is in a team
      const { data: studentTeam } = await supabase
        .from('team_members')
        .select('team_id')
        .eq('user_id', session.user.id)
        .single();

      if (studentTeam) {
        // Show full details for student's team and basic details for others
        query = query.or(`id.eq.${studentTeam.team_id},visibility.eq.public`);
      } else {
        // Only show public teams
        query = query.eq('visibility', 'public');
      }
    }

    const { data: teams, error: teamsError } = await query;

    if (teamsError) {
      return new NextResponse(
        JSON.stringify({ error: 'Error fetching teams' }),
        { 
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Process teams to organize member data
    const processedTeams = teams.map(team => {
      const members = team.team_members.map(member => ({
        id: member.users.id,
        full_name: member.users.full_name,
        email: member.users.email,
        role: member.users.role,
        academic_level: member.users.academic_level,
        team_role: member.role,
        skills: member.users.skills || []
      }));

      return {
        id: team.id,
        name: team.name,
        description: team.description,
        course_id: team.course_id,
        created_at: team.created_at,
        visibility: team.visibility,
        status: team.status,
        members
      };
    });

    return new NextResponse(
      JSON.stringify({ teams: processedTeams }),
      { 
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    );
    
  } catch (error: any) {
    return new NextResponse(
      JSON.stringify({ 
        error: error.message || 'Unknown error',
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      }),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
} 