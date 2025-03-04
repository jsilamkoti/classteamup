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
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    console.log('User authenticated:', session.user.id);

    // Get user role and looking_for_team status
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('role, looking_for_team')
      .eq('id', session.user.id)
      .single();

    if (userError) {
      console.error('User role error:', userError);
      return new NextResponse(
        JSON.stringify({ error: 'Error fetching user role', details: userError.message }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    console.log('User role:', userData?.role);

    // Get teams based on user role
    let query = supabase
      .from('teams')
      .select(`
        id,
        name,
        description,
        course_id,
        created_at,
        updated_at,
        status,
        team_lead_id,
        max_members,
        created_by
      `);

    // If user is a student, only show teams they're a member of
    if (userData.role === 'student') {
      const { data: studentTeam } = await supabase
        .from('team_members')
        .select('team_id')
        .eq('user_id', session.user.id)
        .single();

      if (studentTeam) {
        console.log('Student is in team:', studentTeam.team_id);
        query = query.eq('id', studentTeam.team_id);
      } else {
        console.log('Student not in any team');
      }
    }

    const { data: teams, error: teamsError } = await query;

    if (teamsError) {
      console.error('Teams query error:', teamsError);
      return new NextResponse(
        JSON.stringify({ error: 'Error fetching teams', details: teamsError.message }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (!teams || teams.length === 0) {
      console.log('No teams found');
      return new NextResponse(
        JSON.stringify({ teams: [] }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Found ${teams.length} teams`);

    // Get team members and their user information
    const teamIds = teams.map(team => team.id);
    
    // First, get all team members for these teams
    const { data: allTeamMembers = [], error: teamMembersError } = await supabase
      .from('team_members')
      .select('team_id, user_id, role, joined_at')
      .in('team_id', teamIds);

    if (teamMembersError) {
      console.error('Team members error:', teamMembersError);
      return new NextResponse(
        JSON.stringify({ error: 'Error fetching team members', details: teamMembersError.message }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Get all user information for team members
    const userIds = [...new Set(allTeamMembers.map(member => member.user_id))];
    
    if (userIds.length === 0) {
      // If no team members, return teams without member data
      const processedTeams = teams.map(team => ({
        ...team,
        members: []
      }));

      return new NextResponse(
        JSON.stringify({ teams: processedTeams }),
        { 
          status: 200,
          headers: { 
            'Content-Type': 'application/json',
            'Cache-Control': 'no-store'
          }
        }
      );
    }

    const { data: users = [], error: usersError } = await supabase
      .from('users')
      .select('id, full_name, email, role, bio, avatar_url')
      .in('id', userIds);

    if (usersError) {
      console.error('Users error:', usersError);
      return new NextResponse(
        JSON.stringify({ error: 'Error fetching user details', details: usersError.message }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Create a map of user data for quick lookup
    const userMap = new Map(users.map(user => [user.id, user]));

    // Process teams to organize member data
    const processedTeams = teams.map(team => {
      const members = allTeamMembers
        .filter(member => member.team_id === team.id)
        .map(member => {
          const user = userMap.get(member.user_id);
          return {
            id: user?.id,
            full_name: user?.full_name,
            email: user?.email,
            role: user?.role,
            bio: user?.bio,
            avatar_url: user?.avatar_url,
            team_role: member.role,
            joined_at: member.joined_at
          };
        })
        .filter(member => member.id != null);

      return {
        id: team.id,
        name: team.name,
        description: team.description,
        course_id: team.course_id,
        created_at: team.created_at,
        updated_at: team.updated_at,
        status: team.status,
        team_lead_id: team.team_lead_id,
        max_members: team.max_members,
        created_by: team.created_by,
        members
      };
    });

    // If student and not in a team, filter out full teams
    const finalTeams = userData.role === 'student' && !userData.looking_for_team
      ? processedTeams.filter(team => team.members.length < (team.max_members || 0))
      : processedTeams;

    return new NextResponse(
      JSON.stringify({ teams: finalTeams }),
      { 
        status: 200,
        headers: { 
          'Content-Type': 'application/json',
          'Cache-Control': 'no-store'
        }
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
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
} 