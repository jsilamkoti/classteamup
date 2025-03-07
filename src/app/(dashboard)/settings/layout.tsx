'use client'

import BackButton from '@/components/ui/BackButton'

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="space-y-6">
      <div className="mb-6">
        <BackButton label="Back to Dashboard" className="mb-4" />
        <h1 className="text-2xl font-bold">Settings</h1>
      </div>
      {children}
    </div>
  )
} 