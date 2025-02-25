'use client'

import { useState } from 'react'
import Link from 'next/link'
import Modal from '@/components/ui/Modal'

interface Requirement {
  met: boolean
  label: string
}

interface ProfileRequirementsModalProps {
  requirements: Requirement[]
  children: React.ReactNode
}

export default function ProfileRequirementsModal({ requirements, children }: ProfileRequirementsModalProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)

  return (
    <>
      <div onClick={() => setIsModalOpen(true)}>
        {/* This div will wrap the Browse Students card from the parent */}
        {children}
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Complete Your Profile"
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Complete these requirements to browse and connect with other students:
          </p>
          <div className="space-y-3">
            {requirements.map((req, index) => (
              <div 
                key={index}
                className="flex items-start space-x-3"
              >
                <div className={`mt-1 flex-shrink-0 h-5 w-5 rounded-full border-2 flex items-center justify-center ${
                  req.met 
                    ? 'border-green-500 bg-green-50' 
                    : 'border-gray-300'
                }`}>
                  {req.met && (
                    <svg 
                      className="h-3 w-3 text-green-500" 
                      fill="currentColor" 
                      viewBox="0 0 12 12"
                    >
                      <path d="M3.707 5.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4a1 1 0 00-1.414-1.414L5 6.586 3.707 5.293z" />
                    </svg>
                  )}
                </div>
                <div>
                  <p className={`text-sm ${
                    req.met ? 'text-gray-500' : 'text-gray-900'
                  }`}>
                    {req.label}
                  </p>
                  {!req.met && (
                    <Link
                      href="/settings/profile"
                      className="text-xs text-indigo-600 hover:text-indigo-800"
                    >
                      Complete this requirement →
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
          <div className="mt-6 flex justify-end">
            <button
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-md"
            >
              Close
            </button>
          </div>
        </div>
      </Modal>
    </>
  )
} 