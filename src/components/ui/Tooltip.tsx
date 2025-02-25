'use client'

import { useState } from 'react'

interface TooltipProps {
  text: string
  children: React.ReactNode
  disabled?: boolean
}

export default function Tooltip({ text, children, disabled = false }: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false)

  if (disabled) return <>{children}</>

  return (
    <div 
      className="relative inline-block w-full"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      {children}
      {isVisible && (
        <div className="absolute z-10 w-64 px-3 py-2 text-sm text-white bg-gray-900 rounded-lg shadow-sm dark:bg-gray-700 -top-2 left-1/2 transform -translate-x-1/2 -translate-y-full">
          {text}
          <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2 rotate-45 w-2 h-2 bg-gray-900"></div>
        </div>
      )}
    </div>
  )
} 