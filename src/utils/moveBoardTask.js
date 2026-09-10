export function moveBoardTask(board, taskId, sourceId, destinationId, destinationIndex, hiddenIds = []) {
  const columns = board.columns.map(column => ({ ...column, tasks: [...column.tasks] }))
  const from = columns.find(column => column.id === sourceId)
  const to = columns.find(column => column.id === destinationId)
  const sourceIndex = from?.tasks.findIndex(task => task.id === taskId) ?? -1
  if (sourceIndex < 0 || !to) return board
  const target = to.tasks.filter(task => !hiddenIds.includes(task.id))[destinationIndex]
  const targetIndex = target ? to.tasks.findIndex(task => task.id === target.id) : to.tasks.length
  const [task] = from.tasks.splice(sourceIndex, 1)
  to.tasks.splice(targetIndex, 0, { ...task, columnId: destinationId })
  return { ...board, columns }
}
