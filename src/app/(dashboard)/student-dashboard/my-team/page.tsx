import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { Card } from '@/components/ui/Card'
import { Users, Award, Mail, Briefcase, Sparkles } from 'lucide-react'

export const dynamic = 'force-dynamic'

// Define the type interface for skill data as it comes from the database
interface SkillData {
  proficiency_level: number;
  skill: any; // Could be an object or array, we'll handle both cases
}

interface Skill {
  skill: {
    name: string;
    category: string;
  };
  proficiency_level: number;
}

interface TeamMember {
  user: {
    id: string;
    full_name: string;
    student_skills: Skill[];
    bio?: string;
    email?: string;
    avatar_url?: string;
  };
}

interface Team {
  id: string;
  name: string;
  created_at: string;
  team_members: TeamMember[];
}

export default async function MyTeamPage() {
  const supabase = createServerComponentClient({ cookies })
  
  const { data: { user } } = await supabase.auth.getUser()
  
  // Step 1: Get the team_id from team_members table
  const { data: membershipData } = await supabase
    .from('team_members')
    .select('team_id')
    .eq('user_id', user?.id)
    .single()
  
  let team: Team | null = null;
    
  if (membershipData?.team_id) {
    // Step 2: Get the team details
    const { data: teamData } = await supabase
      .from('teams')
      .select('id, name, created_at')
      .eq('id', membershipData.team_id)
      .single()
      
    if (teamData) {
      // Step 3: Get all members of this team
      const { data: allTeamMembers } = await supabase
        .from('team_members')
        .select('user_id')
        .eq('team_id', teamData.id)
      
      // Build team structure
      team = {
        ...teamData,
        team_members: []
      };
      
      // Step 4: For each team member, get their details and skills
      if (allTeamMembers && allTeamMembers.length > 0) {
        const teamMembers: TeamMember[] = [];
        
        for (const member of allTeamMembers) {
          // Get user details
          const { data: userData } = await supabase
            .from('users')
            .select('id, full_name, bio, email, avatar_url')
            .eq('id', member.user_id)
            .single()
          
          if (userData) {
            // Create an array to hold the processed skills
            let processedSkills: Skill[] = [];
            
            // Try multiple approaches to get the skills data
            
            // Approach 1: Try student_skills table with direct join to skills
            const { data: skillsData, error: skillsError } = await supabase
              .from('student_skills')
              .select(`
                proficiency_level,
                skills (
                  name,
                  category
                )
              `)
              .eq('user_id', userData.id);
              
            if (skillsData && skillsData.length > 0 && !skillsError) {
              console.log(`Found ${skillsData.length} skills via approach 1 for ${userData.full_name}`);
              
              for (const skill of skillsData) {
                if (skill.skills) {
                  // Use type assertion to handle TypeScript errors
                  const skillInfo = skill.skills as { name?: string; category?: string };
                  processedSkills.push({
                    skill: {
                      name: skillInfo.name || 'Unknown',
                      category: skillInfo.category || 'Unknown'
                    },
                    proficiency_level: skill.proficiency_level || 1
                  });
                }
              }
            } else {
              // Approach 2: Try with a different field name convention
              const { data: skillsData2, error: skillsError2 } = await supabase
                .from('student_skills')
                .select(`
                  proficiency_level,
                  skill:skills (
                    name,
                    category
                  )
                `)
                .eq('user_id', userData.id);
                
              if (skillsData2 && skillsData2.length > 0 && !skillsError2) {
                console.log(`Found ${skillsData2.length} skills via approach 2 for ${userData.full_name}`);
                
                for (const skill of skillsData2) {
                  if (skill.skill) {
                    // Handle either array or object
                    const skillInfo = Array.isArray(skill.skill) ? skill.skill[0] : skill.skill;
                    
                    if (skillInfo) {
                      processedSkills.push({
                        skill: {
                          name: skillInfo.name || 'Unknown',
                          category: skillInfo.category || 'Unknown'
                        },
                        proficiency_level: skill.proficiency_level || 1
                      });
                    }
                  }
                }
              } else {
                // Approach 3: Try the skill_id approach with a join
                const { data: skillsData3, error: skillsError3 } = await supabase
                  .from('student_skills')
                  .select(`
                    skill_id,
                    proficiency_level
                  `)
                  .eq('user_id', userData.id);
                  
                if (skillsData3 && skillsData3.length > 0 && !skillsError3) {
                  console.log(`Found ${skillsData3.length} skill IDs for ${userData.full_name}, fetching skill details`);
                  
                  // Get the skill details for each skill_id
                  for (const skill of skillsData3) {
                    if (skill.skill_id) {
                      const { data: skillDetail } = await supabase
                        .from('skills')
                        .select('name, category')
                        .eq('id', skill.skill_id)
                        .single();
                        
                      if (skillDetail) {
                        processedSkills.push({
                          skill: {
                            name: skillDetail.name || 'Unknown',
                            category: skillDetail.category || 'Unknown'
                          },
                          proficiency_level: skill.proficiency_level || 1
                        });
                      }
                    }
                  }
                } else {
                  console.log(`No skills found for ${userData.full_name} in the database`);
                }
              }
            }
            
            // Get total number of skills found
            console.log(`Total skills found for ${userData.full_name}: ${processedSkills.length}`);
            
            teamMembers.push({
              user: {
                id: userData.id,
                full_name: userData.full_name,
                student_skills: processedSkills,
                bio: userData.bio || '',
                email: userData.email,
                avatar_url: userData.avatar_url
              }
            });
          }
        }
        
        team.team_members = teamMembers;
      }
    }
  }

  // Function to get skill level label
  const getSkillLevelLabel = (level: number) => {
    switch (level) {
      case 1: return "Beginner";
      case 2: return "Basic";
      case 3: return "Intermediate";
      case 4: return "Advanced";
      case 5: return "Expert";
      default: return "Unspecified";
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">My Team</h1>

      {team ? (
        <div className="space-y-8">
          {/* Team Header Card */}
          <Card className="p-6 border-indigo-200 bg-gradient-to-br from-white to-indigo-50">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{team.name}</h2>
                <div className="flex items-center mt-2 text-sm text-gray-600">
                  <Award className="h-4 w-4 mr-1 text-indigo-600" />
                  <span>Formed on {new Date(team.created_at).toLocaleDateString()}</span>
                </div>
              </div>
              <div className="h-16 w-16 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600">
                <Users className="h-8 w-8" />
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-200">
              <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Team Members</h3>
              <div className="mt-2 flex flex-wrap gap-2">
                {team.team_members.map((member, idx) => (
                  <div key={idx} className="flex items-center text-xs bg-indigo-50 rounded-full px-3 py-1">
                    <div className="w-4 h-4 bg-indigo-200 rounded-full mr-1"></div>
                    {member.user.full_name}
                  </div>
                ))}
              </div>
            </div>
          </Card>

          {/* Team Members */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {team.team_members.map((member, index) => (
              <Card key={member.user.id || index} className="overflow-hidden border-0 shadow-md hover:shadow-lg transition-shadow">
                <div className="flex flex-col h-full">
                  {/* Member Header */}
                  <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-4">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        {member.user.avatar_url ? (
                          <div className="h-16 w-16 rounded-full border-2 border-white overflow-hidden">
                            <img 
                              src={member.user.avatar_url} 
                              alt={member.user.full_name}
                              className="h-full w-full object-cover"
                            />
                          </div>
                        ) : (
                          <div className="h-16 w-16 rounded-full bg-white text-indigo-700 flex items-center justify-center border-2 border-indigo-200">
                            <span className="text-xl font-bold">{member.user.full_name.charAt(0)}</span>
                          </div>
                        )}
                      </div>
                      <div className="ml-4 text-white">
                        <h4 className="text-lg font-semibold flex items-center">
                          {member.user.full_name}
                          {member.user.id === user?.id && (
                            <span className="ml-2 text-xs bg-white text-indigo-600 rounded-full px-2 py-0.5">You</span>
                          )}
                        </h4>
                        {member.user.email && (
                          <div className="text-indigo-100 text-sm flex items-center mt-1">
                            <Mail className="h-3 w-3 mr-1" />
                            {member.user.email}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Member Body */}
                  <div className="p-5 flex-1 flex flex-col">
                    {/* Bio Section */}
                    {member.user.bio && (
                      <div className="mb-4">
                        <h5 className="text-xs uppercase text-gray-500 tracking-wider mb-2 font-medium flex items-center">
                          <Briefcase className="h-3 w-3 mr-1" /> About
                        </h5>
                        <p className="text-gray-700 text-sm">{member.user.bio}</p>
                      </div>
                    )}

                    {/* Skills Section */}
                    <div className="mt-auto">
                      <h5 className="text-xs uppercase text-gray-500 tracking-wider mb-3 font-medium flex items-center">
                        <Sparkles className="h-3 w-3 mr-1" /> Skills & Expertise
                      </h5>
                      
                      {member.user.student_skills && member.user.student_skills.length > 0 ? (
                        <div className="space-y-3">
                          {member.user.student_skills.map((skill, idx) => (
                            <div key={idx} className="group">
                              <div className="flex justify-between items-center text-sm mb-1">
                                <span className="font-medium text-gray-700">{skill.skill.name}</span>
                                <span className="text-xs text-gray-500">
                                  {getSkillLevelLabel(skill.proficiency_level)}
                                </span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-2">
                                <div 
                                  className="h-2 rounded-full bg-indigo-600 transition-all group-hover:bg-indigo-500"
                                  style={{ width: `${(skill.proficiency_level / 5) * 100}%` }}
                                ></div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="flex items-center justify-center py-4 bg-gray-50 rounded-md border border-dashed border-gray-300">
                          <p className="text-sm text-gray-500">No skills listed in profile</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      ) : (
        <Card className="p-8 text-center border-0 shadow-md">
          <div className="flex flex-col items-center justify-center py-6">
            <div className="bg-gray-100 rounded-full p-6 mb-6">
              <Users className="h-12 w-12 text-gray-400" />
            </div>
            <h3 className="text-2xl font-medium text-gray-900 mb-3">Not Assigned to a Team Yet</h3>
            <p className="text-gray-600 max-w-md mx-auto mb-6">
              You haven't been assigned to a team yet. Make sure your profile is complete and you're marked as available for team formation.
            </p>
            <button className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors">
              Update Profile
            </button>
          </div>
        </Card>
      )}
    </div>
  )
} 