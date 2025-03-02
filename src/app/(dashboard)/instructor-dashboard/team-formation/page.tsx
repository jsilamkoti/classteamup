'use client'

import { useState, useEffect } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Card } from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import { TeamMatchingService } from '@/services/teamMatching'
import { toast } from 'react-hot-toast'
import { Users, AlertCircle, Loader2, Save, Plus, X } from 'lucide-react'
import { Student } from '@/services/teamMatching'
import { validateTeamRules } from '@/lib/utils/teamRules'
import { useRouter } from 'next/navigation'

// Remove the Course interface as it's no longer needed
// interface Course {
//   id: string
//   name: string
//   description: string
//   instructor_id: string
//   created_at: string
//   updated_at: string
// }

type Team = Student[]

interface Skill {
  id: string
  name: string
}

interface ValidationResult {
  isValid: boolean
  errors: string[]
  warnings: string[]
}

interface TeamFormationRule {
  id: string
  course_id: string
  min_team_size: number
  max_team_size: number
  required_skills: {
    skillId: string
    minCount: number
    minProficiency: number
  }[]
  skill_distribution_rules: {
    diversityWeight: number
    academicLevelBalance: boolean
  }
  created_at: string
}

export default function TeamFormationPage() {
  const [loading, setLoading] = useState(false)
  const [validation, setValidation] = useState<ValidationResult>({
    isValid: true,
    errors: [],
    warnings: []
  })
  const [formationRule, setFormationRule] = useState<TeamFormationRule>({
    id: '',
    course_id: '27a19b51-dc21-40db-9001-4d63949151c5',
    min_team_size: 3,
    max_team_size: 5,
    required_skills: [],
    skill_distribution_rules: {
      diversityWeight: 0.5,
      academicLevelBalance: true
    },
    created_at: new Date().toISOString()
  })
  const [isSaving, setIsSaving] = useState(false)
  const [availableStudents, setAvailableStudents] = useState(0)
  const [skills, setSkills] = useState<Skill[]>([])
  const [formedTeams, setFormedTeams] = useState<Team[]>([])
  const [debugMode, setDebugMode] = useState(false)
  const [debugLogs, setDebugLogs] = useState<{time: string, message: string, type: 'info' | 'error' | 'success' | 'warning'}[]>([])
  const [errorMessage, setErrorMessage] = useState<string>('')
  const [successMessage, setSuccessMessage] = useState<string>('')
  const supabase = createClientComponentClient()
  const router = useRouter()

  // Helper function to add debug logs
  const addDebugLog = (message: string, type: 'info' | 'error' | 'success' | 'warning' = 'info') => {
    if (!debugMode) return;
    
    const now = new Date();
    const timeString = now.toLocaleTimeString();
    
    // Add to state
    setDebugLogs(prevLogs => [
      ...prevLogs,
      {
        time: timeString,
        message,
        type
      }
    ]);
    
    // Log to console for easier debugging
    console.log(`${type.toUpperCase()} [${timeString}]: ${message}`);
  };

  // Clear debug logs
  const clearDebugLogs = () => {
    setDebugLogs([]);
  };

  // Add a schema check function to help with debugging
  const checkDatabaseSchema = async () => {
    if (!debugMode) return;
    
    try {
      addDebugLog('Checking database schema...', 'info');
      
      // Check teams table
      const { data: teamsColumns, error: teamsError } = await supabase
        .from('teams')
        .select('*')
        .limit(1);
        
      if (teamsError) {
        addDebugLog(`Error checking teams table: ${teamsError.message}`, 'error');
      } else {
        const sample = teamsColumns?.[0] || {};
        const columns = Object.keys(sample);
        addDebugLog(`Teams table has columns: ${columns.join(', ')}`, 'info');
      }
      
      // Check team_members table
      const { data: membersColumns, error: membersError } = await supabase
        .from('team_members')
        .select('*')
        .limit(1);
        
      if (membersError) {
        addDebugLog(`Error checking team_members table: ${membersError.message}`, 'error');
      } else {
        const sample = membersColumns?.[0] || {};
        const columns = Object.keys(sample);
        addDebugLog(`Team_members table has columns: ${columns.join(', ')}`, 'info');
      }
    } catch (error) {
      addDebugLog(`Error checking schema: ${error}`, 'error');
    }
  };

  useEffect(() => {
    loadAvailableStudents()

    const channel = supabase
      .channel('available-students')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'users'
        },
        () => {
          loadAvailableStudents()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

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
    setValidation(validateTeamRules(formationRule))
  }, [formationRule])

  // Run schema check when debug mode is enabled
  useEffect(() => {
    if (debugMode) {
      checkDatabaseSchema();
    }
  }, [debugMode]);

  // Update the loadRules function to use single loading state
  useEffect(() => {
    const loadRules = async () => {
      setLoading(true)  // Use single loading state
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
        setLoading(false)  // Use single loading state
      }
    }

    loadRules()
  }, [])

  const fetchExistingRules = async (courseId: string) => {
    try {
      const { data, error } = await supabase
        .from('team_formation_rules')
        .select('*')
        .eq('course_id', formationRule.course_id)
        .single()

      if (error && error.code !== 'PGRST116') {
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

  const handleSaveRules = async () => {
    try {
      setIsSaving(true)
      
      // Get the current user
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (userError) throw userError
      
      console.log('Current user:', user)

      const ruleData = {
        id: crypto.randomUUID(),
        course_id: formationRule.course_id,
        min_team_size: formationRule.min_team_size,
        max_team_size: formationRule.max_team_size,
        required_skills: formationRule.required_skills,
        skill_distribution_rules: formationRule.skill_distribution_rules,
        created_at: new Date().toISOString()
      }

      console.log('Attempting to save:', ruleData)

      // Delete any existing rules for this course
      const { error: deleteError } = await supabase
        .from('team_formation_rules')
        .delete()
        .eq('course_id', ruleData.course_id)

      if (deleteError) {
        console.error('Delete error:', deleteError)
        throw deleteError
      }

      // Insert new rule
      const { data, error: insertError } = await supabase
        .from('team_formation_rules')
        .insert(ruleData)
        .select()

      if (insertError) {
        console.error('Insert error:', insertError)
        throw insertError
      }

      console.log('Save successful:', data)
      toast.success('Team formation rules saved successfully')
      
    } catch (error: any) {
      console.error('Full error:', error)
      toast.error(`Failed to save: ${error.message}`)
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

  const loadAvailableStudents = async () => {
    try {
      // Count students who are:
      // 1. Students (role)
      // 2. Looking for team (flag)
      // 3. Not already in a team
      const { data, count, error } = await supabase
        .from('users')
        .select('*', { count: 'exact' })
        .eq('role', 'student')
        .eq('looking_for_team', true)

      if (error) {
        throw error
      }

      // Log for debugging
      console.log('Available students query result:', { data, count })
      
      setAvailableStudents(count || 0)
    } catch (error) {
      console.error('Error loading available students:', error)
      toast.error('Failed to load student count')
    }
  }

  const handleFormTeams = async () => {
    try {
      setLoading(true)
      
      if (debugMode) {
        clearDebugLogs();
        addDebugLog('Starting team formation process', 'info');
        // Check schema - don't await here since handleFormTeams itself is async
        checkDatabaseSchema().then(() => {
          if (debugMode) {
            addDebugLog('Schema check completed', 'info');
          }
        }).catch((error) => {
          if (debugMode) {
            addDebugLog(`Schema check failed: ${error.message}`, 'error');
          }
        });
      }
      
      const matchingService = new TeamMatchingService()
      
      // Log debug information if debug mode is enabled
      if (debugMode) {
        addDebugLog(`Using criteria: min size=${formationRule.min_team_size}, max size=${formationRule.max_team_size}`, 'info');
        addDebugLog(`Course ID: ${formationRule.course_id}`, 'info');
        
        // Add a debug toast to make it more visible
        toast.success("Debug mode is active. Check browser console for detailed logs.");
      }
      
      // Create criteria based on formation rules
      const criteria = {
        minTeamSize: formationRule.min_team_size,
        maxTeamSize: formationRule.max_team_size,
        considerSkills: true,
        balanceTeamSize: true,
        considerProjectPreferences: true,
        considerAvailability: true,
        skillWeighting: formationRule.skill_distribution_rules.diversityWeight
      };
      
      // Get current user to validate instructor access
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) {
        console.error('Error getting current user:', userError);
        toast.error('Authentication error. Please log in again.');
        if (debugMode) {
          addDebugLog(`Authentication error: ${userError.message}`, 'error');
        }
        setLoading(false);
        return;
      }
      
      // Attempt to form teams
      try {
        if (debugMode) {
          addDebugLog('Calling matchTeams function...', 'info');
        }
        
        const teams = await matchingService.matchTeams(criteria);
        
        if (teams.length === 0) {
          let msg = 'No teams could be formed with the current criteria.';
          if (availableStudents === 0) {
            msg = 'No available students found to form teams.';
          } else if (availableStudents < formationRule.min_team_size) {
            msg = `Cannot form teams: Only ${availableStudents} students available, but minimum team size is ${formationRule.min_team_size}.`;
          }
          setErrorMessage(msg);
          if (debugMode) addDebugLog(msg, 'error');
          return;
        }
        
        if (debugMode) {
          addDebugLog(`Teams returned by matching algorithm: ${teams.length}`, 'info');
        }
        
        // Display formed teams in the UI before saving
        setFormedTeams(teams);

        let createdCount = 0;
        let errorCount = 0;

        // Loop through each team
        for (const team of teams) {
          if (debugMode) {
            addDebugLog(`Creating team for ${team.length} members`, 'info');
          }
          
          // Generate a readable team name
          const teamNamePrefix = 'Team';
          const teamNumber = Math.floor(Math.random() * 1000) + 1;
          const teamName = `${teamNamePrefix} ${teamNumber}`;
          
          // Use the API endpoint to create the team
          const teamData = {
            name: teamName,
            description: `Automatically generated team with ${team.length} members`,
            course_id: formationRule.course_id
          };
          
          try {
            // Call the API to create team
            const teamResponse = await fetch('/api/instructor/create-team', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ teamData }),
            });
            
            if (!teamResponse.ok) {
              const errorData = await teamResponse.json();
              if (debugMode) {
                addDebugLog(`Failed to create team "${teamName}": ${errorData.error}`, 'error');
              }
              errorCount++;
              continue;
            }
            
            const teamResult = await teamResponse.json();
            const newTeamId = teamResult.team.id;
            
            if (debugMode) {
              addDebugLog(`Team "${teamName}" created with ID: ${newTeamId}`, 'success');
            }
            
            // Add members to the team
            let memberSuccessCount = 0;
            
            for (const student of team) {
              try {
                if (debugMode) {
                  addDebugLog(`Adding member ${student.full_name || student.id} to team "${teamName}"`, 'info');
                }
                
                // Call the API to add team member
                const memberResponse = await fetch('/api/instructor/add-team-member', {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify({ 
                    teamId: newTeamId,
                    userId: student.id
                  }),
                });
                
                if (!memberResponse.ok) {
                  const memberErrorData = await memberResponse.json();
                  if (debugMode) {
                    addDebugLog(`Failed to add member ${student.full_name || student.id}: ${memberErrorData.error}`, 'error');
                  }
                  continue;
                }
                
                memberSuccessCount++;
                if (debugMode) {
                  addDebugLog(`Added member ${student.full_name || student.id} to team "${teamName}"`, 'success');
                }
              } catch (memberError: any) {
                if (debugMode) {
                  addDebugLog(`Error adding member ${student.full_name || student.id}: ${memberError.message}`, 'error');
                }
              }
            }
            
            if (memberSuccessCount === team.length) {
              createdCount++;
              if (debugMode) {
                addDebugLog(`All ${memberSuccessCount} members added to team "${teamName}"`, 'success');
              }
            } else {
              if (debugMode) {
                addDebugLog(`Only ${memberSuccessCount}/${team.length} members added to team "${teamName}"`, 'warning');
              }
            }
            
          } catch (teamError: any) {
            if (debugMode) {
              addDebugLog(`Error creating team: ${teamError.message}`, 'error');
            }
            errorCount++;
          }
        }
        
        // Handle results message
        if (createdCount > 0) {
          if (createdCount === teams.length) {
            setSuccessMessage(`Successfully created all ${createdCount} teams!`);
            toast.success(`Created ${createdCount} teams successfully!`);
          } else {
            setSuccessMessage(`Created ${createdCount}/${teams.length} teams.`);
            setErrorMessage(`Failed to create ${errorCount} teams. Check debug logs for details.`);
            toast.success(`Created ${createdCount} teams, but ${errorCount} failed.`);
          }
        } else {
          setErrorMessage(`Failed to create any teams. Check debug logs for details.`);
          toast.error('Failed to create teams.');
        }
      } catch (error: any) {
        console.error('Error forming teams:', error);
        setErrorMessage(`Error forming teams: ${error.message}`);
        if (debugMode) {
          addDebugLog(`Error forming teams: ${error.message}`, 'error');
          addDebugLog('Check console for full error details', 'error');
        }
      }
    } catch (error: any) {
      console.error('Error forming teams:', error);
      setErrorMessage(`Error forming teams: ${error.message}`);
      if (debugMode) {
        addDebugLog(`Error forming teams: ${error.message}`, 'error');
        addDebugLog('Check console for full error details', 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Team Formation</h1>

      {/* Add success and error message display */}
      {successMessage && (
        <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-md">
          <p>{successMessage}</p>
        </div>
      )}

      {errorMessage && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
          <p>{errorMessage}</p>
        </div>
      )}

      {/* Debug Info Panel - only shown when debugMode is true */}
      {debugMode && (
        <Card className="mb-8 border-2 border-blue-200">
          <div className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-medium text-blue-700">Debug Information</h2>
              <button
                onClick={clearDebugLogs}
                className="px-3 py-1 bg-blue-100 hover:bg-blue-200 text-blue-800 rounded-md text-sm"
              >
                Clear Logs
              </button>
            </div>
            <div className="bg-gray-100 p-4 rounded-md max-h-60 overflow-auto">
              {debugLogs.length === 0 ? (
                <p className="text-gray-500 italic">No debug logs yet. Actions will be logged here.</p>
              ) : (
                <div className="space-y-2">
                  {debugLogs.map((log, index) => (
                    <div 
                      key={index} 
                      className={`p-2 rounded text-sm ${
                        log.type === 'error' ? 'bg-red-100 text-red-800' : 
                        log.type === 'success' ? 'bg-green-100 text-green-800' : 
                        log.type === 'warning' ? 'bg-yellow-100 text-yellow-800' : 
                        'bg-blue-50 text-blue-800'
                      }`}
                    >
                      <span className="font-mono text-xs">[{log.time}]</span> {log.message}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </Card>
      )}

      {/* Available Students Card */}
      <Card className="mb-8">
        <div className="p-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">Available Students</h2>
              <p className="text-gray-600 text-lg">{availableStudents} student{availableStudents !== 1 ? 's' : ''} looking for a team</p>
            </div>
            <div className="flex items-center bg-gray-50 px-4 py-2 rounded-lg">
              <Users className="h-6 w-6 text-gray-500 mr-2" />
              <span className="text-2xl font-semibold text-gray-900">{availableStudents}</span>
            </div>
          </div>

          {availableStudents < formationRule.min_team_size && (
            <div className="mt-4 p-4 bg-yellow-50 border border-yellow-100 rounded-md">
              <div className="flex">
                <AlertCircle className="h-5 w-5 text-yellow-500" />
                <div className="ml-3">
                  <h3 className="text-base font-medium text-yellow-800">Not Enough Students</h3>
                  <p className="text-sm text-yellow-700 mt-1">
                    Wait for at least {formationRule.min_team_size} students to be available before forming teams.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </Card>

      <h2 className="text-2xl font-semibold text-gray-900 mb-6">Team Formation Rules</h2>

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

      {/* Team Size */}
      <Card className="mb-6">
        <div className="p-6">
          <h2 className="text-xl font-medium mb-4">Team Size</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <label className="block text-gray-700 mb-2">Minimum Team Size</label>
              <input
                type="number"
                min={2}
                max={formationRule.max_team_size}
                value={formationRule.min_team_size}
                onChange={(e) => setFormationRule(prev => ({
                  ...prev,
                  min_team_size: parseInt(e.target.value)
                }))}
                className="w-full p-2 border rounded-md"
              />
            </div>
            <div>
              <label className="block text-gray-700 mb-2">Maximum Team Size</label>
              <input
                type="number"
                min={formationRule.min_team_size}
                value={formationRule.max_team_size}
                onChange={(e) => setFormationRule(prev => ({
                  ...prev,
                  max_team_size: parseInt(e.target.value)
                }))}
                className="w-full p-2 border rounded-md"
              />
            </div>
          </div>
        </div>
      </Card>

      {/* Skill Requirements */}
      <Card className="mb-6">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-medium">Required Skills</h2>
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
        </div>
      </Card>

      {/* Team Diversity Settings */}
      <Card className="mb-6">
        <div className="p-6">
          <h2 className="text-xl font-medium mb-4">Team Diversity</h2>
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
        </div>
      </Card>

      {/* Formation Controls */}
      <div className="mt-8 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <Button 
              onClick={handleSaveRules} 
              variant="outline" 
              disabled={!validation.isValid || isSaving}
              className="mr-4"
            >
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Rules
                </>
              )}
            </Button>
            
            {/* Debug Mode Toggle */}
            <div className="inline-flex items-center ml-4">
              <input
                type="checkbox"
                id="debugMode"
                checked={debugMode}
                onChange={(e) => setDebugMode(e.target.checked)}
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              />
              <label htmlFor="debugMode" className="ml-2 text-sm text-gray-700">
                Debug Mode
              </label>
            </div>
          </div>
          <Button
            onClick={handleFormTeams}
            disabled={
              loading || 
              availableStudents < formationRule.min_team_size || 
              !validation.isValid
            }
          >
            {loading ? (
              <>
                <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                Forming Teams...
              </>
            ) : (
              <>
                <Users className="h-5 w-5 mr-2" />
                Form Teams Now
              </>
            )}
          </Button>
        </div>

        {availableStudents < formationRule.min_team_size && (
          <div className="p-4 bg-yellow-50 border border-yellow-100 rounded-md">
            <div className="flex">
              <AlertCircle className="h-5 w-5 text-yellow-500" />
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800">Not Enough Students</h3>
                <p className="text-sm text-yellow-700 mt-1">
                  Wait for at least {formationRule.min_team_size} students to be available before forming teams.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Formed Teams Display */}
      {formedTeams.length > 0 && (
        <div className="mt-12">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">Formed Teams</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {formedTeams.map((team, teamIndex) => (
              <Card key={teamIndex} className="p-6">
                <h3 className="text-xl font-medium mb-4">Team {teamIndex + 1}</h3>
                <div className="space-y-3">
                  <p className="text-sm text-gray-500">Members: {team.length}</p>
                  <ul className="divide-y">
                    {team.map((student) => (
                      <li key={student.id} className="py-2">
                        <div className="flex items-center">
                          <div className="flex-1">
                            <p className="font-medium">{student.full_name || 'Unnamed Student'}</p>
                            {student.skills && student.skills.length > 0 && (
                              <div className="mt-1 flex flex-wrap gap-1">
                                {student.skills.map((skill) => (
                                  <span 
                                    key={skill.skill_id} 
                                    className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800"
                                  >
                                    {skill.skill_id} ({skill.proficiency_level})
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  )
} 