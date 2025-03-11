'use client'

import React from 'react'
import { Search } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Link from 'next/link'

interface BrowseStudentsCardProps {
  completionPercentage: number
}

export default function BrowseStudentsCard({ completionPercentage }: BrowseStudentsCardProps) {
  return (
    <Card className="h-full p-6 flex flex-col justify-between">
      <div>
        <div className="flex items-center space-x-3 mb-4">
          <Search className="h-8 w-8 text-purple-600" />
          <h3 className="text-xl font-medium">Browse Students</h3>
        </div>
        <p className="text-gray-600 mb-4">
          Find other students with complementary skills
        </p>
      </div>
      
      <Link href="/student-dashboard/browse" passHref>
        <Button variant="primary" fullWidth className="mt-2">
          Browse Students
        </Button>
      </Link>
    </Card>
  )
} 