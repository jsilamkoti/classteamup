import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function PATCH(request: Request) {
  try {
    const requestData = await request.json();
    const { teamId, teamData } = requestData;
    
    if (!teamId) {
      return NextResponse.json({ error: 'Missing required field: teamId' }, { status: 400 });
    }
    
    if (!teamData || Object.keys(teamData).length === 0) {
      return NextResponse.json({ error: 'No data provided for update' }, { status: 400 });
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
      return NextResponse.json({ error: 'Forbidden: Only instructors can update teams' }, { status: 403 });
    }
    
    // Add updated_at timestamp
    const updateData = {
      ...teamData,
      updated_at: new Date().toISOString()
    };
    
    // Update the team
    const { data: updatedTeam, error: updateError } = await supabase
      .from('teams')
      .update(updateData)
      .eq('id', teamId)
      .select()
      .single();
      
    if (updateError) {
      console.error('Error updating team:', updateError);
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }
    
    if (!updatedTeam) {
      return NextResponse.json({ error: 'Team not found or no changes made' }, { status: 404 });
    }
    
    // Return success response
    return NextResponse.json({ 
      success: true, 
      team: updatedTeam,
      message: 'Team updated successfully' 
    });
    
  } catch (error: any) {
    console.error('Unexpected error in update-team API:', error);
    return NextResponse.json({ error: error.message || 'Unknown error' }, { status: 500 });
  }
} 