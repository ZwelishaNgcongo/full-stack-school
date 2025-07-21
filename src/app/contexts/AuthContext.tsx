// app/contexts/AuthContext.tsx
"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

interface User {
  id: number | string;
  email: string;
  name: string;
  role: "admin" | "teacher" | "student" | "parent";
  parentId?: number | string;
  classId?: string | number;
}

interface AuthContextType {
  user: User | null
  isLoading: boolean
  isSignedIn: boolean
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  signOut: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}

interface AuthProviderProps {
  children: ReactNode
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Auto-login with a default user - no authentication required
    const defaultUser: User = { 
      id: 1, 
      email: 'demo@school.com', 
      name: 'Demo User',
      role: 'admin', // Change this to test different roles: 'admin', 'teacher', 'student', 'parent'
      classId: 1 // Add classId for student testing
    }
    
    setUser(defaultUser)
    setIsLoading(false)
  }, [])

  const signIn = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    // Always return success - no actual authentication
    return { success: true }
  }

  const signOut = () => {
    // Don't actually sign out - just redirect to home
    console.log('Sign out clicked')
  }

  const value: AuthContextType = {
    user,
    isLoading,
    isSignedIn: true, // Always signed in
    signIn,
    signOut
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}