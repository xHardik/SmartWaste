/**
 * API Service for Smart Waste Management Portal
 * Interfaces with Express Backend endpoints
 */

const API_BASE = ''; // Same origin (relative URL)

const API = {
  // --- Dashboard & System ---
  async getDashboardStats() {
    const res = await fetch(`${API_BASE}/api/dashboard/stats`);
    return await res.json();
  },

  async getAuditLog() {
    const res = await fetch(`${API_BASE}/api/dashboard/audit-log`);
    return await res.json();
  },

  async resetDemoData() {
    const res = await fetch(`${API_BASE}/api/dashboard/reset-demo`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    return await res.json();
  },

  // --- Complaints ---
  async getComplaints(filters = {}) {
    const params = new URLSearchParams();
    if (filters.status && filters.status !== 'all') params.append('status', filters.status);
    if (filters.issueType && filters.issueType !== 'all') params.append('issueType', filters.issueType);
    if (filters.severity && filters.severity !== 'all') params.append('severity', filters.severity);

    const query = params.toString() ? `?${params.toString()}` : '';
    const res = await fetch(`${API_BASE}/api/complaints${query}`);
    return await res.json();
  },

  async getComplaintById(id) {
    const res = await fetch(`${API_BASE}/api/complaints/${id}`);
    return await res.json();
  },

  async submitComplaint(data) {
    const res = await fetch(`${API_BASE}/api/complaints`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return await res.json();
  },

  async updateComplaintStatus(id, updateData) {
    const res = await fetch(`${API_BASE}/api/complaints/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updateData)
    });
    return await res.json();
  },

  async reopenComplaint(id, reason) {
    const res = await fetch(`${API_BASE}/api/complaints/${id}/reopen`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reason })
    });
    return await res.json();
  },

  // --- Special Pickups ---
  async getPickups() {
    const res = await fetch(`${API_BASE}/api/pickups`);
    return await res.json();
  },

  async submitPickup(data) {
    const res = await fetch(`${API_BASE}/api/pickups`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return await res.json();
  },

  // --- Waste Guide ---
  async getWasteGuide(query = '', category = 'all') {
    const params = new URLSearchParams();
    if (query) params.append('q', query);
    if (category && category !== 'all') params.append('category', category);

    const res = await fetch(`${API_BASE}/api/waste-guide?${params.toString()}`);
    return await res.json();
  },

  // --- Community Events ---
  async getEvents() {
    const res = await fetch(`${API_BASE}/api/events`);
    return await res.json();
  },

  async registerEvent(id) {
    const res = await fetch(`${API_BASE}/api/events/${id}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    return await res.json();
  },

  async submitComplaintFeedback(id, rating, comment) {
    const res = await fetch(`${API_BASE}/api/complaints/${id}/feedback`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rating, comment })
    });
    return await res.json();
  },

  // --- Eco Rewards ---
  async getRewards() {
    const res = await fetch(`${API_BASE}/api/rewards`);
    return await res.json();
  },

  async redeemReward(couponId) {
    const res = await fetch(`${API_BASE}/api/rewards/redeem`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ couponId })
    });
    return await res.json();
  },

  // --- Image Upload ---
  async uploadImage(base64) {
    const res = await fetch(`${API_BASE}/api/upload`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ imageBase64: base64 })
    });
    return await res.json();
  },

  getExportCsvUrl() {
    return `${API_BASE}/api/dashboard/export-csv`;
  }
};
