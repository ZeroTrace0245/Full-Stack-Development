/**
 * Generate random user names in format "USER 001", "USER 002", etc.
 * Uses a seeded random for consistency across app loads
 */

export function generateUsers(count = 12) {
  const users = []
  for (let i = 1; i <= count; i++) {
    users.push(`USER ${String(i).padStart(3, '0')}`)
  }
  return users
}

/**
 * Get a consistent set of team members (seeded, same each session)
 */
export function getTeamMembers() {
  return generateUsers(12)
}

/**
 * Pick a random user from the team
 */
export function getRandomUser() {
  const team = getTeamMembers()
  return team[Math.floor(Math.random() * team.length)]
}

/**
 * Get user initials (e.g., "USER 010" => "U0")
 */
export function getUserInitials(userName) {
  if (!userName) return 'UN'
  // For "USER 001" format, return first letter + last digit
  const parts = userName.split(' ')
  if (parts.length === 2) {
    return (parts[0][0] + parts[1][parts[1].length - 1]).toUpperCase()
  }
  return userName.substring(0, 2).toUpperCase()
}
