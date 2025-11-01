import React, { createContext, useContext } from 'react'
import { useAuthActions } from '@convex-dev/auth/react'
import { useQuery } from 'convex/react'
import { api } from '../../convex/_generated/api'

interface User {
  userId: string
  username: string
  displayName: string
  profilePicture?: string
  email: string
}

interface AuthContextType {
  isAuthenticated: boolean
  user: User | null
  isLoading: boolean
  signIn: (provider: string) => void
  signOut: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { signIn, signOut } = useAuthActions()

  // Get current user from our custom query
  const userProfile = useQuery(api.currentUser.currentUser)

  const isAuthenticated = !!userProfile
  const isLoading = userProfile === undefined

  const value: AuthContextType = {
    isAuthenticated,
    user: userProfile || null,
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
