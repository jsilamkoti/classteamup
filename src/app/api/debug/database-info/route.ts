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
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Get user role to ensure they're an instructor
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('role')
      .eq('id', session.user.id)
      .single();

    if (userError || !userData || userData.role !== 'instructor') {
      return new NextResponse(
        JSON.stringify({ error: 'Unauthorized - Instructor access required' }),
        { status: 403, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Get teams table info
    const { data: teams, error: teamsError } = await supabase
      .from('teams')
      .select('*')
      .limit(1);

    // Get team_members table info
    const { data: teamMembers, error: teamMembersError } = await supabase
      .from('team_members')
      .select('*')
      .limit(1);

    // Get users table info
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('*')
      .limit(1);

    // Get skills table info
    const { data: skills, error: skillsError } = await supabase
      .from('skills')
      .select('*')
      .limit(1);

    // Get team_formation_rules table info
    const { data: rules, error: rulesError } = await supabase
      .from('team_formation_rules')
      .select('*')
      .limit(1);

    const tableInfo = {
      teams: {
        columns: teams ? Object.keys(teams[0] || {}) : [],
        error: teamsError?.message
      },
      team_members: {
        columns: teamMembers ? Object.keys(teamMembers[0] || {}) : [],
        error: teamMembersError?.message
      },
      users: {
        columns: users ? Object.keys(users[0] || {}) : [],
        error: usersError?.message
      },
      skills: {
        columns: skills ? Object.keys(skills[0] || {}) : [],
        error: skillsError?.message
      },
      team_formation_rules: {
        columns: rules ? Object.keys(rules[0] || {}) : [],
        error: rulesError?.message
      }
    };

    return new NextResponse(
      JSON.stringify({ tables: tableInfo }),
      { 
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    );
    
  } catch (error: any) {
    console.error('Database info error:', error);
    return new NextResponse(
      JSON.stringify({ error: 'Server error', details: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
} 