import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const requestData = await request.json();
    const { teamId, userId } = requestData;
    
    if (!teamId || !userId) {
      return NextResponse.json({ error: 'Missing required fields: teamId or userId' }, { status: 400 });
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
      return NextResponse.json({ error: 'Forbidden: Only instructors can add team members' }, { status: 403 });
    }
    
    // Create the member entry
    const memberData = {
      team_id: teamId,
      user_id: userId,
      joined_at: new Date().toISOString()
    };
    
    const { data: member, error: memberError } = await supabase
      .from('team_members')
      .insert(memberData)
      .select()
      .single();
      
    if (memberError) {
      console.error('Error adding team member:', memberError);
      return NextResponse.json({ error: memberError.message }, { status: 500 });
    }
    
    // Update the user's status to not looking for team
    const { error: updateError } = await supabase
      .from('users')
      .update({
        looking_for_team: false,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId);
      
    if (updateError) {
      console.error('Error updating user status:', updateError);
      return NextResponse.json({ 
        warning: `Member added but failed to update their status: ${updateError.message}`,
        member
      });
    }
    
    // Return success response
    return NextResponse.json({ 
      success: true, 
      member,
      message: 'Team member added successfully' 
    });
    
  } catch (error: any) {
    console.error('Unexpected error in add-team-member API:', error);
    return NextResponse.json({ error: error.message || 'Unknown error' }, { status: 500 });
  }
} 