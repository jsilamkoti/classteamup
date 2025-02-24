'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import { TeamFormationService } from '@/services/teamFormation'
import { toast } from 'react-hot-toast'

export default function TeamFormation() {
  const [loading, setLoading] = useState(false)
  const [rules, setRules] = useState({
    minTeamSize: 3,
    maxTeamSize: 5,
    courseId: '' // This should be populated from course selection
  })

  const handleFormTeams = async () => {
    setLoading(true)
    try {
      const service = new TeamFormationService()
      await service.formTeams(rules)
      toast.success('Teams have been formed successfully!')
    } catch (error: any) {
      console.error('Error forming teams:', error)
      toast.error(error.message || 'Failed to form teams')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Team Formation</h1>
      
      <Card className="p-6 space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Minimum Team Size
          </label>
          <input
            type="number"
            value={rules.minTeamSize}
            onChange={(e) => setRules({ ...rules, minTeamSize: parseInt(e.target.value) })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            min={2}
            max={rules.maxTeamSize}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Maximum Team Size
          </label>
          <input
            type="number"
            value={rules.maxTeamSize}
            onChange={(e) => setRules({ ...rules, maxTeamSize: parseInt(e.target.value) })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            min={rules.minTeamSize}
          />
        </div>

        <Button
          onClick={handleFormTeams}
          disabled={loading}
          className="w-full"
        >
          {loading ? 'Forming Teams...' : 'Form Teams'}
        </Button>
      </Card>
    </div>
  )
} 