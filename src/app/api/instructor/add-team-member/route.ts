import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

// Validate environment variables
if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
  throw new Error('NEXT_PUBLIC_SUPABASE_URL is not defined');
}

if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error('SUPABASE_SERVICE_ROLE_KEY is not defined');
}

// Create a Supabase client with the service role key
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

export async function POST(request: Request) {
  try {
    // Validate request content type
    const contentType = request.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      return new NextResponse(
        JSON.stringify({ 
          error: 'Invalid content type. Expected application/json' 
        }), 
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    const requestData = await request.json();
    const { teamId, userId } = requestData;
    
    if (!teamId || !userId) {
      return new NextResponse(
        JSON.stringify({ 
          error: 'Missing required teamId or userId' 
        }), 
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }
    
    // Use the route handler client
    const supabase = createRouteHandlerClient({ cookies });
    
    // Get the session to verify the user is authenticated and is an instructor
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    if (sessionError) {
      return new NextResponse(
        JSON.stringify({ 
          error: 'Session error: ' + sessionError.message 
        }), 
        { 
          status: 401,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }
    
    if (!session) {
      return new NextResponse(
        JSON.stringify({ 
          error: 'Unauthorized - No session found' 
        }), 
        { 
          status: 401,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }
    
    // Fetch the user to verify their role
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('role')
      .eq('id', session.user.id)
      .single();
      
    if (userError) {
      return new NextResponse(
        JSON.stringify({ 
          error: 'Error fetching user role: ' + userError.message 
        }), 
        { 
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }
    
    if (!userData || userData.role !== 'instructor') {
      return new NextResponse(
        JSON.stringify({ 
          error: 'Forbidden: Only instructors can add team members' 
        }), 
        { 
          status: 403,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Create team member with required fields
    const teamMemberData = {
      team_id: teamId,
      user_id: userId,
      role: 'member'
    };

    console.log('Attempting to add team member with data:', teamMemberData);
    
    // Add the team member using admin client to bypass RLS
    const { data: teamMember, error: teamMemberError } = await supabaseAdmin
      .from('team_members')
      .insert(teamMemberData)
      .select()
      .single();
      
    if (teamMemberError) {
      console.error('Error adding team member:', {
        error: teamMemberError,
        code: teamMemberError.code,
        message: teamMemberError.message,
        details: teamMemberError.details
      });
      
      return new NextResponse(
        JSON.stringify({ 
          error: teamMemberError.message,
          code: teamMemberError.code,
          details: teamMemberError.details
        }), 
        { 
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }
    
    if (!teamMember) {
      return new NextResponse(
        JSON.stringify({ 
          error: 'Team member was not added' 
        }), 
        { 
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Update the user's looking_for_team status using admin client
    const { error: updateError } = await supabaseAdmin
      .from('users')
      .update({ looking_for_team: false })
      .eq('id', userId);

    if (updateError) {
      console.log('Warning: Failed to update user status:', updateError);
    }
    
    return new NextResponse(
      JSON.stringify({ 
        success: true, 
        teamMember,
        message: 'Team member added successfully' 
      }), 
      { 
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    );
    
  } catch (error: any) {
    console.error('Unexpected error in add-team-member API:', error);
    
    // Check if the error is related to parsing JSON
    if (error instanceof SyntaxError && error.message.includes('Unexpected token')) {
      return new NextResponse(
        JSON.stringify({ 
          error: 'Invalid JSON in request body',
          details: error.message
        }), 
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }
    
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