'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/Card'
import { Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase'
import type { TeamFormationRule } from '@/lib/utils/teamRules'

interface Student {
  id: string
  full_name: string
  user_skills: {
    skill_id: string
    proficiency_level: number
    skills: {
      name: string
    }
  }[]
}

interface Enrollment {
  student: {
    id: string;
    full_name: string;
    user_skills: {
      skill_id: string;
      proficiency_level: number;
      skills: {
        name: string;
      };
    }[];
  };
}

interface TeamPreviewProps {
  rules: TeamFormationRule
  courseId: string
}

interface PreviewStats {
  totalStudents: number
  possibleTeams: number
  averageTeamSize: number
  skillCoverage: {
    skillId: string
    skillName: string
    coverage: number
    requiredCount: number
    availableCount: number
  }[]
}

export default function TeamPreview({ rules, courseId }: TeamPreviewProps) {
  const [stats, setStats] = useState<PreviewStats | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    const calculatePreview = async () => {
      setLoading(true)
      try {
        // Fetch students enrolled in the course
        const { data: students, error: studentsError } = await supabase
          .from('course_enrollments')
          .select(`
            student:user_id (
              id,
              full_name,
              user_skills (
                skill_id,
                proficiency_level,
                skills (
                  name
                )
              )
            )
          `) as { data: Enrollment[], error: any }

        if (studentsError) throw studentsError

        const enrolledStudents = students.map(e => ({
          id: e.student.id,
          full_name: e.student.full_name,
          user_skills: e.student.user_skills
        })) as Student[]
        
        // Calculate skill coverage
        const skillCoverage = rules.required_skills.map(requirement => {
          const studentsWithSkill = enrolledStudents.filter(student =>
            student.user_skills.some(skill =>
              skill.skill_id === requirement.skillId &&
              skill.proficiency_level >= requirement.minProficiency
            )
          )

          const skillName = studentsWithSkill[0]?.user_skills.find(
            s => s.skill_id === requirement.skillId
          )?.skills.name || 'Unknown Skill'

          return {
            skillId: requirement.skillId,
            skillName,
            coverage: studentsWithSkill.length / enrolledStudents.length,
            requiredCount: requirement.minCount * Math.ceil(enrolledStudents.length / rules.max_team_size),
            availableCount: studentsWithSkill.length
          }
        })

        const stats: PreviewStats = {
          totalStudents: enrolledStudents.length,
          possibleTeams: Math.floor(enrolledStudents.length / rules.min_team_size),
          averageTeamSize: enrolledStudents.length / Math.ceil(enrolledStudents.length / rules.max_team_size),
          skillCoverage
        }

        setStats(stats)
      } catch (error) {
        console.error('Error calculating preview:', error)
      } finally {
        setLoading(false)
      }
    }

    if (courseId && rules.required_skills.length > 0) {
      calculatePreview()
    }
  }, [rules, courseId])

  if (loading) {
    return (
      <div className="flex justify-center items-center h-48">
        <Loader2 className="animate-spin h-8 w-8 text-indigo-600" />
      </div>
    )
  }

  if (!stats) return null

  return (
    <Card className="p-6">
      <h2 className="text-lg font-medium text-gray-900 mb-4">Team Formation Preview</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-medium text-gray-500">Overview</h3>
            <div className="mt-2 grid grid-cols-2 gap-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-500">Total Students</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.totalStudents}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-500">Possible Teams</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.possibleTeams}</p>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-500">Team Size</h3>
            <div className="mt-2 bg-gray-50 p-4 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">Average Size</span>
                <span className="text-lg font-medium text-gray-900">
                  {stats.averageTeamSize.toFixed(1)}
                </span>
              </div>
              <div className="mt-2 h-2 bg-gray-200 rounded-full">
                <div 
                  className="h-2 bg-indigo-600 rounded-full"
                  style={{ 
                    width: `${(stats.averageTeamSize / rules.max_team_size) * 100}%`
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-sm font-medium text-gray-500 mb-2">Skill Requirements Coverage</h3>
          <div className="space-y-3">
            {stats?.skillCoverage.map(skill => (
              <div key={skill.skillId} className="bg-gray-50 p-3 rounded-lg">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm text-gray-900">{skill.skillName}</span>
                  <span className="text-sm font-medium text-gray-900">
                    {skill.availableCount} / {skill.requiredCount} students
                  </span>
                </div>
                <div className="h-2 bg-gray-200 rounded-full">
                  <div 
                    className={`h-2 rounded-full ${
                      skill.availableCount >= skill.requiredCount 
                        ? 'bg-green-500' 
                        : 'bg-yellow-500'
                    }`}
                    style={{ 
                      width: `${Math.min((skill.availableCount / skill.requiredCount) * 100, 100)}%`
                    }}
                  />
                </div>
                {skill.availableCount < skill.requiredCount && (
                  <p className="mt-1 text-xs text-red-600">
                    Shortage: {skill.requiredCount - skill.availableCount} students needed
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </Card>
  )
} 