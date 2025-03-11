import React from 'react'
import { Users } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Link from 'next/link'

interface ViewTeamCardProps {
  hasTeam: boolean
}

export default function ViewTeamCard({ hasTeam = false }: ViewTeamCardProps) {
  return (
    <Card className="h-full p-6 flex flex-col justify-between">
      <div>
        <div className="flex items-center space-x-3 mb-4">
          <Users className="h-8 w-8 text-blue-600" />
          <h3 className="text-xl font-medium">View Team</h3>
        </div>
        <p className="text-gray-600 mb-4">
          {hasTeam 
            ? "View your current team details and members" 
            : "You're not part of a team yet"}
        </p>
      </div>
      
      <Link href="/student-dashboard/my-team" passHref>
        <Button variant="primary" fullWidth className="mt-2">
          View Team
        </Button>
      </Link>
    </Card>
  )
} 