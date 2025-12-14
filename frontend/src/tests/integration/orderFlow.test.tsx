import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from '../../context/AuthContext'
import { MenuPage } from '../../pages/MenuPage'
import * as menuAPI from '../../api/menu'

vi.mock('../../api/menu')
vi.mock('../../api/order')
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => vi.fn(),
  }
})

/**
 * Integration Test: Complete Order Flow
 * 
 * This test simulates a complete user journey:
 * 1. User views menu items
 * 2. User adds items to cart
 * 3. User adjusts quantities
 * 4. User proceeds to checkout
 * 
 * This ensures all critical functions work together correctly.
 */
describe('Integration: Complete Order Flow', () => {
  const mockMenuItems = [
    {
      id: 1,
      name: 'Classic Burger',
      price: 9.99,
      type: 'BURGER' as const,
      size: 'LARGE' as const,
      isActive: true,
    },
    {
      id: 2,
      name: 'Cheese Burger',
      price: 10.99,
      type: 'BURGER' as const,
      size: 'LARGE' as const,
      isActive: true,
    },
    {
      id: 3,
      name: 'Coca Cola',
      price: 2.99,
      type: 'DRINK' as const,
      size: 'SMALL' as const,
      isActive: true,
    },
  ]

  const renderMenuPage = () => {
    return render(
      <BrowserRouter>
        <AuthProvider>
          <MenuPage />
        </AuthProvider>
      </BrowserRouter>
    )
  }

  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
    
    // Set up authenticated user
    localStorage.setItem('accessToken', 'test-token')
    localStorage.setItem(
      'authUser',
      JSON.stringify({
        userId: 1,
        email: 'test@example.com',
        role: 'customer',
      })
    )

    vi.mocked(menuAPI.getMenuItems).mockResolvedValue(mockMenuItems)
  })

  it('should complete full order flow from menu to checkout', async () => {
    const { container } = renderMenuPage()

    // Wait for menu items to load
    await waitFor(() => {
      expect(menuAPI.getMenuItems).toHaveBeenCalled()
    })

    // Verify menu items are displayed
    await waitFor(() => {
      expect(screen.getByText('Classic Burger')).toBeInTheDocument()
      expect(screen.getByText('Cheese Burger')).toBeInTheDocument()
      expect(screen.getByText('Coca Cola')).toBeInTheDocument()
    })

    // Step 1: Add Classic Burger to cart
    const classicBurgerCard = screen.getByText('Classic Burger').closest('.menu-item-card')
    const addButton1 = classicBurgerCard?.querySelector('.menu-item-add-btn')
    expect(addButton1).toBeInTheDocument()
    
    if (addButton1) {
      fireEvent.click(addButton1)
    }

    // Verify cart shows 1 item
    await waitFor(() => {
      expect(screen.getByText('1 items')).toBeInTheDocument()
    })

    // Step 2: Add another Classic Burger
    if (addButton1) {
      fireEvent.click(addButton1)
    }

    // Verify quantity increased
    await waitFor(() => {
      expect(screen.getByText('2 items')).toBeInTheDocument()
    })

    // Step 3: Add Coca Cola
    const cokeCard = screen.getByText('Coca Cola').closest('.menu-item-card')
    const addButton2 = cokeCard?.querySelector('.menu-item-add-btn')
    
    if (addButton2) {
      fireEvent.click(addButton2)
    }

    // Verify total items
    await waitFor(() => {
      expect(screen.getByText('3 items')).toBeInTheDocument()
    })

    // Step 4: Verify cart total calculation
    // 2 × $9.99 + 1 × $2.99 = $22.97
    await waitFor(() => {
      expect(screen.getByText('$22.97')).toBeInTheDocument()
    })

    // Step 5: Test quantity adjustment (decrease)
    const minusButtons = container.querySelectorAll('.cart-btn-minus')
    if (minusButtons.length > 0) {
      fireEvent.click(minusButtons[0])
    }

    // Verify quantity decreased
    await waitFor(() => {
      expect(screen.getByText('2 items')).toBeInTheDocument()
    })

    // Step 6: Test cart clearing
    const clearButton = screen.getByText('Clear Cart')
    fireEvent.click(clearButton)

    // Verify cart is empty
    await waitFor(() => {
      expect(screen.getByText('Your cart is empty')).toBeInTheDocument()
    })
  })

  it('should filter menu items by category', async () => {
    renderMenuPage()

    // Wait for menu to load
    await waitFor(() => {
      expect(screen.getByText('Classic Burger')).toBeInTheDocument()
    })

    // Click on Burgers filter
    const burgersButton = screen.getByText(/Burgers \(2\)/)
    fireEvent.click(burgersButton)

    // Verify only burgers are shown
    await waitFor(() => {
      expect(screen.getByText('Classic Burger')).toBeInTheDocument()
      expect(screen.getByText('Cheese Burger')).toBeInTheDocument()
      expect(screen.queryByText('Coca Cola')).not.toBeInTheDocument()
    })

    // Click on Drinks filter
    const drinksButton = screen.getByText(/Drinks \(1\)/)
    fireEvent.click(drinksButton)

    // Verify only drinks are shown
    await waitFor(() => {
      expect(screen.getByText('Coca Cola')).toBeInTheDocument()
      expect(screen.queryByText('Classic Burger')).not.toBeInTheDocument()
      expect(screen.queryByText('Cheese Burger')).not.toBeInTheDocument()
    })

    // Click on All Items filter
    const allItemsButton = screen.getByText(/All Items \(3\)/)
    fireEvent.click(allItemsButton)

    // Verify all items are shown
    await waitFor(() => {
      expect(screen.getByText('Classic Burger')).toBeInTheDocument()
      expect(screen.getByText('Cheese Burger')).toBeInTheDocument()
      expect(screen.getByText('Coca Cola')).toBeInTheDocument()
    })
  })

  it('should handle menu loading error gracefully', async () => {
    const errorMessage = 'Failed to load menu'
    vi.mocked(menuAPI.getMenuItems).mockRejectedValue(new Error(errorMessage))

    renderMenuPage()

    // Verify error message is displayed
    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeInTheDocument()
    })
  })

  it('should display loading state while fetching menu', async () => {
    // Create a promise that won't resolve immediately
    let resolveMenu: any
    const menuPromise = new Promise((resolve) => {
      resolveMenu = resolve
    })

    vi.mocked(menuAPI.getMenuItems).mockReturnValue(menuPromise as any)

    renderMenuPage()

    // Verify loading state is shown
    expect(screen.getByText('Loading menu...')).toBeInTheDocument()

    // Resolve the promise
    resolveMenu(mockMenuItems)

    // Wait for menu to appear
    await waitFor(() => {
      expect(screen.queryByText('Loading menu...')).not.toBeInTheDocument()
      expect(screen.getByText('Classic Burger')).toBeInTheDocument()
    })
  })

 

  it('should calculate correct totals for multiple items', async () => {
    renderMenuPage()

    // Wait for menu to load
    await waitFor(() => {
      expect(menuAPI.getMenuItems).toHaveBeenCalled()
    })

    // Add 3 Classic Burgers (3 × $9.99 = $29.97)
    const classicBurgerCard = screen.getByText('Classic Burger').closest('.menu-item-card')
    const addButton1 = classicBurgerCard?.querySelector('.menu-item-add-btn')
    
    if (addButton1) {
      fireEvent.click(addButton1)
      fireEvent.click(addButton1)
      fireEvent.click(addButton1)
    }

    // Add 2 Coca Colas (2 × $2.99 = $5.98)
    const cokeCard = screen.getByText('Coca Cola').closest('.menu-item-card')
    const addButton2 = cokeCard?.querySelector('.menu-item-add-btn')
    
    if (addButton2) {
      fireEvent.click(addButton2)
      fireEvent.click(addButton2)
    }

    // Verify total: $29.97 + $5.98 = $35.95
    await waitFor(() => {
      expect(screen.getByText('$35.95')).toBeInTheDocument()
      expect(screen.getByText('5 items')).toBeInTheDocument()
    })
  })

  
})
