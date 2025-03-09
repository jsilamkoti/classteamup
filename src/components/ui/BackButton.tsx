'use client'

import { ArrowLeft } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { ButtonHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

interface BackButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  fallbackPath?: string
  label?: string
}

export default function BackButton({ 
  fallbackPath = '/dashboard', 
  label = 'Back',
  className,
  ...props
}: BackButtonProps) {
  const router = useRouter()

  const handleBack = () => {
    try {
      // Try to go back in history first
      window.history.back()
      
      // Set a timeout to check if navigation happened
      setTimeout(() => {
        // If we're still on the same page after 100ms, navigate to fallback
        router.push(fallbackPath)
      }, 100)
    } catch (error) {
      // If any error occurs, use the fallback path
      router.push(fallbackPath)
    }
  }

  return (
    <button
      onClick={handleBack}
      className={cn(
        "inline-flex items-center text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors",
        className
      )}
      {...props}
    >
      <ArrowLeft className="h-4 w-4 mr-1" />
      {label}
    </button>
  )
} 