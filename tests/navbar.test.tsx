import { screen } from '@testing-library/react'
import { renderWithProviders } from '../src/utils/test-utils'
import Navbar from '../src/components/navbar'
import React from 'react'

describe('Navbar', () => {
  it('should display login button when not authenticated', () => {
    const textToFind = 'Login'

    renderWithProviders(<Navbar/>)
    const loginButton = screen.getByText(textToFind)

    expect(loginButton).toBeInTheDocument()
  })

  it('should display logout button when authenticated', () => {
    const textToFind = 'Logout'

    renderWithProviders(<Navbar/>, { preloadedState: { auth: { token: 'auth' } } })
    const logoutButton = screen.getByText(textToFind)

    expect(logoutButton).toBeInTheDocument()
  })
})
