import { render, screen, waitFor } from '@testing-library/react'
import StudentDashboardPage from '@/app/(dashboard)/student-dashboard/page'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

// Mock the components used by the dashboard
jest.mock('@/components/teams/TeamAvailabilityCard', () => {
  return function MockTeamAvailabilityCard({ initialLookingForTeam, isProfileComplete }) {
    return (
      <div data-testid="team-availability-card">
        Team Availability: {initialLookingForTeam ? 'Enabled' : 'Disabled'}
        Profile Complete: {isProfileComplete ? 'Yes' : 'No'}
      </div>
    )
  }
})

jest.mock('@/components/dashboard/BrowseStudentsCard', () => {
  return function MockBrowseStudentsCard({ completionPercentage }) {
    return (
      <div data-testid="browse-students-card">
        Browse Students (Completion: {completionPercentage}%)
      </div>
    )
  }
})

// Mock the Supabase client
jest.mock('@supabase/auth-helpers-nextjs')

describe('StudentDashboardPage', () => {
  beforeEach(() => {
    // Mock user data
    createClientComponentClient.mockReturnValue({
      auth: {
        getUser: jest.fn().mockResolvedValue({
          data: { user: { id: 'user123' } },
          error: null
        })
      },
      from: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockImplementation((table) => {
        if (table === 'users') {
          return Promise.resolve({
            data: {
              id: 'user123',
              full_name: 'Test User',
              email: 'test@example.com',
              bio: 'Test bio that is long enough',
              looking_for_team: true
            },
            error: null
          })
        } else if (table === 'team_members') {
          return Promise.resolve({
            data: null,
            error: null
          })
        }
        return Promise.resolve({ data: null, error: null })
      })
    })
  })

  test('renders student dashboard with profile data', async () => {
    render(<StudentDashboardPage />)
    
    // Initially shows loading state
    expect(screen.getByText(/Loading dashboard.../i)).toBeInTheDocument()
    
    // After data loads, should show main dashboard components
    await waitFor(() => {
      expect(screen.getByText(/Student Dashboard/i)).toBeInTheDocument()
    })
    
    // Check that profile completion card renders
    await waitFor(() => {
      expect(screen.getByText(/Profile Completion/i)).toBeInTheDocument()
    })
    
    // Check that team availability card renders with correct props
    await waitFor(() => {
      const teamCard = screen.getByTestId('team-availability-card')
      expect(teamCard).toHaveTextContent('Team Availability: Enabled')
    })
    
    // Check that browse students card renders
    await waitFor(() => {
      expect(screen.getByTestId('browse-students-card')).toBeInTheDocument()
    })
  })
}) 