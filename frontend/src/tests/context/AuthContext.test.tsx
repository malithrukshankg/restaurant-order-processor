import { describe, it, expect, beforeEach, vi } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import { AuthProvider, useAuth } from '../../context/AuthContext'
import type { AuthUser } from '../../types/auth'

describe('AuthContext', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.clearAllMocks()
  })

  describe('Initial State', () => {
    it('should start with no user when localStorage is empty', () => {
      const { result } = renderHook(() => useAuth(), {
        wrapper: AuthProvider,
      })

      expect(result.current.user).toBeNull()
      expect(result.current.isAuthenticated).toBe(false)
    })

    it('should restore user from localStorage on mount', () => {
      const mockUser: AuthUser = {
        userId: 1,
        email: 'test@example.com',
        role: 'customer',
      }

      localStorage.setItem('accessToken', 'test-token')
      localStorage.setItem('authUser', JSON.stringify(mockUser))

      const { result } = renderHook(() => useAuth(), {
        wrapper: AuthProvider,
      })

      expect(result.current.user).toEqual(mockUser)
      expect(result.current.isAuthenticated).toBe(true)
    })

    it('should handle corrupted localStorage data gracefully', () => {
      localStorage.setItem('accessToken', 'test-token')
      localStorage.setItem('authUser', 'invalid-json')

      const { result } = renderHook(() => useAuth(), {
        wrapper: AuthProvider,
      })

      expect(result.current.user).toBeNull()
      expect(result.current.isAuthenticated).toBe(false)
      expect(localStorage.getItem('authUser')).toBeNull()
    })
  })

  describe('setSession', () => {
    it('should set user and token in state and localStorage', () => {
      const { result } = renderHook(() => useAuth(), {
        wrapper: AuthProvider,
      })

      const mockUser: AuthUser = {
        userId: 1,
        email: 'test@example.com',
        role: 'customer',
      }
      const token = 'test-token'

      act(() => {
        result.current.setSession(token, mockUser)
      })

      expect(result.current.user).toEqual(mockUser)
      expect(result.current.isAuthenticated).toBe(true)
      expect(localStorage.getItem('accessToken')).toBe(token)
      expect(localStorage.getItem('authUser')).toBe(JSON.stringify(mockUser))
    })

    it('should update existing session with new credentials', () => {
      const { result } = renderHook(() => useAuth(), {
        wrapper: AuthProvider,
      })

      const firstUser: AuthUser = {
        userId: 1,
        email: 'first@example.com',
        role: 'customer',
      }

      const secondUser: AuthUser = {
        userId: 2,
        email: 'second@example.com',
        role: 'admin',
      }

      act(() => {
        result.current.setSession('token1', firstUser)
      })

      expect(result.current.user).toEqual(firstUser)

      act(() => {
        result.current.setSession('token2', secondUser)
      })

      expect(result.current.user).toEqual(secondUser)
      expect(localStorage.getItem('accessToken')).toBe('token2')
      expect(localStorage.getItem('authUser')).toBe(JSON.stringify(secondUser))
    })
  })

  describe('logout', () => {
    it('should clear user state and localStorage', () => {
      const { result } = renderHook(() => useAuth(), {
        wrapper: AuthProvider,
      })

      const mockUser: AuthUser = {
        userId: 1,
        email: 'test@example.com',
        role: 'customer',
      }

      act(() => {
        result.current.setSession('test-token', mockUser)
      })

      expect(result.current.user).toEqual(mockUser)

      act(() => {
        result.current.logout()
      })

      expect(result.current.user).toBeNull()
      expect(result.current.isAuthenticated).toBe(false)
      expect(localStorage.getItem('accessToken')).toBeNull()
      expect(localStorage.getItem('authUser')).toBeNull()
    })

    it('should handle logout when no user is logged in', () => {
      const { result } = renderHook(() => useAuth(), {
        wrapper: AuthProvider,
      })

      expect(result.current.user).toBeNull()

      act(() => {
        result.current.logout()
      })

      expect(result.current.user).toBeNull()
      expect(result.current.isAuthenticated).toBe(false)
    })
  })

  describe('Hook Error Handling', () => {
    it('should throw error when useAuth is used outside AuthProvider', () => {
      // Suppress console.error for this test
      const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})

      expect(() => {
        renderHook(() => useAuth())
      }).toThrow('useAuth must be used within AuthProvider')

      consoleError.mockRestore()
    })
  })

  describe('isAuthenticated computed value', () => {
    it('should be true when user exists', () => {
      const { result } = renderHook(() => useAuth(), {
        wrapper: AuthProvider,
      })

      const mockUser: AuthUser = {
        userId: 1,
        email: 'test@example.com',
        role: 'customer',
      }

      act(() => {
        result.current.setSession('token', mockUser)
      })

      expect(result.current.isAuthenticated).toBe(true)
    })

    it('should be false when user is null', () => {
      const { result } = renderHook(() => useAuth(), {
        wrapper: AuthProvider,
      })

      expect(result.current.isAuthenticated).toBe(false)
    })

    it('should update when user changes', () => {
      const { result } = renderHook(() => useAuth(), {
        wrapper: AuthProvider,
      })

      const mockUser: AuthUser = {
        userId: 1,
        email: 'test@example.com',
        role: 'customer',
      }

      expect(result.current.isAuthenticated).toBe(false)

      act(() => {
        result.current.setSession('token', mockUser)
      })

      expect(result.current.isAuthenticated).toBe(true)

      act(() => {
        result.current.logout()
      })

      expect(result.current.isAuthenticated).toBe(false)
    })
  })

  describe('User Roles', () => {
    it('should handle customer role correctly', () => {
      const { result } = renderHook(() => useAuth(), {
        wrapper: AuthProvider,
      })

      const customerUser: AuthUser = {
        userId: 1,
        email: 'customer@example.com',
        role: 'customer',
      }

      act(() => {
        result.current.setSession('token', customerUser)
      })

      expect(result.current.user?.role).toBe('customer')
    })

    it('should handle admin role correctly', () => {
      const { result } = renderHook(() => useAuth(), {
        wrapper: AuthProvider,
      })

      const adminUser: AuthUser = {
        userId: 1,
        email: 'admin@example.com',
        role: 'admin',
      }

      act(() => {
        result.current.setSession('token', adminUser)
      })

      expect(result.current.user?.role).toBe('admin')
    })
  })
})
