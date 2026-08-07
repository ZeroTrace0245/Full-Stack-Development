import React, { useState } from 'react'
import { getTeamMembers } from '../utils/generateUsers'
import { useAuth } from '../context/AuthContext'
import styles from './TeamMembers.module.css'

export default function TeamMembers() {
  const { goToDashboard } = useAuth()
  const [team, setTeam] = useState(getTeamMembers())
  const [newMember, setNewMember] = useState('')

  const handleAdd = (e) => {
    e.preventDefault()
    const name = newMember.trim()
    if (!name) return
    setTeam(prev => [name, ...prev])
    setNewMember('')
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1>Team Members</h1>
        <button className={styles.backBtn} onClick={goToDashboard}>← Back</button>
      </header>

      <section className={styles.addForm}>
        <form onSubmit={handleAdd}>
          <input
            type="text"
            placeholder="Add team member (e.g. JANE DOE or USER 013)"
            value={newMember}
            onChange={(e) => setNewMember(e.target.value)}
            className={styles.input}
          />
          <button type="submit" className={styles.btn}>Add</button>
        </form>
      </section>

      <ul className={styles.list}>
        {team.map((member, i) => (
          <li key={`${member}-${i}`} className={styles.item}>
            <div className={styles.avatar}>{member.substring(0,2).toUpperCase()}</div>
            <div className={styles.name}>{member}</div>
          </li>
        ))}
      </ul>
    </div>
  )
}
