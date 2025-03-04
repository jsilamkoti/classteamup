import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    console.log('Starting teams fetch...');
    const supabase = createRouteHandlerClient({ cookies });
    
    // Get the current user's session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    if (sessionError || !session) {
      console.error('Session error:', sessionError);
      return new NextResponse(
        JSON.stringify({ error: 'Unauthorized', details: sessionError?.message }),
        { 
          status: 401,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    console.log('User authenticated:', session.user.id);

    // Get user role
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('role')
      .eq('id', session.user.id)
      .single();

    if (userError) {
      console.error('User role error:', userError);
      return new NextResponse(
        JSON.stringify({ error: 'Error fetching user role', details: userError.message }),
        { 
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    console.log('User role:', userData?.role);

    // Basic teams query
    const baseQuery = `
      id,
      name,
      description,
      course_id,
      created_at,
      visibility,
      status,
      team_members (
        user_id,
        role,
        users (
          id,
          full_name,
          email,
          role,
          academic_level
        )
      )
    `;

    // Fetch teams with their members
    let query = supabase.from('teams').select(baseQuery);

    // If user is a student, only show their team and public teams
    if (userData.role === 'student') {
      const { data: studentTeam } = await supabase
        .from('team_members')
        .select('team_id')
        .eq('user_id', session.user.id)
        .single();

      if (studentTeam) {
        console.log('Student is in team:', studentTeam.team_id);
        query = query.or(`id.eq.${studentTeam.team_id},visibility.eq.public`);
      } else {
        console.log('Student not in any team, showing public teams only');
        query = query.eq('visibility', 'public');
      }
    }

    console.log('Executing teams query...');
    const { data: teams, error: teamsError } = await query;

    if (teamsError) {
      console.error('Teams query error:', teamsError);
      return new NextResponse(
        JSON.stringify({ error: 'Error fetching teams', details: teamsError.message }),
        { 
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    console.log(`Found ${teams?.length || 0} teams`);

    // Process teams to organize member data
    const processedTeams = teams?.map(team => {
      const members = team.team_members?.map(member => ({
        id: member.users?.id,
        full_name: member.users?.full_name,
        email: member.users?.email,
        role: member.users?.role,
        academic_level: member.users?.academic_level,
        team_role: member.role
      })) || [];

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
    }) || [];

    return new NextResponse(
      JSON.stringify({ teams: processedTeams }),
      { 
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    );
    
  } catch (error: any) {
    console.error('Unexpected API error:', error);
    return new NextResponse(
      JSON.stringify({ 
        error: 'Server error',
        details: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      }),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
} 