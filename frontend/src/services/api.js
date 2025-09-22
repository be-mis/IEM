// src/services/api.js

const API_BASE_URL = 'http://localhost:5000/api';

class InventoryAPI {
  static async request(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Something went wrong');
      }
      
      return data;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Dashboard Stats
  static async getDashboardStats() {
    return await this.request('/dashboard/stats');
  }

  // Items CRUD
  static async getAllItems(filters = {}) {
    const params = new URLSearchParams(filters).toString();
    return await this.request(`/inventory/items${params ? `?${params}` : ''}`);
  }

  static async getItem(id) {
    return await this.request(`/inventory/items/${id}`);
  }

  static async createItem(itemData) {
    return await this.request('/inventory/items', {
      method: 'POST',
      body: JSON.stringify(itemData),
    });
  }

  static async updateItem(id, itemData) {
    return await this.request(`/inventory/items/${id}`, {
      method: 'PUT',
      body: JSON.stringify(itemData),
    });
  }

  static async deleteItem(id) {
    return await this.request(`/inventory/items/${id}`, {
      method: 'DELETE',
    });
  }

  // Check-out/Check-in
  static async checkOutItem(id, assignmentData) {
    return await this.request(`/inventory/items/${id}/checkout`, {
      method: 'POST',
      body: JSON.stringify(assignmentData),
    });
  }

  static async checkInItem(id, returnData) {
    return await this.request(`/inventory/items/${id}/checkin`, {
      method: 'POST',
      body: JSON.stringify(returnData),
    });
  }

  // Categories
  static async getCategories() {
    return await this.request('/inventory/categories');
  }
}

export default InventoryAPI;