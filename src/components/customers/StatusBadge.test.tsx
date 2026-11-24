import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { StatusBadge } from './StatusBadge'

describe('StatusBadge', () => {
  it('renders the status label', () => {
    render(<StatusBadge status="past_due" />)
    expect(screen.getByText('Past due')).toBeInTheDocument()
  })

  it('mutes churned customers', () => {
    render(<StatusBadge status="churned" />)
    expect(screen.getByText('Churned')).toHaveClass('text-muted-foreground')
  })
})
