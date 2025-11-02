import React, { createContext, useContext } from 'react'
import { useAuthActions } from '@convex-dev/auth/react'
import { api } from '../../convex/_generated/api'
import type { Id } from 'convex/_generated/dataModel'
import { useStableQuery } from '@/hooks/useStableQuery'

interface User {
  userId: Id<'users'>
  username: string
  displayName: string
  profilePicture?: string
  email: string
}

interface AuthContextType {
  isAuthenticated: boolean
  user: User | null
  hasProfile: boolean
  isLoading: boolean
  signIn: (provider: string) => void
  signOut: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { signIn, signOut } = useAuthActions()

  // Get current user from our custom query
  const authData = useStableQuery(api.currentUser.currentUser)

  const isAuthenticated = !!authData?.isAuthenticated
  const hasProfile = !!authData?.profile
  const isLoading = authData === undefined

  // Extract user data from profile or auth identity
  const user: User | null =
    authData?.profile ||
    (authData
      ? {
          userId: authData.userId,
          username: '', // Will be set in profile
          displayName: authData.name || authData.email,
          profilePicture: authData.profilePictureUrl,
          email: authData.email,
        }
      : null)

  const value: AuthContextType = {
    isAuthenticated,
    user,
    hasProfile,
    isLoading,
    signIn,
    signOut,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
