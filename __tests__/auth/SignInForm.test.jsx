import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import SignInForm from '@/components/auth/SignInForm'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'

// Mock the modules
jest.mock('@supabase/auth-helpers-nextjs')
jest.mock('next/navigation', () => ({
  useRouter: jest.fn()
}))
jest.mock('react-hot-toast')

describe('SignInForm', () => {
  const mockPush = jest.fn()
  const mockSignIn = jest.fn()
  
  beforeEach(() => {
    // Set up mocks
    useRouter.mockReturnValue({
      push: mockPush
    })
    
    createClientComponentClient.mockReturnValue({
      auth: {
        signInWithPassword: mockSignIn,
        getSession: jest.fn().mockResolvedValue({ data: { session: null }, error: null })
      },
      from: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({ 
        data: { role: 'student' }, 
        error: null 
      })
    })
    
    // Clear mock calls between tests
    jest.clearAllMocks()
  })
  
  test('renders the sign-in form', () => {
    render(<SignInForm />)
    
    // Check that key elements are present
    expect(screen.getByText(/Welcome back/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Email address/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Password/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Sign in/i })).toBeInTheDocument()
  })
  
  test('handles form submission', async () => {
    // Mock successful sign-in
    mockSignIn.mockResolvedValueOnce({
      data: { user: { id: 'user123' } },
      error: null
    })
    
    render(<SignInForm />)
    
    // Fill out the form
    fireEvent.change(screen.getByLabelText(/Email address/i), {
      target: { value: 'test@example.com' }
    })
    
    fireEvent.change(screen.getByLabelText(/Password/i), {
      target: { value: 'password123' }
    })
    
    // Submit the form
    fireEvent.click(screen.getByRole('button', { name: /Sign in/i }))
    
    // Verify form submission
    await waitFor(() => {
      expect(mockSignIn).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123'
      })
    })
    
    // Verify successful sign-in actions
    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith('Signed in successfully!')
      expect(mockPush).toHaveBeenCalledWith('/student-dashboard')
    })
  })
  
  test('displays error message on failed sign-in', async () => {
    // Mock failed sign-in
    mockSignIn.mockResolvedValueOnce({
      data: { user: null },
      error: { message: 'Invalid credentials' }
    })
    
    render(<SignInForm />)
    
    // Fill out the form
    fireEvent.change(screen.getByLabelText(/Email address/i), {
      target: { value: 'wrong@example.com' }
    })
    
    fireEvent.change(screen.getByLabelText(/Password/i), {
      target: { value: 'wrongpassword' }
    })
    
    // Submit the form
    fireEvent.click(screen.getByRole('button', { name: /Sign in/i }))
    
    // Verify error handling
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalled()
      expect(mockPush).not.toHaveBeenCalled()
    })
  })
}) 