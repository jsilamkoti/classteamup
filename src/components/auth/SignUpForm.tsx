'use client'

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Loader2, UserPlus, KeyRound, Mail, User, Eye, EyeOff } from 'lucide-react'
import Image from 'next/image'
import toast from 'react-hot-toast'

export default function SignUpForm() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: '',
    role: 'student' as 'student' | 'instructor'
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const supabase = createClientComponentClient()

  const verifyAuthUser = async (userId: string, attempts = 0): Promise<boolean> => {
    if (attempts >= 5) return false
    
    try {
      // Check if user exists in auth.users
      const { count, error: countError } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true })
        .eq('id', userId)

      if (countError) throw countError
      
      if (count && count > 0) {
        return true
      }

      // If not found, wait and retry
      await new Promise(resolve => setTimeout(resolve, 2000))
      return verifyAuthUser(userId, attempts + 1)
    } catch (error) {
      console.error('Verification attempt failed:', error)
      if (attempts < 4) {
        await new Promise(resolve => setTimeout(resolve, 2000))
        return verifyAuthUser(userId, attempts + 1)
      }
      return false
    }
  }

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setMessage(null)

    if (!formData.fullName.trim()) {
      setError('Full name is required')
      setLoading(false)
      return
    }

    try {
      // First, sign up the user with metadata
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.fullName,
            role: formData.role
          }
        }
      })

      if (authError) {
        console.error('Auth Error:', authError)
        throw authError
      }

      if (!authData.user?.id) {
        throw new Error('No user ID returned from signup')
      }

      // Initial delay
      await new Promise(resolve => setTimeout(resolve, 2000))

      // Create profile with retries
      let profileError = null
      for (let i = 0; i < 3; i++) {
        const { error: insertError } = await supabase
          .from('users')
          .insert({
            id: authData.user.id,
            email: formData.email,
            full_name: formData.fullName,
            role: formData.role,
            // Ensure instructors always have looking_for_team set to false
            looking_for_team: formData.role === 'instructor' ? false : false
          })

        if (!insertError) {
          profileError = null
          break
        }

        profileError = insertError
        await new Promise(resolve => setTimeout(resolve, 2000))
      }

      if (profileError) {
        console.error('Profile Creation Error:', {
          code: profileError.code,
          message: profileError.message,
          details: profileError.details,
          hint: profileError.hint
        })
        throw profileError
      }

      // Verify the profile was created
      const isVerified = await verifyAuthUser(authData.user.id)
      if (!isVerified) {
        setMessage('Account created. Please check your email and try signing in.')
        return
      }

      setMessage('Please check your email for the verification link.')
      toast.success('Account created successfully! Please check your email.')
    } catch (error: any) {
      console.error('Full error object:', error)
      await supabase.auth.signOut()
      setError(error.message || 'An error occurred during signup')
      toast.error('Signup failed: ' + (error.message || 'An error occurred'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col items-center">
      {/* Logo and heading */}
      <div className="text-center mb-8">
        <div className="mx-auto h-16 w-16 mb-4 rounded-full bg-indigo-100 flex items-center justify-center">
          <Image 
            src="/CTU.svg" 
            alt="ClassTeamUp Logo"
            width={40}
            height={40}
          />
        </div>
        <h2 className="text-3xl font-bold text-gray-900">Create your account</h2>
        <p className="mt-2 text-sm text-gray-600">
          Join ClassTeamUp to start collaborating
        </p>
      </div>

      {/* Role selector */}
      <div className="w-full bg-gray-100 border border-gray-200 rounded-lg p-1 flex mb-6 shadow-sm">
        <button
          type="button"
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            formData.role === 'student' 
              ? 'bg-white shadow-sm text-indigo-700 border border-gray-200' 
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
          }`}
          onClick={() => setFormData({ ...formData, role: 'student' })}
        >
          Student
        </button>
        <button
          type="button"
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            formData.role === 'instructor' 
              ? 'bg-white shadow-sm text-indigo-700 border border-gray-200' 
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
          }`}
          onClick={() => setFormData({ ...formData, role: 'instructor' })}
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

      {/* Success message */}
      {message && (
        <div className="w-full mb-4 rounded-md bg-green-50 p-4 text-sm text-green-700">
          {message}
        </div>
      )}

      {/* Sign up form */}
      <form onSubmit={handleSubmit} className="w-full space-y-5">
        <div>
          <label htmlFor="fullName" className="block text-sm font-medium text-gray-800">
            Full Name
          </label>
          <div className="mt-1 relative rounded-md shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <User className="h-5 w-5 text-gray-500" />
            </div>
            <input
              id="fullName"
              name="fullName"
              type="text"
              required
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md bg-white text-black focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              placeholder="John Doe"
              value={formData.fullName}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              disabled={loading}
              style={{ color: '#000000' }}
            />
          </div>
        </div>

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
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
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
              autoComplete="new-password"
              required
              className="block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md bg-white text-black focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              placeholder="••••••••"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
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

        <div>
          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-75"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating account...
              </>
            ) : (
              <>
                <UserPlus className="mr-2 h-4 w-4" />
                Sign up
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
            <span className="px-2 bg-white text-gray-500">Already have an account?</span>
          </div>
        </div>

        <div className="mt-6">
          <Link
            href="/auth/signin"
            className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Sign in to your account
          </Link>
        </div>
      </div>
    </div>
  )
} 