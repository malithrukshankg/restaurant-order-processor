import { describe, it, expect, beforeEach, vi } from 'vitest'
import { apiFetch } from '../../api/client'

describe('API Client', () => {
  beforeEach(() => {
    localStorage.clear()
    global.fetch = vi.fn()
  })

  describe('apiFetch', () => {
    it('should make a GET request without token', async () => {
      const mockResponse = { data: 'test' }
      ;(global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      })

      const result = await apiFetch('/test')

      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:8080/api/test',
        expect.objectContaining({
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
          }),
        })
      )
      expect(result).toEqual(mockResponse)
    })

    it('should include Authorization header when token exists', async () => {
      const token = 'test-token'
      localStorage.setItem('accessToken', token)

      const mockResponse = { data: 'test' }
      ;(global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      })

      await apiFetch('/test')

      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:8080/api/test',
        expect.objectContaining({
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          }),
        })
      )
    })

    it('should make a POST request with body', async () => {
      const requestBody = { name: 'test', email: 'test@test.com' }
      const mockResponse = { success: true }

      ;(global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      })

      const result = await apiFetch('/test', {
        method: 'POST',
        body: JSON.stringify(requestBody),
      })

      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:8080/api/test',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(requestBody),
        })
      )
      expect(result).toEqual(mockResponse)
    })

    it('should throw error on failed request with message', async () => {
      const errorMessage = 'Invalid credentials'
      ;(global.fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: async () => ({ message: errorMessage }),
      })

      await expect(apiFetch('/test')).rejects.toThrow(errorMessage)
    })

    it('should throw generic error on failed request without message', async () => {
      ;(global.fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: async () => ({}),
      })

      await expect(apiFetch('/test')).rejects.toThrow('Request failed (500)')
    })

    it('should handle JSON parse errors gracefully', async () => {
      ;(global.fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: async () => {
          throw new Error('Invalid JSON')
        },
      })

      await expect(apiFetch('/test')).rejects.toThrow('Request failed (500)')
    })

    it('should merge custom headers with default headers', async () => {
      const mockResponse = { data: 'test' }
      ;(global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      })

      await apiFetch('/test', {
        headers: {
          'X-Custom-Header': 'custom-value',
        },
      })

      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:8080/api/test',
        expect.objectContaining({
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
            'X-Custom-Header': 'custom-value',
          }),
        })
      )
    })
  })
})
