'use client'

import { Dialog, Transition } from '@headlessui/react'
import { Fragment } from 'react'
import { X } from 'lucide-react'
import TeamInviteButton from '@/components/teams/TeamInviteButton'

interface Skill {
  skill_id: string
  name: string
  proficiency_level: number
}

interface StudentProfileModalProps {
  isOpen: boolean
  onClose: () => void
  student: {
    id: string
    full_name: string
    avatar_url?: string
    bio?: string
    skills?: Skill[]
    availability?: string
  } | null
}

export default function StudentProfileModal({ isOpen, onClose, student }: StudentProfileModalProps) {
  if (!student) return null

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-25" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white p-6 shadow-xl transition-all">
                <div className="flex justify-between items-start">
                  <div className="flex items-center space-x-4">
                    <div className="h-16 w-16 rounded-full bg-gray-200 flex-shrink-0">
                      {student.avatar_url ? (
                        <img
                          src={student.avatar_url}
                          alt={student.full_name}
                          className="h-16 w-16 rounded-full object-cover"
                        />
                      ) : (
                        <div className="h-16 w-16 rounded-full bg-indigo-600 flex items-center justify-center">
                          <span className="text-white text-2xl font-medium">
                            {student.full_name[0]}
                          </span>
                        </div>
                      )}
                    </div>
                    <div>
                      <Dialog.Title className="text-2xl font-semibold text-gray-900">
                        {student.full_name}
                      </Dialog.Title>
                      <p className="text-sm text-gray-500">
                        {student.availability ? `Available ${student.availability}` : 'Availability not set'}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={onClose}
                    className="text-gray-400 hover:text-gray-500"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>

                {/* Bio */}
                <div className="mt-6">
                  <h3 className="text-lg font-medium text-gray-900">About</h3>
                  <p className="mt-2 text-gray-600">
                    {student.bio || 'No bio provided'}
                  </p>
                </div>

                {/* Skills */}
                <div className="mt-6">
                  <h3 className="text-lg font-medium text-gray-900">Skills</h3>
                  <div className="mt-2 grid grid-cols-2 gap-4">
                    {student.skills?.map((skill) => (
                      <div
                        key={skill.skill_id}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                      >
                        <span className="text-gray-900">{skill.name}</span>
                        <div className="flex items-center">
                          {[...Array(5)].map((_, i) => (
                            <div
                              key={i}
                              className={`w-2 h-2 rounded-full mx-0.5 ${
                                i < skill.proficiency_level
                                  ? 'bg-indigo-600'
                                  : 'bg-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div className="mt-8 flex justify-end space-x-4">
                  <button
                    onClick={onClose}
                    className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 border border-gray-300 rounded-md"
                  >
                    Close
                  </button>
                  <TeamInviteButton 
                    studentId={student.id}
                    studentName={student.full_name}
                  />
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  )
} 