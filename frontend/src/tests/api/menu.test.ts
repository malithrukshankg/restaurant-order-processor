import { describe, it, expect, beforeEach, vi } from 'vitest'
import { getMenuItems } from '../../api/menu'
import * as client from '../../api/client'

vi.mock('../../api/client', () => ({
  apiFetch: vi.fn(),
}))

describe('Menu API', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getMenuItems', () => {
    it('should fetch all active menu items', async () => {
      const mockMenuItems = [
        { id: 1, name: 'Classic Burger', price: 9.99, type: 'BURGER' as const, size: 'LARGE' as const, isActive: true },
        { id: 2, name: 'Coca Cola', price: 2.99, type: 'DRINK' as const, size: 'SMALL' as const, isActive: true },
      ]

      vi.mocked(client.apiFetch).mockResolvedValueOnce(mockMenuItems)

      const result = await getMenuItems()

      expect(client.apiFetch).toHaveBeenCalledWith('/menu', { method: 'GET' })
      expect(result).toEqual(mockMenuItems)
      expect(result).toHaveLength(2)
    })

    // ...rest of your tests unchanged
  })
})
