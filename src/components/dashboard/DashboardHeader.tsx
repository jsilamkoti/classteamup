interface DashboardHeaderProps {
  heading: string
  text?: string
}

export default function DashboardHeader({ heading, text }: DashboardHeaderProps) {
  return (
    <div className="flex items-center justify-between px-2">
      <div className="grid gap-1">
        <h1 className="text-2xl font-bold tracking-wide text-gray-900">
          {heading}
        </h1>
        {text && <p className="text-gray-600">{text}</p>}
      </div>
    </div>
  )
} 