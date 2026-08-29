import bcryptjs from 'bcryptjs'

export const mockStore = {
  users: [{ id: 'admin-001', username: 'admin', email: 'admin@novasync.local', role: 'Admin', passwordHash: bcryptjs.hashSync('Admin@123', 10), createdAt: new Date() }],
  tasks: [
    { id: 'mock-task-1', title: 'Set up NovaSync REST API', description: 'Create standard Express CRUD routes', boardId: 'board-1', columnId: 'col-1', assignee: 'USER 001', estimate: 2, priority: 'High', type: 'Feature', dueDate: '', order: 0 },
    { id: 'mock-task-2', title: 'Connect React task board', description: 'Load tasks through the REST API', boardId: 'board-1', columnId: 'col-2', assignee: 'USER 002', estimate: 3, priority: 'Medium', type: 'Feature', dueDate: '', order: 0 }
  ],
  messages: []
}

export const mockId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
