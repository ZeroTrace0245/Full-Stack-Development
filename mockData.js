import { getRandomUser } from './utils/generateUsers'

const mockData = {
  boards: [
    {
      id: 'board-1',
      title: 'Sprint Board',
      columns: [
        {
          id: 'col-1',
          title: 'To Do',
          tasks: [
            { id: 't1', title: 'Set up project repo', assignee: 'USER 001', estimate: 1 },
            { id: 't2', title: 'Design wireframes', assignee: 'USER 002', estimate: 3 },
            { id: 't3', title: 'Write API documentation', assignee: 'USER 003', estimate: 2 },
            { id: 't4', title: 'Setup CI/CD pipeline', assignee: 'USER 004', estimate: 4 },
            { id: 't5', title: 'Database schema design', assignee: 'USER 005', estimate: 5 }
          ]
        },
        {
          id: 'col-2',
          title: 'Doing',
          tasks: [
            { id: 't6', title: 'Implement auth module', assignee: 'USER 006', estimate: 5 },
            { id: 't7', title: 'Create dashboard UI', assignee: 'USER 007', estimate: 4 },
            { id: 't8', title: 'Backend API setup', assignee: 'USER 008', estimate: 6 },
            { id: 't9', title: 'User profile page', assignee: 'USER 009', estimate: 3 }
          ]
        },
        {
          id: 'col-3',
          title: 'Done',
          tasks: [
            { id: 't10', title: 'Project kickoff', assignee: 'USER 010', estimate: 1 },
            { id: 't11', title: 'Requirements gathering', assignee: 'USER 011', estimate: 2 },
            { id: 't12', title: 'Architecture review', assignee: 'USER 012', estimate: 3 }
          ]
        }
      ]
    }
  ]
}

export default mockData

