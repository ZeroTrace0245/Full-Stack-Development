const now = Date.now()
const day = offset => new Date(now + offset * 86400000).toISOString().slice(0, 10)
export const reportStress = {
  tasks: Array.from({ length: 42 }, (_, index) => ({
    id: `sample-${index}`, title: `${index % 7 === 0 ? 'Validate shelf sensor telemetry, failover handling and the complete environmental acceptance workflow across all deployment zones' : 'Release readiness and dependency verification'} · ${index + 1}`,
    status: ['Sprint Backlog', 'In Development', 'Deployed to Production'][index % 3], assignee: ['Maya Fernando', 'Alexandria Wijesinghe — Infrastructure & Reliability', 'Dinesh Silva', '', 'Platform Operations'][index % 5], type: ['Feature', 'Bug', 'UI', 'Integration'][index % 4],
    startDate: day(index - 20), endDate: day(index - 15), milestone: index % 6 === 0, blockedBy: index ? [`sample-${index - 1}`, ...(index > 2 ? [`sample-${index - 3}`] : [])] : [],
  })),
  activities: Array.from({ length: 50 }, (_, index) => ({ id: `sample-event-${index}`, timestamp: new Date(now - (49 - index) * 86400000).toISOString(), text: `Release coordinator updated task ${index + 1}: ${'Reviewed environmental validation evidence, dependency readiness and the deployment acceptance checklist. '.repeat(index % 4 + 1)}` })),
  sensors: [{ name: 'Shelf B-04 · Temperature', value: '31.8 °C', alert: true, detail: 'Sample threshold: 28 °C · Check ventilation' }, { name: 'Shelf A-02 · Humidity', value: '46% RH', alert: false, detail: 'Sample range: 35–60% RH' }],
}
