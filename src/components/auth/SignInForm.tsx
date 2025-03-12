'use client'

import { useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Loader2, LogIn, UserPlus, KeyRound, Mail, Eye, EyeOff } from 'lucide-react'
import Image from 'next/image'
import toast from 'react-hot-toast'

export default function SignInForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState<'student' | 'instructor'>('student')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const router = useRouter()
  const supabase = createClientComponentClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const { data: { user }, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) throw error

      if (user) {
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('role')
          .eq('id', user.id)
          .single()

        if (userError) throw userError

        // Check if the selected role matches the user's actual role
        if (userData?.role !== role) {
          await supabase.auth.signOut()
          throw new Error(`Access denied. You are not registered as a ${role}.`)
        }

        // Show success toast
        toast.success('Signed in successfully!')

        // Redirect to the appropriate dashboard
        router.push(userData?.role === 'instructor' ? '/instructor-dashboard' : '/student-dashboard')
      }
    } catch (err: any) {
      console.error('Sign in error:', err)
      setError(err.message)
      toast.error('Sign in failed: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword)
  }

  return (
      <div className="flex items-center justify-center h-screen bg-cover bg-center"
           style={{
             background: `rgb(24, 165, 167)`,
           }}>
        <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
          {/* Logo and "ClassTeamUp" + Motto */}
          <div className="text-center mb-8">
            <div className="mx-auto h-20 w-20 mb-4 flex items-center justify-center">
              <Image
                src="/logo.png"
                alt="ClassTeamUp Logo"
                width={80}  // Increased logo size
                height={80}  // Increased logo size
              />
            </div>
            <h2 className="text-3xl font-bold text-teal-900">Welcome Back!</h2>
            <p className="mt-2 text-sm text-gray-600">
              Sign in to your account to continue
            </p>
          </div>

          {/* Role selector */}
          <div className="w-full bg-gray-100 border border-gray-200 rounded-lg p-1 flex mb-6 shadow-sm">
            <button
              type="button"
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                role === 'student'
                  ? 'bg-white shadow-sm text-indigo-700 border border-gray-200'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
              onClick={() => setRole('student')}
            >
              Student
            </button>
            <button
              type="button"
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                role === 'instructor'
                  ? 'bg-white shadow-sm text-indigo-700 border border-gray-200'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
              onClick={() => setRole('instructor')}
            >
              Instructor
            </button>
          </div>

          {/* Error message */}
          {error && (
            <div className="w-full mb-4 rounded-md bg-red-50 p-4 text-sm text-red-700">
              {error}
            </div>
          )}

          {/* Sign in form */}
          <form onSubmit={handleSubmit} className="w-full space-y-5">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-800">
                Email address
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-500" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md bg-white text-black focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                  style={{ color: '#000000' }}
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-800">
                Password
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <KeyRound className="h-5 w-5 text-gray-500" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  className="block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md bg-white text-black focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                  style={{ color: '#000000' }}
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                  <button
                    type="button"
                    onClick={togglePasswordVisibility}
                    className="text-gray-500 hover:text-gray-700 focus:outline-none"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                  Remember me
                </label>
              </div>

              <div className="text-sm">
                <Link href="/auth/forgot-password" className="font-medium text-indigo-600 hover:text-indigo-500">
                  Forgot your password?
                </Link>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white"
                style={{ backgroundColor: '#18A5A7' }} // Set button background color
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  <>
                    <LogIn className="mr-2 h-4 w-4" />
                    Sign in
                  </>
                )}
              </button>
            </div>
          </form>

          <div className="mt-6 w-full">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Don't have an account?</span>
              </div>
            </div>

            <div className="mt-6">
              <Link
                href="/auth/signup"
                className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <UserPlus className="mr-2 h-4 w-4" />
                Create new account
              </Link>
            </div>
          </div>
        </div>
      </div>
  )
}