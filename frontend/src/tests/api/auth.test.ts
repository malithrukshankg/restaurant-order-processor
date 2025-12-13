import { describe, it, expect, beforeEach, vi } from 'vitest'
import { login, register } from '../../api/auth'
import * as client from '../../api/client'

// ✅ mock the SAME path you import
vi.mock('../../api/client', () => ({
  apiFetch: vi.fn(),
}))

describe('Auth API', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('login', () => {
    it('should call apiFetch with correct endpoint and credentials', async () => {
      const email = 'test@example.com'
      const password = 'password123'
      const mockResponse = {
        token: 'test-token',
        user: { userId: 1, email, role: 'customer' as const },
      }

      vi.mocked(client.apiFetch).mockResolvedValueOnce(mockResponse)

      const result = await login(email, password)

      expect(client.apiFetch).toHaveBeenCalledWith('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      })
      expect(result).toEqual(mockResponse)
    })

    it('should throw error when login fails', async () => {
      const errorMessage = 'Invalid credentials'
      vi.mocked(client.apiFetch).mockRejectedValueOnce(new Error(errorMessage))

      await expect(login('test@example.com', 'wrong')).rejects.toThrow(errorMessage)
    })

    it('should handle network errors', async () => {
      vi.mocked(client.apiFetch).mockRejectedValueOnce(new Error('Network error'))

      await expect(login('test@example.com', 'password')).rejects.toThrow('Network error')
    })
  })

  describe('register', () => {
    it('should call apiFetch with correct endpoint and user data', async () => {
      const name = 'John Doe'
      const phone = 1234567890
      const email = 'john@example.com'
      const password = 'password123'
      const mockResponse = { message: 'User registered successfully' }

      vi.mocked(client.apiFetch).mockResolvedValueOnce(mockResponse)

      const result = await register(name, phone, email, password)

      expect(client.apiFetch).toHaveBeenCalledWith('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ name, phone, email, password }),
      })
      expect(result).toEqual(mockResponse)
    })

    it('should throw error when email already exists', async () => {
      const errorMessage = 'Email already registered'
      vi.mocked(client.apiFetch).mockRejectedValueOnce(new Error(errorMessage))

      await expect(
        register('John Doe', 1234567890, 'existing@example.com', 'password')
      ).rejects.toThrow(errorMessage)
    })

    it('should handle validation errors', async () => {
      const errorMessage = 'Invalid email format'
      vi.mocked(client.apiFetch).mockRejectedValueOnce(new Error(errorMessage))

      await expect(
        register('John Doe', 1234567890, 'invalid-email', 'password')
      ).rejects.toThrow(errorMessage)
    })
  })
})
