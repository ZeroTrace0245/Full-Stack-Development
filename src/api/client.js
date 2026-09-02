import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

function apiError(error) {
  if (!error.response) {
    return new Error('Cannot reach the server. Make sure the backend is running on port 5000.');
  }
  return error.response.data || error;
}

class APIClient {
  constructor() {
    this.token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
  }

  setToken(token, remember = true) {
    this.token = token;
    localStorage.removeItem('authToken');
    sessionStorage.removeItem('authToken');
    (remember ? localStorage : sessionStorage).setItem('authToken', token);
  }

  getToken() {
    return this.token;
  }

  clearToken() {
    this.token = null;
    localStorage.removeItem('authToken');
    sessionStorage.removeItem('authToken');
  }

  getHeaders() {
    return {
      'Content-Type': 'application/json',
      ...(this.token && { Authorization: `Bearer ${this.token}` })
    };
  }

  // ============ AUTH ENDPOINTS ============
  async register(username, email, password) {
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/register`, {
        username,
        email,
        password
      });
      if (response.data.token) {
        this.setToken(response.data.token);
      }
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }

  async login(identifier, password) {
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/login`, {
        identifier,
        password
      });
      if (response.data.token) {
        this.setToken(response.data.token);
      }
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }

  async getCurrentUser() {
    try {
      const response = await axios.get(`${API_BASE_URL}/auth/me`, {
        headers: this.getHeaders()
      });
      return response.data;
    } catch (error) {
      throw apiError(error);
    }
  }

  async getAllUsers() {
    try {
      const response = await axios.get(`${API_BASE_URL}/auth/users`, {
        headers: this.getHeaders()
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }
  async updateProfile(profile) { try { return (await axios.put(`${API_BASE_URL}/auth/me`, profile, { headers: this.getHeaders() })).data; } catch (error) { throw error.response?.data || error; } }

  async updateUserRole(userId, role) {
    try {
      const response = await axios.patch(`${API_BASE_URL}/auth/users/${userId}/role`, { role }, { headers: this.getHeaders() });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }

  async createUser(userData) { try { return (await axios.post(`${API_BASE_URL}/auth/users`, userData, { headers: this.getHeaders() })).data; } catch (error) { throw error.response?.data || error; } }
  async updateUser(userId, userData) { try { return (await axios.put(`${API_BASE_URL}/auth/users/${userId}`, userData, { headers: this.getHeaders() })).data; } catch (error) { throw error.response?.data || error; } }
  async deleteUser(userId) { try { return (await axios.delete(`${API_BASE_URL}/auth/users/${userId}`, { headers: this.getHeaders() })).data; } catch (error) { throw error.response?.data || error; } }
  async setTaskAssignment(taskId, assignedUserId, assignmentLocked = true) { try { return (await axios.patch(`${API_BASE_URL}/tasks/${taskId}/assignment`, { assignedUserId, assignmentLocked }, { headers: this.getHeaders() })).data; } catch (error) { throw error.response?.data || error; } }

  // ============ TASK ENDPOINTS ============
  async getTasksForBoard(boardId) {
    try {
      const response = await axios.get(`${API_BASE_URL}/tasks`, {
        params: { boardId },
        headers: this.getHeaders()
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }

  async createTask(taskData) {
    try {
      const response = await axios.post(`${API_BASE_URL}/tasks`, taskData, {
        headers: this.getHeaders()
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }

  async updateTask(taskId, taskData) {
    try {
      const response = await axios.put(`${API_BASE_URL}/tasks/${taskId}`, taskData, {
        headers: this.getHeaders()
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }

  async deleteTask(taskId) {
    try {
      const response = await axios.delete(`${API_BASE_URL}/tasks/${taskId}`, {
        headers: this.getHeaders()
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }

  // ============ MESSAGE ENDPOINTS ============
  async getTeamMessages(projectId, limit = 50) {
    try {
      const response = await axios.get(`${API_BASE_URL}/messages/team/${projectId}?limit=${limit}`, {
        headers: this.getHeaders()
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }

  async sendTeamMessage(projectId, content) {
    try {
      const response = await axios.post(`${API_BASE_URL}/messages/team`, {
        projectId,
        content
      }, {
        headers: this.getHeaders()
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }

  async getDirectMessages(otherUserId, limit = 50) {
    try {
      const response = await axios.get(`${API_BASE_URL}/messages/direct/${otherUserId}?limit=${limit}`, {
        headers: this.getHeaders()
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }

  async sendDirectMessage(receiverId, content) {
    try {
      const response = await axios.post(`${API_BASE_URL}/messages/direct`, {
        receiverId,
        content
      }, {
        headers: this.getHeaders()
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }

  async getAdminTeamMessages(limit = 100) {
    try {
      const response = await axios.get(`${API_BASE_URL}/messages/admin/team?limit=${limit}`, { headers: this.getHeaders() });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }
}

export default new APIClient();
