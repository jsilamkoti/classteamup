export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-indigo-50 to-purple-50 px-4 py-12">
      {/* Logo and title */}
      <div className="text-center mb-6">
        <h1 className="text-4xl font-bold tracking-tight text-indigo-700">
          ClassTeamUp
        </h1>
        <p className="mt-2 text-base text-gray-600">
          Where teamwork meets learning
        </p>
      </div>
      
      {/* Main content */}
      {children}
      
      {/* Footer */}
      <footer className="mt-8 text-center text-sm text-gray-500">
        <p>&copy; {new Date().getFullYear()} ClassTeamUp. All rights reserved.</p>
        <div className="mt-2 space-x-4">
          <a href="#" className="hover:text-indigo-600">Privacy Policy</a>
          <a href="#" className="hover:text-indigo-600">Terms of Service</a>
          <a href="#" className="hover:text-indigo-600">Contact</a>
        </div>
      </footer>
    </div>
  )
} 