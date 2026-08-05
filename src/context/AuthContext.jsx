import React, { createContext, useState, useContext } from 'react'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [currentPage, setCurrentPage] = useState('login') // 'login' | 'dashboard' | 'board'

  const login = (username) => {
    setUser({ username, loginTime: new Date() })
    setCurrentPage('dashboard')
  }

  const logout = () => {
    setUser(null)
    setCurrentPage('login')
  }

  const goToBoard = () => {
    setCurrentPage('board')
  }

  const goToDashboard = () => {
    setCurrentPage('dashboard')
  }

  return (
    <AuthContext.Provider value={{
      user,
      isLoggedIn: !!user,
      currentPage,
      login,
      logout,
      goToBoard,
      goToDashboard
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
