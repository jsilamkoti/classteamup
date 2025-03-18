import { render, screen } from '@testing-library/react'
import { Card } from '@/components/ui/Card'

describe('Card Component', () => {
  test('renders a card with content', () => {
    render(
      <Card>
        <div>Card Content</div>
      </Card>
    )
    
    expect(screen.getByText('Card Content')).toBeInTheDocument()
  })
  
  test('applies custom className', () => {
    const { container } = render(
      <Card className="custom-class">
        <div>Card Content</div>
      </Card>
    )
    
    expect(container.firstChild).toHaveClass('custom-class')
  })
  
  test('renders with default styles', () => {
    const { container } = render(
      <Card>
        <div>Card Content</div>
      </Card>
    )
    
    // Check for default card styling
    expect(container.firstChild).toHaveClass('bg-white')
    expect(container.firstChild).toHaveClass('rounded-lg')
    expect(container.firstChild).toHaveClass('border')
  })
}) 