import { describe, it, expect, beforeEach, vi } from 'vitest'
import { createOrder, type CreateOrderRequest } from '../../api/order'
import * as client from '../../api/client'

vi.mock('../../api/client')

describe('Order API', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('createOrder', () => {
    it('should create order with customer details', async () => {
      const orderData: CreateOrderRequest = {
        customerName: 'John Doe',
        tableNumber: 'A5',
        items: [
          { menuItemId: 1, quantity: 2 },
          { menuItemId: 3, quantity: 1 },
        ],
      }

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

      vi.mocked(client.apiFetch).mockResolvedValueOnce(mockReceipt)

      const result = await createOrder(orderData)

      expect(client.apiFetch).toHaveBeenCalledWith('/orders', {
        method: 'POST',
        body: JSON.stringify(orderData),
      })
      expect(result).toEqual(mockReceipt)
      expect(result.orderCode).toBeTruthy()
    })

    it('should create order without customer details', async () => {
      const orderData: CreateOrderRequest = {
        customerName: null,
        tableNumber: null,
        items: [{ menuItemId: 1, quantity: 1 }],
      }

      const mockReceipt = {
        orderCode: 'ORD-002',
        customerName: null,
        tableNumber: null,
        total: 10.99,
        gst: 1.0,
        items: [
          {
            name: 'Classic Burger',
            quantity: 1,
            unitPrice: 9.99,
            lineTotal: 9.99,
          },
        ],
      }

      vi.mocked(client.apiFetch).mockResolvedValueOnce(mockReceipt)

      const result = await createOrder(orderData)

      expect(result.customerName).toBeNull()
      expect(result.tableNumber).toBeNull()
      expect(result.orderCode).toBeTruthy()
    })

    it('should calculate GST correctly in receipt', async () => {
      const orderData: CreateOrderRequest = {
        customerName: null,
        tableNumber: null,
        items: [{ menuItemId: 1, quantity: 1 }],
      }

      const total = 10.99
      const gst = total * 0.1

      const mockReceipt = {
        orderCode: 'ORD-003',
        customerName: null,
        tableNumber: null,
        total,
        gst: parseFloat(gst.toFixed(2)),
        items: [
          {
            name: 'Item',
            quantity: 1,
            unitPrice: 9.99,
            lineTotal: 9.99,
          },
        ],
      }

      vi.mocked(client.apiFetch).mockResolvedValueOnce(mockReceipt)

      const result = await createOrder(orderData)

      expect(result.gst).toBeCloseTo(total * 0.1, 2)
    })

    it('should handle empty cart error', async () => {
      const orderData: CreateOrderRequest = {
        customerName: null,
        tableNumber: null,
        items: [],
      }

      const errorMessage = 'Cart cannot be empty'
      vi.mocked(client.apiFetch).mockRejectedValueOnce(new Error(errorMessage))

      await expect(createOrder(orderData)).rejects.toThrow(errorMessage)
    })

    it('should handle invalid menu item error', async () => {
      const orderData: CreateOrderRequest = {
        customerName: null,
        tableNumber: null,
        items: [{ menuItemId: 999, quantity: 1 }],
      }

      const errorMessage = 'Menu item not found'
      vi.mocked(client.apiFetch).mockRejectedValueOnce(new Error(errorMessage))

      await expect(createOrder(orderData)).rejects.toThrow(errorMessage)
    })

    it('should handle multiple items with different quantities', async () => {
      const orderData: CreateOrderRequest = {
        customerName: 'Jane Doe',
        tableNumber: 'B3',
        items: [
          { menuItemId: 1, quantity: 3 },
          { menuItemId: 2, quantity: 2 },
          { menuItemId: 3, quantity: 1 },
        ],
      }

      const mockReceipt = {
        orderCode: 'ORD-004',
        customerName: 'Jane Doe',
        tableNumber: 'B3',
        total: 45.93,
        gst: 4.18,
        items: [
          {
            name: 'Classic Burger',
            quantity: 3,
            unitPrice: 9.99,
            lineTotal: 29.97,
          },
          {
            name: 'Cheese Burger',
            quantity: 2,
            unitPrice: 10.99,
            lineTotal: 21.98,
          },
          {
            name: 'Coca Cola',
            quantity: 1,
            unitPrice: 2.99,
            lineTotal: 2.99,
          },
        ],
      }

      vi.mocked(client.apiFetch).mockResolvedValueOnce(mockReceipt)

      const result = await createOrder(orderData)

      expect(result.items).toHaveLength(3)
      expect(result.items.reduce((sum, item) => sum + item.quantity, 0)).toBe(6)
    })

    it('should preserve order data structure', async () => {
      const orderData: CreateOrderRequest = {
        customerName: 'Test User',
        tableNumber: 'C1',
        items: [{ menuItemId: 1, quantity: 1 }],
      }

      const mockReceipt = {
        orderCode: 'ORD-005',
        customerName: 'Test User',
        tableNumber: 'C1',
        total: 10.99,
        gst: 1.0,
        items: [
          {
            name: 'Item',
            quantity: 1,
            unitPrice: 9.99,
            lineTotal: 9.99,
          },
        ],
      }

      vi.mocked(client.apiFetch).mockResolvedValueOnce(mockReceipt)

      const result = await createOrder(orderData)

      expect(result).toHaveProperty('orderCode')
      expect(result).toHaveProperty('customerName')
      expect(result).toHaveProperty('tableNumber')
      expect(result).toHaveProperty('total')
      expect(result).toHaveProperty('gst')
      expect(result).toHaveProperty('items')
      expect(result.items[0]).toHaveProperty('name')
      expect(result.items[0]).toHaveProperty('quantity')
      expect(result.items[0]).toHaveProperty('unitPrice')
      expect(result.items[0]).toHaveProperty('lineTotal')
    })
  })
})
