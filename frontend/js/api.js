/**
 * API Service for Smart Waste Management Portal
 * Supports seamless hybrid operation:
 * 1. Live Express Backend when online (e.g. localhost:3000)
 * 2. Automatic, rich LocalStorage/Seed-Data ClientStore when backend is offline or on static deployments (e.g. Vercel)
 */

// Backend API origin (defaults to same-origin or Render cloud service if configured)
const API_BASE = (typeof window !== 'undefined' && window.RENDER_BACKEND_URL) 
  ? window.RENDER_BACKEND_URL 
  : ((typeof localStorage !== 'undefined' && localStorage.getItem('smartwaste_backend_url')) || '');

// ================= CLIENT-SIDE LOCAL STORE (Fallback for Vercel/Static Hosting) =================
class LocalStore {
  constructor() {
    this.storageKey = 'smartwaste_portal_db_v1';
    this.data = null;
    this.init();
  }

  init() {
    try {
      const stored = localStorage.getItem(this.storageKey);
      if (stored) {
        this.data = JSON.parse(stored);
        // Ensure all vital arrays exist
        if (!this.data.complaints || !this.data.wasteGuideItems || !this.data.rewards) {
          this.reset();
        }
      } else {
        this.reset();
      }
    } catch (e) {
      console.warn('LocalStorage unavailable or corrupt, using memory seed dataset', e);
      this.reset();
    }
  }

  save() {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.data));
    } catch (e) {
      console.warn('Could not persist to localStorage:', e);
    }
  }

  reset() {
    const seed = (typeof window !== 'undefined' && window.INITIAL_SEED_DATA) 
      ? window.INITIAL_SEED_DATA 
      : {
          complaints: [],
          pickupRequests: [],
          wasteGuideItems: [],
          communityEvents: [],
          rewards: { balance: 240, ledger: [], sampleCoupons: [] },
          adminActivities: []
        };
    this.data = JSON.parse(JSON.stringify(seed));
    this.save();
    return this.data;
  }

  // --- Complaints ---
  getComplaints(filters = {}) {
    let list = [...(this.data.complaints || [])];
    if (filters.status && filters.status !== 'all') {
      list = list.filter(c => c.status && c.status.toLowerCase() === filters.status.toLowerCase());
    }
    if (filters.issueType && filters.issueType !== 'all') {
      list = list.filter(c => c.issueType === filters.issueType);
    }
    if (filters.severity && filters.severity !== 'all') {
      list = list.filter(c => c.severity === filters.severity);
    }
    list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    return { success: true, count: list.length, data: list };
  }

  getComplaintById(id) {
    const found = (this.data.complaints || []).find(c => c.id === id);
    if (!found) return { success: false, error: 'Complaint ticket not found' };
    return { success: true, data: found };
  }

  submitComplaint(data) {
    const timestamp = new Date().toISOString();
    const randomDigits = Math.floor(1000 + Math.random() * 9000);
    const newId = `TKT-2026-${randomDigits}`;

    const issueTypeNames = {
      overflowing_bin: 'Overflowing Public Bin',
      roadside_dumping: 'Roadside Dumping / Illegal Heap',
      food_waste: 'Food-Waste Accumulation',
      mixed_waste: 'Mixed Debris & Garden Waste',
      biohazard_sewage: 'Open Sewage & Biohazard',
      other: 'Other Sanitation Issue'
    };

    const newComplaint = {
      id: newId,
      issueType: data.issueType || 'other',
      issueTypeName: (data.issueTypeName && data.issueTypeName.trim()) 
        ? data.issueTypeName.trim() 
        : (issueTypeNames[data.issueType] || 'Public Cleanliness Issue'),
      severity: data.severity || 'medium',
      address: data.address || 'Reported Location',
      landmark: data.landmark || '',
      latitude: data.latitude ? parseFloat(data.latitude) : 19.0760 + (Math.random() - 0.5) * 0.02,
      longitude: data.longitude ? parseFloat(data.longitude) : 72.8777 + (Math.random() - 0.5) * 0.02,
      description: data.description || 'Public cleanliness report submitted via citizen portal.',
      photoUrl: data.photoUrl || null,
      status: 'Submitted',
      createdAt: timestamp,
      updatedAt: timestamp,
      resolutionNote: null,
      afterPhotoUrl: null,
      assignedWorkerGroup: 'Unassigned',
      createdBy: 'resident_citizen'
    };

    if (!this.data.complaints) this.data.complaints = [];
    this.data.complaints.unshift(newComplaint);

    // Reward citizen points for civic contribution
    this.addRewardPoints(`Submitted public cleanliness report (${newId})`, 20, newId);
    this.save();

    // Sync to Firebase Realtime Cloud Database if initialized
    if (typeof window !== 'undefined' && window.FirebaseSync) {
      window.FirebaseSync.saveComplaint(newComplaint);
    }

    return { success: true, message: 'Complaint registered successfully', data: newComplaint };
  }

  updateComplaintStatus(id, updateData) {
    const c = (this.data.complaints || []).find(x => x.id === id);
    if (!c) return { success: false, error: 'Complaint not found' };
    const oldStatus = c.status;
    if (updateData.status) c.status = updateData.status;
    if (updateData.resolutionNote) c.resolutionNote = updateData.resolutionNote;
    if (updateData.assignedWorkerGroup) c.assignedWorkerGroup = updateData.assignedWorkerGroup;
    if (updateData.afterPhotoUrl) c.afterPhotoUrl = updateData.afterPhotoUrl;
    c.updatedAt = new Date().toISOString();

    if (!this.data.adminActivities) this.data.adminActivities = [];
    this.data.adminActivities.unshift({
      id: `act-${Date.now()}`,
      complaintId: id,
      oldStatus,
      newStatus: c.status,
      note: updateData.resolutionNote || `Status updated to ${c.status}`,
      actorLabel: 'Zone Sanitation Desk',
      timestamp: c.updatedAt
    });

    this.save();

    // Sync status change to Firebase Cloud Database if initialized
    if (typeof window !== 'undefined' && window.FirebaseSync) {
      window.FirebaseSync.updateComplaint(id, {
        status: c.status,
        resolutionNote: c.resolutionNote,
        assignedWorkerGroup: c.assignedWorkerGroup,
        afterPhotoUrl: c.afterPhotoUrl,
        updatedAt: c.updatedAt
      });
    }

    return { success: true, data: c };
  }

  reopenComplaint(id, reason) {
    const c = (this.data.complaints || []).find(x => x.id === id);
    if (!c) return { success: false, error: 'Complaint not found' };
    c.status = 'Reopened';
    c.reopenReason = reason || 'Resident flagged inadequate clearance.';
    c.updatedAt = new Date().toISOString();
    this.save();
    return { success: true, data: c };
  }

  submitComplaintFeedback(id, rating, comment = '') {
    const c = (this.data.complaints || []).find(x => x.id === id);
    if (!c) return { success: false, error: 'Complaint not found' };
    c.feedback = {
      rating: parseInt(rating, 10) || 5,
      comment: (comment || '').trim(),
      submittedAt: new Date().toISOString()
    };
    this.addRewardPoints(`Completed cleanliness resolution feedback for ${id}`, 15, `FB-${id}`);
    this.save();
    return { success: true, data: c };
  }

  // --- Pickups ---
  getPickups() {
    return { success: true, data: this.data.pickupRequests || [] };
  }

  submitPickup(data) {
    const newReq = {
      id: `REQ-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      wasteType: data.wasteType || 'e_waste',
      wasteTypeName: data.wasteTypeName || 'Special Collection Request',
      description: data.description || '',
      quantityDescription: data.quantityDescription || 'Standard quantity',
      address: data.address || '',
      preferredSlot: data.preferredSlot || 'Saturday Morning (09:00 AM - 12:00 PM)',
      status: 'Scheduled',
      createdAt: new Date().toISOString(),
      createdBy: 'resident_citizen'
    };
    if (!this.data.pickupRequests) this.data.pickupRequests = [];
    this.data.pickupRequests.unshift(newReq);
    this.addRewardPoints(`Scheduled doorstep pickup (${newReq.id})`, 30, newReq.id);
    this.save();
    return { success: true, data: newReq };
  }

  // --- Waste Guide ---
  getWasteGuide(query = '', category = 'all') {
    let items = [...(this.data.wasteGuideItems || [])];
    if (category && category !== 'all') {
      items = items.filter(item => item.category === category);
    }
    if (query && query.trim()) {
      const q = query.trim().toLowerCase();
      items = items.filter(item =>
        (item.itemName && item.itemName.toLowerCase().includes(q)) ||
        (item.categoryName && item.categoryName.toLowerCase().includes(q)) ||
        (item.instructions && item.instructions.toLowerCase().includes(q))
      );
    }
    return { success: true, count: items.length, data: items };
  }

  // --- Events ---
  getEvents() {
    return { success: true, data: this.data.communityEvents || [] };
  }

  registerEvent(id) {
    const evt = (this.data.communityEvents || []).find(e => e.id === id);
    if (!evt) return { success: false, error: 'Event not found' };
    if (!evt.registeredUsers) evt.registeredUsers = [];
    if (evt.registeredUsers.includes('current_citizen')) {
      return { success: true, data: { ...evt, alreadyRegistered: true } };
    }
    evt.registrationCount = (evt.registrationCount || 0) + 1;
    evt.registeredUsers.push('current_citizen');
    this.addRewardPoints(`Volunteered for ${evt.title}`, evt.rewardPoints || 100, evt.id);
    this.save();
    return { success: true, data: { ...evt, alreadyRegistered: false } };
  }

  // --- Rewards & Ledger ---
  getRewards() {
    if (!this.data.rewards) {
      this.data.rewards = { balance: 240, ledger: [], sampleCoupons: [] };
    }
    return { success: true, data: this.data.rewards };
  }

  addRewardPoints(reason, points, relatedRecordId = null) {
    if (!this.data.rewards) {
      this.data.rewards = { balance: 240, ledger: [], sampleCoupons: [] };
    }
    const ledger = this.data.rewards.ledger || [];
    if (relatedRecordId && ledger.some(e => e.relatedRecordId === relatedRecordId && e.reason === reason)) {
      return this.data.rewards;
    }
    const ptsNum = parseInt(points, 10) || 0;
    const newEntry = {
      id: `led-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      reason: reason,
      points: ptsNum,
      createdAt: new Date().toISOString(),
      relatedRecordId: relatedRecordId
    };
    this.data.rewards.balance = (this.data.rewards.balance || 0) + ptsNum;
    this.data.rewards.ledger.unshift(newEntry);
    this.save();
    return this.data.rewards;
  }

  redeemReward(couponId) {
    if (!this.data.rewards) {
      return { success: false, error: 'Rewards data not available' };
    }
    const coupon = (this.data.rewards.sampleCoupons || []).find(c => c.id === couponId);
    if (!coupon) return { success: false, error: 'Coupon not found' };

    const currentBalance = this.data.rewards.balance || 0;
    if (currentBalance < coupon.costPoints) {
      return { success: false, error: 'Insufficient Eco-Points balance' };
    }

    this.data.rewards.balance = currentBalance - coupon.costPoints;
    const voucherCode = `ECO-${coupon.id.toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const newEntry = {
      id: `led-${Date.now()}`,
      reason: `Redeemed: ${coupon.title} (Voucher Code: ${voucherCode})`,
      points: -coupon.costPoints,
      createdAt: new Date().toISOString(),
      relatedRecordId: voucherCode,
      voucherCode
    };

    this.data.rewards.ledger.unshift(newEntry);
    this.save();

    return {
      success: true,
      voucherCode,
      coupon,
      newBalance: this.data.rewards.balance
    };
  }

  // --- Dashboard Aggregates ---
  getDashboardStats() {
    const complaints = this.data.complaints || [];
    const submittedCount = complaints.filter(c => c.status === 'Submitted' || c.status === 'Reopened').length;
    const inProgressCount = complaints.filter(c => c.status === 'Under Review' || c.status === 'Assigned' || c.status === 'Cleaning In Progress').length;
    const resolvedCount = complaints.filter(c => c.status === 'Resolved').length;
    const totalCount = complaints.length;

    return {
      success: true,
      data: {
        submittedCount,
        inProgressCount,
        resolvedCount,
        totalCount,
        ecoPoints: this.data.rewards ? this.data.rewards.balance : 240,
        activePickups: (this.data.pickupRequests || []).length,
        upcomingDrives: (this.data.communityEvents || []).length,
        latestComplaint: complaints[0] || null
      }
    };
  }

  getAuditLog() {
    return { success: true, data: this.data.adminActivities || [] };
  }

  exportComplaintsCsv() {
    const complaints = this.getComplaints().data;
    const headers = ['Ticket ID', 'Issue Type', 'Severity', 'Address', 'Landmark', 'Status', 'Created At', 'Resolution Note'];
    const rows = complaints.map(c => [
      c.id,
      `"${(c.issueTypeName || c.issueType).replace(/"/g, '""')}"`,
      c.severity,
      `"${(c.address || '').replace(/"/g, '""')}"`,
      `"${(c.landmark || '').replace(/"/g, '""')}"`,
      c.status,
      c.createdAt,
      `"${(c.resolutionNote || '').replace(/"/g, '""')}"`
    ]);
    return [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  }
}

// Global local store fallback singleton
const clientStore = new LocalStore();

// Safe helper to attempt fetch and seamlessly fallback if backend not available (e.g. Vercel)
async function tryFetchOrFallback(url, options, fallbackFn) {
  try {
    const res = await fetch(url, options);
    const contentType = res.headers.get('content-type');
    if (res.ok && contentType && contentType.includes('application/json')) {
      const data = await res.json();
      return data;
    }
  } catch (err) {
    // Backend offline / Vercel static deployment
  }
  return fallbackFn();
}

// ================= UNIFIED API EXPORT =================
const API = {
  // --- Dashboard & System ---
  async getDashboardStats() {
    return tryFetchOrFallback(
      `${API_BASE}/api/dashboard/stats`,
      { method: 'GET' },
      () => clientStore.getDashboardStats()
    );
  },

  async getAuditLog() {
    return tryFetchOrFallback(
      `${API_BASE}/api/dashboard/audit-log`,
      { method: 'GET' },
      () => clientStore.getAuditLog()
    );
  },

  async resetDemoData() {
    return tryFetchOrFallback(
      `${API_BASE}/api/dashboard/reset-demo`,
      { method: 'POST', headers: { 'Content-Type': 'application/json' } },
      () => {
        const fresh = clientStore.reset();
        return { success: true, message: 'Demo state reset to initial values.', data: fresh };
      }
    );
  },

  // --- Complaints ---
  async getComplaints(filters = {}) {
    const params = new URLSearchParams();
    if (filters.status && filters.status !== 'all') params.append('status', filters.status);
    if (filters.issueType && filters.issueType !== 'all') params.append('issueType', filters.issueType);
    if (filters.severity && filters.severity !== 'all') params.append('severity', filters.severity);

    const query = params.toString() ? `?${params.toString()}` : '';
    return tryFetchOrFallback(
      `${API_BASE}/api/complaints${query}`,
      { method: 'GET' },
      () => clientStore.getComplaints(filters)
    );
  },

  async getComplaintById(id) {
    return tryFetchOrFallback(
      `${API_BASE}/api/complaints/${id}`,
      { method: 'GET' },
      () => clientStore.getComplaintById(id)
    );
  },

  async submitComplaint(data) {
    return tryFetchOrFallback(
      `${API_BASE}/api/complaints`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      },
      () => clientStore.submitComplaint(data)
    );
  },

  async updateComplaintStatus(id, updateData) {
    return tryFetchOrFallback(
      `${API_BASE}/api/complaints/${id}/status`,
      {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData)
      },
      () => clientStore.updateComplaintStatus(id, updateData)
    );
  },

  async reopenComplaint(id, reason) {
    return tryFetchOrFallback(
      `${API_BASE}/api/complaints/${id}/reopen`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason })
      },
      () => clientStore.reopenComplaint(id, reason)
    );
  },

  async submitComplaintFeedback(id, rating, comment) {
    return tryFetchOrFallback(
      `${API_BASE}/api/complaints/${id}/feedback`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rating, comment })
      },
      () => clientStore.submitComplaintFeedback(id, rating, comment)
    );
  },

  // --- Special Pickups ---
  async getPickups() {
    return tryFetchOrFallback(
      `${API_BASE}/api/pickups`,
      { method: 'GET' },
      () => clientStore.getPickups()
    );
  },

  async submitPickup(data) {
    return tryFetchOrFallback(
      `${API_BASE}/api/pickups`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      },
      () => clientStore.submitPickup(data)
    );
  },

  // --- Waste Guide ---
  async getWasteGuide(query = '', category = 'all') {
    const params = new URLSearchParams();
    if (query) params.append('q', query);
    if (category && category !== 'all') params.append('category', category);

    return tryFetchOrFallback(
      `${API_BASE}/api/waste-guide?${params.toString()}`,
      { method: 'GET' },
      () => clientStore.getWasteGuide(query, category)
    );
  },

  // --- Community Events ---
  async getEvents() {
    return tryFetchOrFallback(
      `${API_BASE}/api/events`,
      { method: 'GET' },
      () => clientStore.getEvents()
    );
  },

  async registerEvent(id) {
    return tryFetchOrFallback(
      `${API_BASE}/api/events/${id}/register`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      },
      () => clientStore.registerEvent(id)
    );
  },

  // --- Eco Rewards ---
  async getRewards() {
    return tryFetchOrFallback(
      `${API_BASE}/api/rewards`,
      { method: 'GET' },
      () => clientStore.getRewards()
    );
  },

  async addRewardPoints(reason, points, refId) {
    return tryFetchOrFallback(
      `${API_BASE}/api/rewards/add`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason, points, refId })
      },
      () => {
        clientStore.addRewardPoints(reason, points, refId);
        return { success: true, data: clientStore.getRewards().data };
      }
    );
  },

  async redeemReward(couponId) {
    return tryFetchOrFallback(
      `${API_BASE}/api/rewards/redeem`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ couponId })
      },
      () => clientStore.redeemReward(couponId)
    );
  },

  // --- Image Upload ---
  async uploadImage(base64) {
    return tryFetchOrFallback(
      `${API_BASE}/api/upload`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageBase64: base64 })
      },
      () => ({ success: true, url: base64 }) // On static client, the base64 string works natively!
    );
  },

  getExportCsvUrl() {
    return `${API_BASE}/api/dashboard/export-csv`;
  },

  exportLocalCsv() {
    return clientStore.exportComplaintsCsv();
  }
};

if (typeof window !== 'undefined') {
  window.API = API;
  window.clientStore = clientStore;
}
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { API, clientStore };
}

