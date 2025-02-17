'use client'

import { useState } from 'react'
import Button from '@/components/ui/Button'
import CreateCourseModal from './CreateCourseModal'

export default function CreateCourseButton() {
  const [isModalOpen, setIsModalOpen] = useState(false)

  return (
    <>
      <Button onClick={() => setIsModalOpen(true)}>
        Create Course
      </Button>
      <CreateCourseModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />
    </>
  )
} 