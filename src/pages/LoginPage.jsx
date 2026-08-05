import React, { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import styles from './LoginPage.module.css'

export default function LoginPage() {
  const { login } = useAuth()
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    rememberMe: false
  })
  const [error, setError] = useState('')

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
    if (error) setError('')
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    if (!formData.username.trim()) {
      setError('Username is required')
      return
    }
    if (!formData.password.trim()) {
      setError('Password is required')
      return
    }

    // Accept any username/password combination
    login(formData.username)
  }

  return (
    <div className={styles.container}>
      <div className={styles.background}></div>

      <div className={styles.content}>
        {/* Logo/Header */}
        <div className={styles.header}>
          <div className={styles.logo}>
            <span className={styles.logoIcon}>📊</span>
          </div>
          <h1 className={styles.title}>CollabBoard</h1>
          <p className={styles.subtitle}>Collaborative Task Management</p>
        </div>

        {/* Login Form */}
        <form className={styles.form} onSubmit={handleSubmit}>
          <h2 className={styles.formTitle}>Welcome Back</h2>
          <p className={styles.formSubtitle}>Sign in to your account</p>

          {error && <div className={styles.errorBanner}>{error}</div>}

          <div className={styles.group}>
            <label className={styles.label} htmlFor="username">
              Username or Email
            </label>
            <input
              id="username"
              type="text"
              name="username"
              placeholder="Enter your username"
              value={formData.username}
              onChange={handleChange}
              className={styles.input}
              autoFocus
            />
          </div>

          <div className={styles.group}>
            <label className={styles.label} htmlFor="password">
              Password
            </label>
            <input
              id="password"
              type="password"
              name="password"
              placeholder="Enter your password"
              value={formData.password}
              onChange={handleChange}
              className={styles.input}
            />
          </div>

          <div className={styles.rememberGroup}>
            <input
              id="rememberMe"
              type="checkbox"
              name="rememberMe"
              checked={formData.rememberMe}
              onChange={handleChange}
              className={styles.checkbox}
            />
            <label className={styles.rememberLabel} htmlFor="rememberMe">
              Remember me
            </label>
          </div>

          <button type="submit" className={styles.submitBtn}>
            Sign In
          </button>

          <div className={styles.footer}>
            <p className={styles.footerText}>
              Demo mode: Any username & password works 🎉
            </p>
          </div>
        </form>
      </div>
    </div>
  )
}
