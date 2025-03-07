'use client'

import { useState, useEffect } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Card } from '@/components/ui/Card'
import { Search, Filter, Users } from 'lucide-react'
import Button from '@/components/ui/Button'
import Link from 'next/link'

interface Skill {
  id: string;
  name: string;
  category: string;
}

interface StudentSkill {
  skill: Skill;
  proficiency_level: number;
}

interface Student {
  id: string;
  full_name: string;
  email: string;
  bio: string;
  looking_for_team: boolean;
  student_skills: StudentSkill[];
}

export default function BrowseStudentsPage() {
  const supabase = createClientComponentClient()
  const [students, setStudents] = useState<Student[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [skills, setSkills] = useState<Skill[]>([])
  const [selectedSkill, setSelectedSkill] = useState<string>('')
  const [error, setError] = useState<string | null>(null)
  const [debugInfo, setDebugInfo] = useState<string[]>([])

  useEffect(() => {
    async function loadStudents() {
      try {
        setLoading(true)
        addDebug('Starting to load students data')
        
        // Get current user
        const { data: { user }, error: userError } = await supabase.auth.getUser()
        
        if (userError) {
          console.error('Auth error:', userError.message)
          setError('Authentication error: ' + userError.message)
          addDebug(`Auth error: ${userError.message}`)
          return
        }

        addDebug(`Current user: ${user?.id}`)

        // First load all available skills for filtering
        const { data: skillsData, error: skillsError } = await supabase
          .from('skills')
          .select('id, name, category')
          .order('category')
          .order('name')
        
        if (skillsError) {
          addDebug(`Skills error: ${skillsError.message}`)
        } else {
          addDebug(`Loaded ${skillsData?.length || 0} skills`)
          setSkills(skillsData || [])
        }

        // Fetch all students except current user
        addDebug('Fetching students')
        const { data: studentsData, error: studentsError } = await supabase
          .from('users')
          .select('id, full_name, email, bio, looking_for_team')
          .eq('role', 'student')
          .neq('id', user?.id)
        
        if (studentsError) {
          console.error('Error fetching students:', studentsError)
          setError('Could not load student data: ' + studentsError.message)
          addDebug(`Student fetch error: ${studentsError.message}`)
          return
        }

        addDebug(`Loaded ${studentsData?.length || 0} students`)
        
        // For each student, fetch their skills separately
        const studentsWithSkills = []
        
        for (const student of (studentsData || [])) {
          addDebug(`Loading skills for student ${student.id}`)
          
          const { data: studentSkills, error: skillsError } = await supabase
            .from('student_skills')
            .select(`
              proficiency_level,
              skill:skills (
                id,
                name,
                category
              )
            `)
            .eq('user_id', student.id)
          
          if (skillsError) {
            addDebug(`Error loading skills for ${student.id}: ${skillsError.message}`)
          }
          
          studentsWithSkills.push({
            ...student,
            student_skills: studentSkills || []
          })
        }
        
        addDebug('Finished loading all students with skills')
        setStudents(studentsWithSkills)
      } catch (err) {
        console.error('Unexpected error:', err)
        setError('Failed to load students: ' + (err instanceof Error ? err.message : String(err)))
        addDebug(`Unexpected error: ${err instanceof Error ? err.message : String(err)}`)
      } finally {
        setLoading(false)
      }
    }

    function addDebug(message: string) {
      console.log(message)
      setDebugInfo(prev => [...prev, message])
    }

    loadStudents()
  }, [supabase])

  // Filter students based on search query and selected skill
  const filteredStudents = students.filter(student => {
    const matchesSearch = searchQuery === '' || 
      student.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (student.bio && student.bio.toLowerCase().includes(searchQuery.toLowerCase()))
    
    const matchesSkill = selectedSkill === '' || 
      (student.student_skills && student.student_skills.some(
        s => s.skill.id === selectedSkill
      ))
    
    // Only include students who are looking for a team
    const isLookingForTeam = student.looking_for_team === true
    
    return matchesSearch && matchesSkill && isLookingForTeam
  })

  return (
    <div className="w-full mx-auto px-4 sm:px-6 py-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-4 sm:mb-0">Browse Students</h1>
        
        <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search students..."
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-md w-full sm:w-64"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Filter className="h-5 w-5 text-gray-400" />
            </div>
            <select
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-md w-full appearance-none"
              value={selectedSkill}
              onChange={(e) => setSelectedSkill(e.target.value)}
            >
              <option value="">All Skills</option>
              {skills.map(skill => (
                <option key={skill.id} value={skill.id}>
                  {skill.name} ({skill.category})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="p-6">
              <div className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-5/6 mb-4"></div>
                <div className="flex flex-wrap gap-2 mb-4">
                  <div className="h-6 bg-gray-200 rounded w-16"></div>
                  <div className="h-6 bg-gray-200 rounded w-20"></div>
                  <div className="h-6 bg-gray-200 rounded w-24"></div>
                </div>
                <div className="h-8 bg-indigo-100 rounded"></div>
              </div>
            </Card>
          ))}
        </div>
      ) : error ? (
        <Card className="p-6">
          <div className="flex flex-col items-center justify-center py-12">
            <div className="bg-red-100 p-3 rounded-full mb-4">
              <svg className="h-8 w-8 text-red-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-medium text-gray-900 mb-2">Error Loading Students</h3>
            <p className="text-red-500 text-center mb-4">{error}</p>
            <Button onClick={() => window.location.reload()}>Try Again</Button>
            
            {/* Debug information */}
            <div className="mt-6 w-full max-w-xl">
              <details>
                <summary className="text-sm text-gray-500 cursor-pointer">Show debug information</summary>
                <pre className="mt-2 p-3 text-xs bg-gray-100 rounded-md overflow-x-auto whitespace-pre-wrap">
                  {debugInfo.join('\n')}
                </pre>
              </details>
            </div>
          </div>
        </Card>
      ) : filteredStudents.length === 0 ? (
        <Card className="p-6">
          <div className="flex flex-col items-center justify-center py-12">
            <div className="bg-gray-100 p-3 rounded-full mb-4">
              <Users className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-xl font-medium text-gray-900 mb-2">No Students Found</h3>
            <p className="text-gray-600 text-center max-w-md mb-4">
              {searchQuery || selectedSkill ? 
                "No students match your current filters. Try adjusting your search criteria." :
                "There are no students currently looking for a team. Check back later!"}
            </p>
            {(searchQuery || selectedSkill) && (
              <Button 
                onClick={() => {
                  setSearchQuery('')
                  setSelectedSkill('')
                }}
              >
                Clear Filters
              </Button>
            )}
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredStudents.map(student => (
            <Card key={student.id} className="p-6 flex flex-col justify-between h-full">
              <div>
                <h2 className="text-lg font-bold text-gray-900 mb-1">{student.full_name}</h2>
                
                <div className="flex items-center mb-3">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Looking for Team
                  </span>
                </div>
                
                {student.bio && (
                  <p className="text-sm text-gray-600 mb-4 line-clamp-3">{student.bio}</p>
                )}
                
                {student.student_skills && student.student_skills.length > 0 && (
                  <div className="mb-4">
                    <p className="text-xs text-gray-500 mb-1">Skills:</p>
                    <div className="flex flex-wrap gap-2">
                      {student.student_skills.map((skillData, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800"
                        >
                          {skillData.skill.name} ({skillData.proficiency_level})
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              
              <Link href={`/student-dashboard/profile/${student.id}`} passHref>
                <Button variant="primary" fullWidth className="mt-2">
                  View Profile
                </Button>
              </Link>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
} 