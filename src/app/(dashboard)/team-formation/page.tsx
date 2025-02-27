'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import { Card } from '@/components/ui/Card'
import { toast } from 'react-hot-toast'
import { Plus, X, Save, Loader2 } from 'lucide-react'
import { validateTeamRules } from '@/lib/utils/teamRules'
import TeamPreview from '@/components/teams/TeamPreview'

interface Skill {
  id: string
  name: string
}

interface SkillRequirement {
  skillId: string
  minCount: number
  minProficiency: number
}

interface TeamRules {
  teamSize: {
    min: number
    max: number
  }
  skillRequirements: SkillRequirement[]
  diversityWeight: number
  academicLevelBalance: boolean
}

interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

interface TeamFormationRule {
  id: string;
  course_id: string;
  min_team_size: number;
  max_team_size: number;
  required_skills: {
    skillId: string;
    minCount: number;
    minProficiency: number;
  }[];
  skill_distribution_rules: {
    diversityWeight: number;
    academicLevelBalance: boolean;
  };
  created_at: string;
}

interface Course {
  id: string
  name: string
  code: string
}

export default function TeamFormationPage() {
  const [courses, setCourses] = useState<Course[]>([])
  const [skills, setSkills] = useState<Skill[]>([])
  const [loading, setLoading] = useState(false)
  const [validation, setValidation] = useState<ValidationResult>({
    isValid: true,
    errors: [],
    warnings: []
  });
  const [formationRule, setFormationRule] = useState<TeamFormationRule>({
    id: '',
    course_id: '',
    min_team_size: 3,
    max_team_size: 5,
    required_skills: [],
    skill_distribution_rules: {
      diversityWeight: 0.5,
      academicLevelBalance: true
    },
    created_at: new Date().toISOString()
  });
  const [isSaving, setIsSaving] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()

  // Fetch courses
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        const { data, error } = await supabase
          .from('courses')
          .select('id, name, code')
          .eq('instructor_id', user.id)

        if (error) throw error
        setCourses(data || [])

        // If courses exist, set the first course as default
        if (data && data.length > 0) {
          setFormationRule(prev => ({
            ...prev,
            course_id: data[0].id
          }))
          
          // Fetch existing rules for this course
          fetchExistingRules(data[0].id)
        }
      } catch (error) {
        console.error('Error fetching courses:', error)
        toast.error('Failed to load courses')
      }
    }

    fetchCourses()
  }, [])

  // Fetch existing rules when course changes
  const fetchExistingRules = async (courseId: string) => {
    try {
      const { data, error } = await supabase
        .from('team_formation_rules')
        .select('*')
        .eq('course_id', courseId)
        .single()

      if (error && error.code !== 'PGRST116') { // Not found error
        throw error
      }

      if (data) {
        setFormationRule(data)
      }
    } catch (error) {
      console.error('Error fetching rules:', error)
      toast.error('Failed to load existing rules')
    }
  }

  // Fetch available skills
  useEffect(() => {
    const fetchSkills = async () => {
      const { data, error } = await supabase
        .from('skills')
        .select('id, name')
        .order('name')

      if (error) {
        toast.error('Failed to load skills')
        return
      }

      setSkills(data || [])
    }

    fetchSkills()
  }, [])

  // Update validation whenever rules change
  useEffect(() => {
    setValidation(validateTeamRules(formationRule));
  }, [formationRule]);

  // Load rules when course changes
  useEffect(() => {
    if (!formationRule.course_id) return
    
    const loadRules = async () => {
      setIsLoading(true)
      try {
        const { data, error } = await supabase
          .from('team_formation_rules')
          .select('*')
          .eq('course_id', formationRule.course_id)
          .maybeSingle()

        if (error) throw error

        if (data) {
          setFormationRule(data)
        } else {
          // Reset to defaults if no rules exist
          setFormationRule(prev => ({
            ...prev,
            min_team_size: 3,
            max_team_size: 5,
            required_skills: [],
            skill_distribution_rules: {
              diversityWeight: 0.5,
              academicLevelBalance: true
            }
          }))
        }
      } catch (error) {
        console.error('Error loading rules:', error)
        toast.error('Failed to load course rules')
      } finally {
        setIsLoading(false)
      }
    }

    loadRules()
  }, [formationRule.course_id])

  const handleSaveRules = async () => {
    const validation = validateTeamRules(formationRule)
    if (!validation.isValid) {
      validation.errors.forEach(error => toast.error(error))
      return
    }

    setIsSaving(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        toast.error('Please sign in to save rules')
        return
      }

      const { error } = await supabase
        .from('team_formation_rules')
        .upsert({
          course_id: formationRule.course_id,
          min_team_size: formationRule.min_team_size,
          max_team_size: formationRule.max_team_size,
          required_skills: formationRule.required_skills,
          skill_distribution_rules: formationRule.skill_distribution_rules
        }, {
          onConflict: 'course_id'
        })

      if (error) throw error
      toast.success('Rules saved successfully')
    } catch (error) {
      console.error('Error saving rules:', error)
      toast.error('Failed to save rules')
    } finally {
      setIsSaving(false)
    }
  }

  const addSkillRequirement = () => {
    if (skills.length === 0) return

    setFormationRule(prev => ({
      ...prev,
      required_skills: [
        ...prev.required_skills,
        {
          skillId: skills[0].id,
          minCount: 1,
          minProficiency: 3
        }
      ]
    }))
  }

  const removeSkillRequirement = (index: number) => {
    setFormationRule(prev => ({
      ...prev,
      required_skills: prev.required_skills.filter((_, i) => i !== index)
    }))
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Team Formation Rules</h1>
        <button
          onClick={handleSaveRules}
          disabled={isSaving || !formationRule.course_id}
          className={`inline-flex items-center px-4 py-2 text-white bg-indigo-600 rounded-md 
            ${(isSaving || !formationRule.course_id) ? 'opacity-50 cursor-not-allowed' : 'hover:bg-indigo-700'}`}
        >
          {isSaving ? (
            <>
              <Loader2 className="animate-spin -ml-1 mr-2 h-5 w-5" />
              Saving...
            </>
          ) : (
            <>
              <Save className="-ml-1 mr-2 h-5 w-5" />
              Save Rules
            </>
          )}
        </button>
      </div>

      {/* Loading State */}
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="animate-spin h-8 w-8 text-indigo-600" />
        </div>
      ) : (
        <>
          {/* Course Selection */}
          <Card className="p-6 mb-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Select Course</h2>
            <select
              value={formationRule.course_id}
              onChange={(e) => {
                setFormationRule(prev => ({
                  ...prev,
                  course_id: e.target.value
                }))
                fetchExistingRules(e.target.value)
              }}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            >
              {courses.length === 0 && (
                <option value="">No courses available</option>
              )}
              {courses.map(course => (
                <option key={course.id} value={course.id}>
                  {course.code} - {course.name}
                </option>
              ))}
            </select>
          </Card>

          {/* Validation Messages */}
          {(validation.errors.length > 0 || validation.warnings.length > 0) && (
            <div className="mb-6 space-y-4">
              {validation.errors.map((error, index) => (
                <div key={index} className="p-3 bg-red-50 border border-red-200 rounded-md">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              ))}
              {validation.warnings.map((warning, index) => (
                <div key={index} className="p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                  <p className="text-sm text-yellow-600">{warning}</p>
                </div>
              ))}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Team Size Rules */}
            <Card className="p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Team Size</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Minimum Team Size
                  </label>
                  <input
                    type="number"
                    min={2}
                    max={formationRule.max_team_size}
                    value={formationRule.min_team_size}
                    onChange={(e) => setFormationRule(prev => ({
                      ...prev,
                      min_team_size: parseInt(e.target.value)
                    }))}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Maximum Team Size
                  </label>
                  <input
                    type="number"
                    min={formationRule.min_team_size}
                    max={10}
                    value={formationRule.max_team_size}
                    onChange={(e) => setFormationRule(prev => ({
                      ...prev,
                      max_team_size: parseInt(e.target.value)
                    }))}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  />
                </div>
              </div>
            </Card>

            {/* Diversity Weight */}
            <Card className="p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Team Diversity</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Diversity Weight: {formationRule.skill_distribution_rules.diversityWeight}
                  </label>
                  <input
                    type="range"
                    min={0}
                    max={1}
                    step={0.1}
                    value={formationRule.skill_distribution_rules.diversityWeight}
                    onChange={(e) => setFormationRule(prev => ({
                      ...prev,
                      skill_distribution_rules: {
                        ...prev.skill_distribution_rules,
                        diversityWeight: parseFloat(e.target.value)
                      }
                    }))}
                    className="mt-2 w-full"
                  />
                  <p className="mt-1 text-sm text-gray-500">
                    Higher values prioritize skill diversity in teams
                  </p>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formationRule.skill_distribution_rules.academicLevelBalance}
                    onChange={(e) => setFormationRule(prev => ({
                      ...prev,
                      skill_distribution_rules: {
                        ...prev.skill_distribution_rules,
                        academicLevelBalance: e.target.checked
                      }
                    }))}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                  <label className="ml-2 block text-sm text-gray-900">
                    Balance academic levels across teams
                  </label>
                </div>
              </div>
            </Card>

            {/* Skill Requirements */}
            <Card className="p-6 md:col-span-2">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-medium text-gray-900">Required Skills</h2>
                <button
                  onClick={addSkillRequirement}
                  className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add Skill
                </button>
              </div>

              <div className="space-y-4">
                {formationRule.required_skills.map((req, index) => (
                  <div key={index} className="flex items-center space-x-4 bg-gray-50 p-4 rounded-md">
                    <select
                      value={req.skillId}
                      onChange={(e) => setFormationRule(prev => ({
                        ...prev,
                        required_skills: prev.required_skills.map((r, i) =>
                          i === index ? { ...r, skillId: e.target.value } : r
                        )
                      }))}
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    >
                      {skills.map(skill => (
                        <option key={skill.id} value={skill.id}>
                          {skill.name}
                        </option>
                      ))}
                    </select>

                    <div className="flex-1">
                      <label className="block text-sm font-medium text-gray-700">
                        Min. Members
                      </label>
                      <input
                        type="number"
                        min={1}
                        max={formationRule.max_team_size}
                        value={req.minCount}
                        onChange={(e) => setFormationRule(prev => ({
                          ...prev,
                          required_skills: prev.required_skills.map((r, i) =>
                            i === index ? { ...r, minCount: parseInt(e.target.value) } : r
                          )
                        }))}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                      />
                    </div>

                    <div className="flex-1">
                      <label className="block text-sm font-medium text-gray-700">
                        Min. Proficiency
                      </label>
                      <input
                        type="number"
                        min={1}
                        max={5}
                        value={req.minProficiency}
                        onChange={(e) => setFormationRule(prev => ({
                          ...prev,
                          required_skills: prev.required_skills.map((r, i) =>
                            i === index ? { ...r, minProficiency: parseInt(e.target.value) } : r
                          )
                        }))}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                      />
                    </div>

                    <button
                      onClick={() => removeSkillRequirement(index)}
                      className="mt-6 text-gray-400 hover:text-gray-500"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                ))}

                {formationRule.required_skills.length === 0 && (
                  <p className="text-sm text-gray-500 text-center py-4">
                    No skill requirements added. Click "Add Skill" to define required skills for teams.
                  </p>
                )}
              </div>
            </Card>
          </div>

          {/* Preview section to be added */}
          <div className="mt-8">
            <TeamPreview 
              rules={formationRule}
              courseId={formationRule.course_id}
            />
          </div>
        </>
      )}
    </div>
  )
} 