import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const requestData = await request.json();
    const { teamData } = requestData;
    
    if (!teamData || !teamData.course_id) {
      return NextResponse.json({ 
        error: 'Missing required team data or course_id' 
      }, { status: 400 });
    }
    
    // Use the route handler client with server-side auth
    const supabase = createRouteHandlerClient({ cookies });
    
    // Get the session to verify the user is authenticated and is an instructor
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Fetch the user to verify their role
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('role')
      .eq('id', session.user.id)
      .single();
      
    if (userError || !userData || userData.role !== 'instructor') {
      return NextResponse.json({ 
        error: 'Forbidden: Only instructors can create teams' 
      }, { status: 403 });
    }

    // First, let's inspect the teams table structure
    const { data: tableInfo, error: tableError } = await supabase
      .from('teams')
      .select('*')
      .limit(1);

    console.log('Table structure:', {
      hasData: !!tableInfo,
      columns: tableInfo ? Object.keys(tableInfo[0] || {}) : [],
      error: tableError
    });

    // Create team with minimal required fields
    const minimalTeamData = {
      name: teamData.name,
      description: teamData.description,
      course_id: teamData.course_id,
      created_by: session.user.id
    };

    console.log('Attempting to create team with minimal data:', minimalTeamData);
    
    // Create the team
    const { data: team, error: teamError } = await supabase
      .from('teams')
      .insert(minimalTeamData)
      .select()
      .single();
      
    if (teamError) {
      console.error('Error creating team:', {
        error: teamError,
        code: teamError.code,
        message: teamError.message,
        details: teamError.details
      });
      
      return NextResponse.json({ 
        error: teamError.message,
        code: teamError.code,
        details: teamError.details
      }, { status: 500 });
    }
    
    if (!team) {
      return NextResponse.json({ 
        error: 'Team was not created' 
      }, { status: 500 });
    }
    
    return NextResponse.json({ 
      success: true, 
      team,
      message: 'Team created successfully' 
    });
    
  } catch (error: any) {
    console.error('Unexpected error in create-team API:', error);
    return NextResponse.json({ 
      error: error.message || 'Unknown error',
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    }, { status: 500 });
  }
} 