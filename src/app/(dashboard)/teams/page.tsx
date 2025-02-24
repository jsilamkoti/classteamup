import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { Card } from '@/components/ui/Card'

export const dynamic = 'force-dynamic'

interface Skill {
  skill: {
    id: string
    name: string
    category: string
  }
  proficiency_level: number
}

interface TeamMember {
  user: {
    id: string
    full_name: string
    student_skills: Skill[]
  }
}

export default async function TeamsPage() {
  const supabase = createServerComponentClient({ cookies })
  
  const { data: { user } } = await supabase.auth.getUser()
  
  // Fetch teams based on user role
  const { data: teams } = await supabase
    .from('teams')
    .select(`
      *,
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
    `)
    .order('created_at', { ascending: false })

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Teams</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {teams?.map((team) => (
          <Card key={team.id} className="p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">{team.name}</h3>
            
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-gray-700">Team Members:</h4>
              <ul className="space-y-2">
                {team.team_members.map((member: TeamMember) => (
                  <li key={member.user.id} className="text-sm text-gray-600">
                    {member.user.full_name}
                    <div className="text-xs text-gray-500 ml-4">
                      {member.user.student_skills.map((skill: Skill) => (
                        <span key={skill.skill.id} className="inline-block bg-gray-100 rounded-full px-2 py-1 mr-1 mb-1">
                          {skill.skill.name} (Level {skill.proficiency_level})
                        </span>
                      ))}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
} 