'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import { X } from 'lucide-react'

interface Skill {
  id: string
  name: string
  category: string
}

interface FilterSidebarProps {
  isOpen: boolean
  onClose: () => void
  onFilterChange: (filters: FilterState) => void
}

interface FilterState {
  skills: string[]
  proficiencyLevel: number | null
  availability: string | null
}

export default function FilterSidebar({ isOpen, onClose, onFilterChange }: FilterSidebarProps) {
  const [skills, setSkills] = useState<Skill[]>([])
  const [selectedSkills, setSelectedSkills] = useState<string[]>([])
  const [proficiencyLevel, setProficiencyLevel] = useState<number | null>(null)
  const [availability, setAvailability] = useState<string | null>(null)
  const supabase = createClient()

  useEffect(() => {
    const fetchSkills = async () => {
      const { data, error } = await supabase
        .from('skills')
        .select('*')
        .order('name')

      if (!error && data) {
        setSkills(data)
      }
    }

    fetchSkills()
  }, [])

  const handleSkillToggle = (skillId: string) => {
    setSelectedSkills(prev => {
      const newSkills = prev.includes(skillId)
        ? prev.filter(id => id !== skillId)
        : [...prev, skillId]
      
      onFilterChange({
        skills: newSkills,
        proficiencyLevel,
        availability
      })
      
      return newSkills
    })
  }

  const handleProficiencyChange = (level: number | null) => {
    setProficiencyLevel(level)
    onFilterChange({
      skills: selectedSkills,
      proficiencyLevel: level,
      availability
    })
  }

  const handleAvailabilityChange = (value: string | null) => {
    setAvailability(value)
    onFilterChange({
      skills: selectedSkills,
      proficiencyLevel,
      availability: value
    })
  }

  return (
    <div className={`fixed inset-y-0 right-0 w-80 bg-white shadow-lg transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
      <div className="h-full flex flex-col">
        <div className="p-4 border-b flex justify-between items-center">
          <h2 className="text-lg font-medium">Filters</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {/* Skills Filter */}
          <div>
            <h3 className="font-medium mb-3">Skills</h3>
            <div className="space-y-2">
              {skills.map(skill => (
                <label key={skill.id} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={selectedSkills.includes(skill.id)}
                    onChange={() => handleSkillToggle(skill.id)}
                    className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="ml-2 text-sm">{skill.name}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Proficiency Level Filter */}
          <div>
            <h3 className="font-medium mb-3">Minimum Proficiency</h3>
            <select
              value={proficiencyLevel || ''}
              onChange={(e) => handleProficiencyChange(e.target.value ? Number(e.target.value) : null)}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            >
              <option value="">Any Level</option>
              <option value="1">Beginner</option>
              <option value="2">Elementary</option>
              <option value="3">Intermediate</option>
              <option value="4">Advanced</option>
              <option value="5">Expert</option>
            </select>
          </div>

          {/* Availability Filter */}
          <div>
            <h3 className="font-medium mb-3">Availability</h3>
            <select
              value={availability || ''}
              onChange={(e) => handleAvailabilityChange(e.target.value || null)}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            >
              <option value="">Any Availability</option>
              <option value="full">Full-time</option>
              <option value="part">Part-time</option>
              <option value="flexible">Flexible</option>
            </select>
          </div>
        </div>

        {/* Reset Filters */}
        <div className="p-4 border-t">
          <button
            onClick={() => {
              setSelectedSkills([])
              setProficiencyLevel(null)
              setAvailability(null)
              onFilterChange({ skills: [], proficiencyLevel: null, availability: null })
            }}
            className="w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md"
          >
            Reset Filters
          </button>
        </div>
      </div>
    </div>
  )
} 