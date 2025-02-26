'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import { Search, Filter } from 'lucide-react'
import FilterSidebar from '@/components/browse/FilterSidebar'
import { toast } from 'react-hot-toast'
import StudentProfileModal from '@/components/students/StudentProfileModal'
import TeamInviteButton from '@/components/teams/TeamInviteButton'

interface SkillData {
  skill_id: string;
  proficiency_level: number;
  skills: {
    name: string;
  };
}

interface UserData {
  id: string;
  full_name: string;
  avatar_url?: string;
  bio?: string;
  availability?: string;
  user_skills: {
    skill_id: string;
    proficiency_level: number;
    skills: {
      name: string;
    };
  }[];
}

interface Student {
  id: string
  full_name: string
  avatar_url?: string
  bio?: string
  skills?: { skill_id: string; name: string; proficiency_level: number }[]
  availability?: string
}

interface FilterState {
  skills: string[]
  proficiencyLevel: number | null
  availability: string | null
}

interface Skill {
  skill_id: string;
  name: string;
  proficiency_level: number;
}

export default function BrowseStudentsPage() {
  const [students, setStudents] = useState<any[]>([])
  const [filteredStudents, setFilteredStudents] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [filters, setFilters] = useState<FilterState>({
    skills: [],
    proficiencyLevel: null,
    availability: null
  })
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null)
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        setLoading(true)
        
        // Get current user
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        // Get all students except current user who are looking for teams
        const { data: users, error } = await supabase
          .from('users')
          .select('*')
          .eq('role', 'student')
          .eq('looking_for_team', true)  // Only get students looking for teams
          .neq('id', user.id)  // Exclude current user

        if (error) {
          console.error('Database error:', error.message)
          toast.error(`Failed to load students: ${error.message}`)
          return
        }

        // Then, for each student, get their skills
        const studentsWithSkills = await Promise.all(
          users.map(async (user) => {
            const { data: skills } = await supabase
              .from('student_skills')
              .select(`
                skill_id,
                proficiency_level,
                skills (
                  name
                )
              `)
              .eq('user_id', user.id)

            return {
              ...user,
              skills: skills?.map((skill: any) => ({
                skill_id: skill.skill_id,
                name: skill.skills.name,
                proficiency_level: skill.proficiency_level
              })) || []
            }
          })
        )

        setStudents(studentsWithSkills)
        setFilteredStudents(studentsWithSkills)
      } catch (error: any) {
        console.error('Error:', error)
        toast.error(error.message || 'Something went wrong. Please try again.')
      } finally {
        setLoading(false)
      }
    }

    fetchStudents()
  }, [])

  // Apply search and filters
  useEffect(() => {
    let result = [...students]

    // Apply search
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      result = result.filter(student => 
        student.full_name.toLowerCase().includes(query) ||
        student.bio?.toLowerCase().includes(query) ||
        student.skills?.some((skill: Skill) => skill.name.toLowerCase().includes(query))
      )
    }

    // Apply skill filters
    if (filters.skills.length > 0) {
      result = result.filter(student =>
        student.skills?.some((skill: Skill) =>
          filters.skills.includes(skill.skill_id)
        )
      )
    }

    // Apply proficiency filter
    if (filters.proficiencyLevel !== null) {
      result = result.filter(student =>
        student.skills?.some((skill: Skill) =>
          skill.proficiency_level >= filters.proficiencyLevel!
        )
      )
    }

    // Apply availability filter
    if (filters.availability) {
      result = result.filter(student =>
        student.availability === filters.availability
      )
    }

    setFilteredStudents(result)
  }, [searchQuery, filters, students])

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Browse Students</h1>
        
        {/* Search and Filter Bar */}
        <div className="flex space-x-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Search students..."
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Search className="h-5 w-5 text-gray-400 absolute left-3 top-2.5" />
          </div>
          <button 
            onClick={() => setIsFilterOpen(true)}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            <Filter className="h-5 w-5 mr-2" />
            Filters
          </button>
        </div>
      </div>

      {/* Filter Sidebar */}
      <FilterSidebar
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        onFilterChange={setFilters}
      />

      {/* Students Grid */}
      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-indigo-500 border-r-transparent"></div>
          <p className="mt-4 text-gray-500">Loading students...</p>
        </div>
      ) : filteredStudents.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">No students found matching your criteria.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredStudents.map((student) => (
            <div
              key={student.id}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center space-x-4">
                <div className="h-12 w-12 rounded-full bg-gray-200 flex-shrink-0">
                  {student.avatar_url ? (
                    <img
                      src={student.avatar_url}
                      alt={student.full_name}
                      className="h-12 w-12 rounded-full object-cover"
                    />
                  ) : (
                    <div className="h-12 w-12 rounded-full bg-indigo-600 flex items-center justify-center">
                      <span className="text-white text-lg font-medium">
                        {student.full_name[0]}
                      </span>
                    </div>
                  )}
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-900">
                    {student.full_name}
                  </h3>
                  {student.bio && (
                    <p className="text-sm text-gray-500 line-clamp-2">
                      {student.bio}
                    </p>
                  )}
                </div>
              </div>

              {/* Skills */}
              {student.skills && student.skills.length > 0 && (
                <div className="mt-4">
                  <div className="flex flex-wrap gap-2">
                    {student.skills.map((skill: Skill, index: number) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800"
                      >
                        {skill.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="mt-6 flex justify-end space-x-3">
                <button 
                  onClick={() => {
                    setSelectedStudent(student)
                    setIsProfileModalOpen(true)
                  }}
                  className="text-sm text-indigo-600 hover:text-indigo-900"
                >
                  View Profile
                </button>
                <TeamInviteButton 
                  studentId={student.id}
                  studentName={student.full_name}
                />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add the modal */}
      <StudentProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => {
          setIsProfileModalOpen(false)
          setSelectedStudent(null)
        }}
        student={selectedStudent}
      />
    </div>
  )
} 