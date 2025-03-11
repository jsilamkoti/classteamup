'use client'

import { useState, useEffect } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Card } from '@/components/ui/Card'
import Button from '@/components/ui/Button'

export default function DebugPage() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [dbInfo, setDbInfo] = useState<any>(null)
  const supabase = createClientComponentClient()

  useEffect(() => {
    loadDatabaseInfo()
  }, [])

  const loadDatabaseInfo = async () => {
    try {
      setLoading(true)
      setError(null)

      const { data: { session }, error: authError } = await supabase.auth.getSession()
      if (authError) throw authError
      if (!session) throw new Error('Not authenticated')

      const response = await fetch('/api/debug/database-info', {
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to load database info')
      }

      const data = await response.json()
      setDbInfo(data.tables)
      console.log('Database info:', data)

    } catch (err: any) {
      console.error('Error loading database info:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-4">
        <div className="bg-red-50 text-red-700 p-4 rounded-md">
          <p className="font-medium">Error:</p>
          <p>{error}</p>
          <Button
            onClick={loadDatabaseInfo}
            className="mt-4"
          >
            Try Again
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Database Structure</h1>
      
      {dbInfo && Object.entries(dbInfo).map(([tableName, info]: [string, any]) => (
        <Card key={tableName} className="mb-6 p-6">
          <h2 className="text-xl font-semibold mb-4">{tableName}</h2>
          
          {info.error ? (
            <div className="text-red-600">
              Error: {info.error}
            </div>
          ) : (
            <>
              <h3 className="font-medium mb-2">Columns:</h3>
              <div className="grid grid-cols-3 gap-2">
                {info.columns.map((column: string) => (
                  <div 
                    key={column}
                    className="bg-gray-50 p-2 rounded"
                  >
                    {column}
                  </div>
                ))}
              </div>
            </>
          )}
        </Card>
      ))}
    </div>
  )
} 