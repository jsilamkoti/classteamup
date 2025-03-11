import TeamsList from '@/components/Teams/TeamsList'

export default function ViewTeamsPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">My Team</h1>
      <TeamsList userRole="student" />
    </div>
  )
} 