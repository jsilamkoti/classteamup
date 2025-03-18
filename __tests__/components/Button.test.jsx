import { render, screen, fireEvent } from '@testing-library/react'
import Button from '@/components/ui/Button'

// Mock the lucide-react component to avoid ESM issues
jest.mock('lucide-react', () => ({
  Loader2: () => <div data-testid="loader-icon">Loading...</div>
}))

describe('Button Component', () => {
  test('renders a button with text', () => {
    render(<Button>Click Me</Button>)
    
    expect(screen.getByRole('button')).toHaveTextContent('Click Me')
  })
  
  test('calls onClick handler when clicked', () => {
    const handleClick = jest.fn()
    
    render(<Button onClick={handleClick}>Click Me</Button>)
    
    fireEvent.click(screen.getByRole('button'))
    
    expect(handleClick).toHaveBeenCalledTimes(1)
  })
  
  test('does not call onClick when disabled', () => {
    const handleClick = jest.fn()
    
    render(<Button disabled onClick={handleClick}>Click Me</Button>)
    
    fireEvent.click(screen.getByRole('button'))
    
    expect(handleClick).not.toHaveBeenCalled()
  })
  
  test('renders loading state correctly', () => {
    render(<Button loading>Click Me</Button>)
    
    expect(screen.getByTestId('loader-icon')).toBeInTheDocument()
    expect(screen.getByRole('button')).toBeDisabled()
  })
}) 