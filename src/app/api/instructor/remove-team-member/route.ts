import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function DELETE(request: Request) {
  try {
    // Parse URL to get query parameters
    const url = new URL(request.url);
    const teamId = url.searchParams.get('teamId');
    const userId = url.searchParams.get('userId');
    
    if (!teamId || !userId) {
      return NextResponse.json({ error: 'Missing required parameters: teamId or userId' }, { status: 400 });
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
      return NextResponse.json({ error: 'Forbidden: Only instructors can remove team members' }, { status: 403 });
    }
    
    // First check if the member exists
    const { data: member, error: memberCheckError } = await supabase
      .from('team_members')
      .select('id')
      .eq('team_id', teamId)
      .eq('user_id', userId)
      .single();
      
    if (memberCheckError || !member) {
      return NextResponse.json({ error: 'Team member not found' }, { status: 404 });
    }
    
    // Remove the team member
    const { error: deleteError } = await supabase
      .from('team_members')
      .delete()
      .eq('team_id', teamId)
      .eq('user_id', userId);
      
    if (deleteError) {
      console.error('Error removing team member:', deleteError);
      return NextResponse.json({ error: deleteError.message }, { status: 500 });
    }
    
    // Update the user's status to looking for team
    const { error: updateError } = await supabase
      .from('users')
      .update({
        looking_for_team: true,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId);
      
    if (updateError) {
      console.error('Error updating user status:', updateError);
      return NextResponse.json({ 
        warning: `Member removed but failed to update their status: ${updateError.message}`,
        success: true
      });
    }
    
    // Return success response
    return NextResponse.json({ 
      success: true, 
      message: 'Team member removed successfully' 
    });
    
  } catch (error: any) {
    console.error('Unexpected error in remove-team-member API:', error);
    return NextResponse.json({ error: error.message || 'Unknown error' }, { status: 500 });
  }
} 