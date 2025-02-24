'use client'

import { useState } from 'react'
import Button from '@/components/ui/Button'

export default function FindTeamButton() {
  const handleFindTeam = async () => {
    // Your team finding logic here
  }

  return (
    <Button 
      onClick={handleFindTeam}
      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
    >
      Find a Team
    </Button>
  )
} 