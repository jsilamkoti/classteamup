import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const requestData = await request.json();
    const { teamData, memberData } = requestData;
    
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
      return NextResponse.json({ error: 'Forbidden: Only instructors can create teams' }, { status: 403 });
    }
    
    // Create the team - server-side operations can bypass RLS
    const { data: team, error: teamError } = await supabase
      .from('teams')
      .insert(teamData)
      .select('id')
      .single();
      
    if (teamError) {
      console.error('Error creating team:', teamError);
      return NextResponse.json({ error: teamError.message }, { status: 500 });
    }
    
    // Return success response with team ID
    return NextResponse.json({ 
      success: true, 
      teamId: team.id,
      message: 'Team created successfully' 
    });
    
  } catch (error: any) {
    console.error('Unexpected error in create-team API:', error);
    return NextResponse.json({ error: error.message || 'Unknown error' }, { status: 500 });
  }
} 