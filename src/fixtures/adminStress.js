const users = Array.from({ length: 1000 }, (_, index) => ({
  id: `stress-user-${index}`, username: index % 7 === 0 ? 'Environmental_Monitoring_Integration_Shelf_B04_Agent' : `Workspace member ${index}`,
  email: `${'a'.repeat(64)}@${'b'.repeat(63)}.${'c'.repeat(63)}.${'d'.repeat(57)}.com`,
  role: index % 4 === 0 ? 'Admin' : 'Standard User', accountType: index % 7 === 0 ? 'system' : 'human',
  permissions: index % 7 === 0 ? Array.from({ length: 12 }, (_, scope) => `environment:shelf-b04:telemetry:calibration:threshold-policies:read:${scope}`) : [],
}))
export const adminStress = {
  users,
  tasks: Array.from({ length: 250 }, (_, index) => ({ id: `stress-task-${index}`, title: `Task ${index} · ${'Validate dependency mapping and assignment permissions across the shelf monitoring rollout. '.repeat(4)}`, assignmentLocked: index % 2 === 0, assignedUserId: index % 2 === 0 ? users[1].id : '', assignee: index % 2 === 0 ? users[1].username : '' })),
  messages: Array.from({ length: 5000 }, (_, index) => ({ id: `stress-log-${index}`, createdAt: new Date(Date.now() - index * 60000).toISOString(), sender: { username: `Audit member ${index % 100}` }, projectId: 'environmental-monitoring-rollout-and-schedule-integrity', content: `Audit record ${index}. ${'Confirmed permission boundaries, task ownership and schedule dependencies. '.repeat(index % 8 + 1)}${index % 9 === 0 ? 'TRACE_'.repeat(100) : ''}` })),
}
