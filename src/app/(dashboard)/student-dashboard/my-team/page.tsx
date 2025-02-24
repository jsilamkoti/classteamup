import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { Card } from '@/components/ui/Card'
import { Users, Award } from 'lucide-react'

export const dynamic = 'force-dynamic'

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
  
  // Get user's team
  const { data: teamMembership } = await supabase
    .from('team_members')
    .select(`
      team:teams (
        id,
        name,
        created_at,
        team_members (
          user:users (
            id,
            full_name,
            student_skills (
              skill:skills (
                name,
                category
              ),
              proficiency_level
            )
          )
        )
      )
    `)
    .eq('user_id', user?.id)
    .single()

  const team = teamMembership?.team as unknown as Team;

  if (!team) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">My Team</h1>
        
        <Card className="p-6 text-center">
          <Users className="h-12 w-12 mx-auto text-gray-400 mb-4" />
          <h2 className="text-lg font-medium text-gray-900 mb-2">
            Not Assigned to a Team Yet
          </h2>
          <p className="text-sm text-gray-500">
            You haven't been assigned to a team yet. Make sure your profile is complete and you're marked as available for team formation.
          </p>
        </Card>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">My Team</h1>

      <div className="space-y-6">
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-gray-900">{team.name}</h2>
              <p className="text-sm text-gray-500">
                Formed on {new Date(team.created_at).toLocaleDateString()}
              </p>
            </div>
            <Award className="h-8 w-8 text-indigo-600" />
          </div>

          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Team Members</h3>
              <div className="space-y-4">
                {team.team_members.map((member) => (
                  <div key={member.user.id} className="border rounded-lg p-4">
                    <h4 className="font-medium text-gray-900">
                      {member.user.full_name}
                      {member.user.id === user?.id && ' (You)'}
                    </h4>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {member.user.student_skills.map((skill) => (
                        <span
                          key={skill.skill.name}
                          className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800"
                        >
                          {skill.skill.name} (Level {skill.proficiency_level})
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
} 