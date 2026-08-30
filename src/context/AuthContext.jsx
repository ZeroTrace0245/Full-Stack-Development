import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import apiClient from '../api/client'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState('login')

  const finishLogin = useCallback((result, remember = true) => {
    apiClient.setToken(result.token, remember)
    setUser(result.user)
    setCurrentPage('dashboard')
  }, [])

  useEffect(() => {
    if (!apiClient.getToken()) {
      setIsLoading(false)
      return
    }
    apiClient.getCurrentUser()
      .then(({ user: currentUser }) => {
        setUser(currentUser)
        setCurrentPage('dashboard')
      })
      .catch(() => apiClient.clearToken())
      .finally(() => setIsLoading(false))
  }, [])

  const login = useCallback(async (identifier, password, remember = false) => {
    const result = await apiClient.login(identifier, password)
    finishLogin(result, remember)
    return result
  }, [finishLogin])

  const adminLogin = useCallback(async (identifier, password, remember = false) => {
    const result = await apiClient.login(identifier, password)
    if (result.user?.role !== 'Admin') {
      apiClient.clearToken()
      throw new Error('This account does not have administrator access.')
    }
    finishLogin(result, remember)
    setCurrentPage('admin')
    return result
  }, [finishLogin])

  const register = useCallback(async (username, email, password) => {
    const result = await apiClient.register(username, email, password)
    finishLogin(result, true)
    return result
  }, [finishLogin])

  const logout = useCallback(() => {
    apiClient.clearToken()
    setUser(null)
    setCurrentPage('login')
  }, [])

  const goToBoard = () => {
    setCurrentPage('board')
  }

  const goToDashboard = () => {
    setCurrentPage('dashboard')
  }

  const goToTeam = () => {
    setCurrentPage('team')
  }

  const goToReports = () => {
    setCurrentPage('reports')
  }

  const goToChat = () => {
    setCurrentPage('chat')
  }

  const goToAdmin = () => {
    setCurrentPage('admin')
  }

  const goToAdminLogin = () => setCurrentPage('admin-login')
  const goToLogin = () => setCurrentPage('login')

  const value = useMemo(() => ({
      user,
      isLoggedIn: !!user,
      isLoading,
      currentPage,
      login,
      adminLogin,
      register,
      logout,
      goToBoard,
      goToDashboard,
      goToTeam,
      goToReports,
      goToChat
      ,goToAdmin
      ,goToAdminLogin,
      goToLogin
  }), [user, isLoading, currentPage, login, register, logout])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>

}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
