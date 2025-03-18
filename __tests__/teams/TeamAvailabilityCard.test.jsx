import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import TeamAvailabilityCard from '@/components/teams/TeamAvailabilityCard'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import toast from 'react-hot-toast'

// Mock the modules
jest.mock('@supabase/auth-helpers-nextjs')
jest.mock('react-hot-toast')

describe('TeamAvailabilityCard', () => {
  const mockUpdateUser = jest.fn()
  
  beforeEach(() => {
    // Set up mocks
    createClientComponentClient.mockReturnValue({
      auth: {
        getUser: jest.fn().mockResolvedValue({ 
          data: { user: { id: 'user123' } }, 
          error: null 
        })
      },
      from: jest.fn().mockReturnThis(),
      update: mockUpdateUser.mockResolvedValue({ data: {}, error: null }),
      eq: jest.fn().mockReturnThis()
    })
    
    // Clear mock calls between tests
    jest.clearAllMocks()
  })
  
  test('renders with initial looking for team status as false', () => {
    render(<TeamAvailabilityCard initialLookingForTeam={false} isProfileComplete={true} />)
    
    // Check that key elements are present
    expect(screen.getByText(/Find a Team/i)).toBeInTheDocument()
    expect(screen.getByText(/You're not currently looking for a team/i)).toBeInTheDocument()
    
    // Check that button shows correct text
    expect(screen.getByRole('button', { name: /Find a Team/i })).toBeInTheDocument()
  })
  
  test('renders with initial looking for team status as true', () => {
    render(<TeamAvailabilityCard initialLookingForTeam={true} isProfileComplete={true} />)
    
    // Check that key elements are present
    expect(screen.getByText(/Find a Team/i)).toBeInTheDocument()
    expect(screen.getByText(/You're currently looking for a team/i)).toBeInTheDocument()
    
    // Check that button shows correct text
    expect(screen.getByRole('button', { name: /Stop Looking for Team/i })).toBeInTheDocument()
  })
  
  test('handles toggle action when enabled', async () => {
    render(<TeamAvailabilityCard initialLookingForTeam={false} isProfileComplete={true} />)
    
    // Click the button to enable team search
    fireEvent.click(screen.getByRole('button', { name: /Find a Team/i }))
    
    // Verify update was called with correct values
    await waitFor(() => {
      expect(mockUpdateUser).toHaveBeenCalledWith({
        looking_for_team: true,
        updated_at: expect.any(String)
      })
      expect(toast.success).toHaveBeenCalledWith("You are now available for team matching!")
    })
    
    // Check that the UI has updated
    expect(screen.getByRole('button', { name: /Stop Looking for Team/i })).toBeInTheDocument()
  })
  
  test('handles toggle action when disabled', async () => {
    render(<TeamAvailabilityCard initialLookingForTeam={true} isProfileComplete={true} />)
    
    // Click the button to disable team search
    fireEvent.click(screen.getByRole('button', { name: /Stop Looking for Team/i }))
    
    // Verify update was called with correct values
    await waitFor(() => {
      expect(mockUpdateUser).toHaveBeenCalledWith({
        looking_for_team: false,
        updated_at: expect.any(String)
      })
      expect(toast.success).toHaveBeenCalledWith("You are no longer looking for a team")
    })
    
    // Check that the UI has updated
    expect(screen.getByRole('button', { name: /Find a Team/i })).toBeInTheDocument()
  })
  
  test('prevents toggle when profile is incomplete', async () => {
    render(<TeamAvailabilityCard initialLookingForTeam={false} isProfileComplete={false} />)
    
    // Click the button
    fireEvent.click(screen.getByRole('button', { name: /Find a Team/i }))
    
    // Verify toast error is shown
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Please complete your profile first')
      expect(mockUpdateUser).not.toHaveBeenCalled()
    })
  })
}) 