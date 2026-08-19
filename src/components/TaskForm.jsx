import React, { useState, useEffect } from 'react'
import { getTeamMembers } from '../utils/generateUsers'
import styles from './TaskForm.module.css'

const TEAM_MEMBERS = getTeamMembers()

export default function TaskForm({ columns, selectedColumn, onSubmit, onCancel, editingTask }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    assignee: TEAM_MEMBERS[0],
    estimate: '2',
    priority: 'Medium',
    type: 'Feature',
    dueDate: '',
    columnId: selectedColumn?.id || (columns[0]?.id || '')
  })

  const [errors, setErrors] = useState({})

  // Update form when editingTask changes
  useEffect(() => {
    if (editingTask) {
      setFormData({
        title: editingTask.title || '',
        description: editingTask.description || '',
        assignee: editingTask.assignee || TEAM_MEMBERS[0],
        estimate: editingTask.estimate?.toString() || '2',
        priority: editingTask.priority || 'Medium',
        type: editingTask.type || 'Feature',
        dueDate: editingTask.dueDate || '',
        columnId: editingTask.columnId || selectedColumn?.id || (columns[0]?.id || '')
      })
    } else {
      setFormData({
        title: '',
        description: '',
        assignee: TEAM_MEMBERS[0],
        estimate: '2',
        priority: 'Medium',
        type: 'Feature',
        dueDate: '',
        columnId: selectedColumn?.id || (columns[0]?.id || '')
      })
    }
  }, [editingTask, selectedColumn, columns])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    // Clear error for this field on change
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  const validate = () => {
    const newErrors = {}
    if (!formData.title.trim()) {
      newErrors.title = 'Title is required'
    }
    if (!formData.assignee) {
      newErrors.assignee = 'Assignee is required'
    }
    if (!formData.estimate || isNaN(formData.estimate) || Number(formData.estimate) <= 0) {
      newErrors.estimate = 'Estimate must be a positive number'
    }
    if (!formData.columnId) {
      newErrors.columnId = 'Column is required'
    }
    return newErrors
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const newErrors = validate()

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    onSubmit({
      id: editingTask?.id || `t-${Date.now()}`,
      title: formData.title.trim(),
      description: formData.description.trim(),
      assignee: formData.assignee,
      estimate: Number(formData.estimate),
      priority: formData.priority,
      type: formData.type,
      dueDate: formData.dueDate,
      columnId: formData.columnId
    })

    // Reset form
    setFormData({
      title: '',
      description: '',
      assignee: TEAM_MEMBERS[0],
      estimate: '2',
      priority: 'Medium',
      type: 'Feature',
      dueDate: '',
      columnId: selectedColumn?.id || (columns[0]?.id || '')
    })
    setErrors({})
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <div className={styles.group}>
        <label className={styles.label} htmlFor="title">
          Task Title *
        </label>
        <input
          id="title"
          type="text"
          name="title"
          placeholder="Enter task title..."
          value={formData.title}
          onChange={handleChange}
          className={`${styles.input} ${errors.title ? styles.error : ''}`}
          autoFocus
        />
        {errors.title && <p className={styles.errorMsg}>{errors.title}</p>}
      </div>

      <div className={styles.group}>
        <label className={styles.label} htmlFor="assignee">
          Assign To *
        </label>
        <select
          id="assignee"
          name="assignee"
          value={formData.assignee}
          onChange={handleChange}
          className={`${styles.input} ${styles.select} ${errors.assignee ? styles.error : ''}`}
        >
          {TEAM_MEMBERS.map(member => (
            <option key={member} value={member}>
              {member}
            </option>
          ))}
        </select>
        {errors.assignee && <p className={styles.errorMsg}>{errors.assignee}</p>}
      </div>

      <div className={styles.group}>
        <label className={styles.label} htmlFor="description">
          Description
        </label>
        <textarea
          id="description"
          name="description"
          placeholder="Describe the task..."
          value={formData.description}
          onChange={handleChange}
          className={`${styles.input}`}
          rows={3}
        />
      </div>

      <div className={styles.group}>
        <label className={styles.label} htmlFor="priority">Priority</label>
        <select id="priority" name="priority" value={formData.priority} onChange={handleChange} className={`${styles.input} ${styles.select}`}>
          <option value="Low">🟢 Low</option>
          <option value="Medium">🟡 Medium</option>
          <option value="High">🔴 High</option>
        </select>
      </div>

      <div className={styles.group}>
        <label className={styles.label} htmlFor="type">Task Type</label>
        <select id="type" name="type" value={formData.type} onChange={handleChange} className={`${styles.input} ${styles.select}`}>
          <option value="Feature">Feature</option>
          <option value="Bug">Bug</option>
          <option value="UI">UI</option>
        </select>
      </div>

      <div className={styles.group}>
        <label className={styles.label} htmlFor="dueDate">Due Date</label>
        <input
          id="dueDate"
          type="date"
          name="dueDate"
          value={formData.dueDate}
          onChange={handleChange}
          className={`${styles.input}`}
        />
      </div>

      <div className={styles.group}>
        <label className={styles.label} htmlFor="estimate">
          Estimate (hours) *
        </label>
        <input
          id="estimate"
          type="number"
          name="estimate"
          placeholder="e.g., 2"
          value={formData.estimate}
          onChange={handleChange}
          className={`${styles.input} ${errors.estimate ? styles.error : ''}`}
          min="1"
          max="40"
          step="0.5"
        />
        {errors.estimate && <p className={styles.errorMsg}>{errors.estimate}</p>}
      </div>

      <div className={styles.group}>
        <label className={styles.label} htmlFor="columnId">
          Column *
        </label>
        <select
          id="columnId"
          name="columnId"
          value={formData.columnId}
          onChange={handleChange}
          className={`${styles.input} ${styles.select} ${errors.columnId ? styles.error : ''}`}
        >
          {columns.map(col => (
            <option key={col.id} value={col.id}>
              {col.title}
            </option>
          ))}
        </select>
        {errors.columnId && <p className={styles.errorMsg}>{errors.columnId}</p>}
      </div>

      <div className={styles.actions}>
        <button type="button" className={styles.btnCancel} onClick={onCancel}>
          Cancel
        </button>
        <button type="submit" className={styles.btnSubmit}>
          {editingTask ? 'Update Task' : 'Create Task'}
        </button>
      </div>
    </form>
  )
}
