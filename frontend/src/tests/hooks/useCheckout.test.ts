import { describe, it, expect, beforeEach, vi } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import { useCheckout } from '../../hooks/useCheckout'
import * as orderAPI from '../../api/order'
import type { CartItem } from '../../types/cart'
import { BrowserRouter } from 'react-router-dom'

vi.mock('../../api/order')
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => vi.fn(),
  }
})

describe('useCheckout Hook', () => {
  const mockCart: CartItem[] = [
    {
      menuItem: {
        id: 1,
        name: 'Classic Burger',
        price: 9.99,
        type: 'BURGER',
        size: 'LARGE',
        isActive: true,
      },
      quantity: 2,
    },
    {
      menuItem: {
        id: 2,
        name: 'Coca Cola',
        price: 2.99,
        type: 'DRINK',
        size: 'SMALL',
        isActive: true,
      },
      quantity: 1,
    },
  ]

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Initial State', () => {
    it('should initialize with empty customer details', () => {
      const { result } = renderHook(() => useCheckout(mockCart), {
        wrapper: BrowserRouter,
      })

      expect(result.current.customerName).toBe('')
      expect(result.current.tableNumber).toBe('')
      expect(result.current.loading).toBe(false)
      expect(result.current.error).toBeNull()
    })
  })

  describe('Customer Name Management', () => {
    it('should update customer name', () => {
      const { result } = renderHook(() => useCheckout(mockCart), {
        wrapper: BrowserRouter,
      })

      act(() => {
        result.current.setCustomerName('John Doe')
      })

      expect(result.current.customerName).toBe('John Doe')
    })

    it('should handle empty customer name', () => {
      const { result } = renderHook(() => useCheckout(mockCart), {
        wrapper: BrowserRouter,
      })

      act(() => {
        result.current.setCustomerName('')
      })

      expect(result.current.customerName).toBe('')
    })
  })

  describe('Table Number Management', () => {
    it('should update table number', () => {
      const { result } = renderHook(() => useCheckout(mockCart), {
        wrapper: BrowserRouter,
      })

      act(() => {
        result.current.setTableNumber('A5')
      })

      expect(result.current.tableNumber).toBe('A5')
    })

    it('should handle empty table number', () => {
      const { result } = renderHook(() => useCheckout(mockCart), {
        wrapper: BrowserRouter,
      })

      act(() => {
        result.current.setTableNumber('')
      })

      expect(result.current.tableNumber).toBe('')
    })
  })

  describe('handlePlaceOrder', () => {
    it('should place order successfully with customer details', async () => {
      const mockReceipt = {
        orderCode: 'ORD-001',
        customerName: 'John Doe',
        tableNumber: 'A5',
        total: 25.97,
        gst: 2.36,
        items: [
          {
            name: 'Classic Burger',
            quantity: 2,
            unitPrice: 9.99,
            lineTotal: 19.98,
          },
          {
            name: 'Coca Cola',
            quantity: 1,
            unitPrice: 2.99,
            lineTotal: 2.99,
          },
        ],
      }

      vi.mocked(orderAPI.createOrder).mockResolvedValueOnce(mockReceipt)

      const { result } = renderHook(() => useCheckout(mockCart), {
        wrapper: BrowserRouter,
      })

      act(() => {
        result.current.setCustomerName('John Doe')
        result.current.setTableNumber('A5')
      })

      const mockEvent = {
        preventDefault: vi.fn(),
      } as any

      await act(async () => {
        await result.current.handlePlaceOrder(mockEvent)
      })

      expect(mockEvent.preventDefault).toHaveBeenCalled()
      expect(orderAPI.createOrder).toHaveBeenCalledWith({
        customerName: 'John Doe',
        tableNumber: 'A5',
        items: [
          { menuItemId: 1, quantity: 2 },
          { menuItemId: 2, quantity: 1 },
        ],
      })
    })

    it('should place order with null values for empty customer details', async () => {
      const mockReceipt = {
        orderCode: 'ORD-002',
        customerName: null,
        tableNumber: null,
        total: 25.97,
        gst: 2.36,
        items: [],
      }

      vi.mocked(orderAPI.createOrder).mockResolvedValueOnce(mockReceipt)

      const { result } = renderHook(() => useCheckout(mockCart), {
        wrapper: BrowserRouter,
      })

      const mockEvent = {
        preventDefault: vi.fn(),
      } as any

      await act(async () => {
        await result.current.handlePlaceOrder(mockEvent)
      })

      expect(orderAPI.createOrder).toHaveBeenCalledWith({
        customerName: null,
        tableNumber: null,
        items: expect.any(Array),
      })
    })

    it('should trim whitespace from customer details', async () => {
      const mockReceipt = {
        orderCode: 'ORD-003',
        customerName: 'John Doe',
        tableNumber: 'A5',
        total: 25.97,
        gst: 2.36,
        items: [],
      }

      vi.mocked(orderAPI.createOrder).mockResolvedValueOnce(mockReceipt)

      const { result } = renderHook(() => useCheckout(mockCart), {
        wrapper: BrowserRouter,
      })

      act(() => {
        result.current.setCustomerName('  John Doe  ')
        result.current.setTableNumber('  A5  ')
      })

      const mockEvent = {
        preventDefault: vi.fn(),
      } as any

      await act(async () => {
        await result.current.handlePlaceOrder(mockEvent)
      })

      expect(orderAPI.createOrder).toHaveBeenCalledWith({
        customerName: 'John Doe',
        tableNumber: 'A5',
        items: expect.any(Array),
      })
    })

    it('should set loading state during order placement', async () => {
      const mockReceipt = {
        orderCode: 'ORD-004',
        customerName: null,
        tableNumber: null,
        total: 25.97,
        gst: 2.36,
        items: [],
      }

      let resolveOrder: any
      const orderPromise = new Promise((resolve) => {
        resolveOrder = resolve
      })

      vi.mocked(orderAPI.createOrder).mockReturnValueOnce(orderPromise as any)

      const { result } = renderHook(() => useCheckout(mockCart), {
        wrapper: BrowserRouter,
      })

      const mockEvent = {
        preventDefault: vi.fn(),
      } as any

      act(() => {
        result.current.handlePlaceOrder(mockEvent)
      })

      await waitFor(() => {
        expect(result.current.loading).toBe(true)
      })

      await act(async () => {
        resolveOrder(mockReceipt)
      })

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })
    })

    it('should handle order creation error', async () => {
      const errorMessage = 'Failed to create order'
      vi.mocked(orderAPI.createOrder).mockRejectedValueOnce(
        new Error(errorMessage)
      )

      const { result } = renderHook(() => useCheckout(mockCart), {
        wrapper: BrowserRouter,
      })

      const mockEvent = {
        preventDefault: vi.fn(),
      } as any

      await act(async () => {
        await result.current.handlePlaceOrder(mockEvent)
      })

      expect(result.current.error).toBe(errorMessage)
      expect(result.current.loading).toBe(false)
    })

    it('should clear previous error before placing new order', async () => {
      const mockReceipt = {
        orderCode: 'ORD-005',
        customerName: null,
        tableNumber: null,
        total: 25.97,
        gst: 2.36,
        items: [],
      }

      // First call fails
      vi.mocked(orderAPI.createOrder).mockRejectedValueOnce(
        new Error('First error')
      )

      const { result } = renderHook(() => useCheckout(mockCart), {
        wrapper: BrowserRouter,
      })

      const mockEvent = {
        preventDefault: vi.fn(),
      } as any

      // First attempt
      await act(async () => {
        await result.current.handlePlaceOrder(mockEvent)
      })

      expect(result.current.error).toBe('First error')

      // Second call succeeds
      vi.mocked(orderAPI.createOrder).mockResolvedValueOnce(mockReceipt)

      // Second attempt
      await act(async () => {
        await result.current.handlePlaceOrder(mockEvent)
      })

      expect(result.current.error).toBeNull()
    })

    it('should format cart items correctly for API', async () => {
      const mockReceipt = {
        orderCode: 'ORD-006',
        customerName: null,
        tableNumber: null,
        total: 25.97,
        gst: 2.36,
        items: [],
      }

      vi.mocked(orderAPI.createOrder).mockResolvedValueOnce(mockReceipt)

      const { result } = renderHook(() => useCheckout(mockCart), {
        wrapper: BrowserRouter,
      })

      const mockEvent = {
        preventDefault: vi.fn(),
      } as any

      await act(async () => {
        await result.current.handlePlaceOrder(mockEvent)
      })

      expect(orderAPI.createOrder).toHaveBeenCalledWith({
        customerName: null,
        tableNumber: null,
        items: [
          { menuItemId: 1, quantity: 2 },
          { menuItemId: 2, quantity: 1 },
        ],
      })
    })
  })
})
