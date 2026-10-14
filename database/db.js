const fs = require('fs');
const path = require('path');
const initialSeedData = require('./seedData');

const DATA_FILE_PATH = path.join(__dirname, 'data.json');

class DatabaseStore {
  constructor() {
    this.data = null;
    this.init();
  }

  init() {
    try {
      if (fs.existsSync(DATA_FILE_PATH)) {
        const fileContent = fs.readFileSync(DATA_FILE_PATH, 'utf-8');
        this.data = JSON.parse(fileContent);
      } else {
        this.reset();
      }
    } catch (err) {
      console.error('[DB] Error loading database file, initializing with fresh seeds:', err);
      this.reset();
    }
  }

  save() {
    try {
      fs.writeFileSync(DATA_FILE_PATH, JSON.stringify(this.data, null, 2), 'utf-8');
    } catch (err) {
      console.error('[DB] Error persisting data to file:', err);
    }
  }

  reset() {
    // Deep clone initialSeedData
    this.data = JSON.parse(JSON.stringify(initialSeedData));
    this.save();
    console.log('[DB] Database seeded successfully with realistic demo dataset.');
    return this.data;
  }

  // --- Complaints ---
  getAllComplaints(filters = {}) {
    let result = [...this.data.complaints];
    if (filters.status && filters.status !== 'all') {
      result = result.filter(c => c.status.toLowerCase() === filters.status.toLowerCase());
    }
    if (filters.issueType && filters.issueType !== 'all') {
      result = result.filter(c => c.issueType === filters.issueType);
    }
    if (filters.severity && filters.severity !== 'all') {
      result = result.filter(c => c.severity === filters.severity);
    }
    // Return newest first
    return result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }

  getComplaintById(id) {
    return this.data.complaints.find(c => c.id === id) || null;
  }

  createComplaint(complaintData) {
    const timestamp = new Date().toISOString();
    const randomDigits = Math.floor(1000 + Math.random() * 9000);
    const newId = `TKT-2026-${randomDigits}`;

    const newRecord = {
      id: newId,
      issueType: complaintData.issueType || 'other',
      issueTypeName: complaintData.issueTypeName || 'General Cleanliness Issue',
      severity: complaintData.severity || 'medium',
      address: complaintData.address,
      landmark: complaintData.landmark || '',
      latitude: complaintData.latitude ? parseFloat(complaintData.latitude) : 19.0760 + (Math.random() - 0.5) * 0.02,
      longitude: complaintData.longitude ? parseFloat(complaintData.longitude) : 72.8777 + (Math.random() - 0.5) * 0.02,
      description: complaintData.description || 'No additional details provided.',
      photoUrl: complaintData.photoUrl || null,
      status: 'Submitted',
      createdAt: timestamp,
      updatedAt: timestamp,
      resolutionNote: null,
      afterPhotoUrl: null,
      assignedWorkerGroup: 'Unassigned',
      createdBy: complaintData.createdBy || 'resident_citizen'
    };

    this.data.complaints.unshift(newRecord);

    // Record submission into rewards (ethical civic reporting)
    this.addRewardPoints('Submitted public cleanliness report (' + newId + ')', 20, newId);

    this.save();
    return newRecord;
  }

  updateComplaintStatus(id, updateData) {
    const complaint = this.getComplaintById(id);
    if (!complaint) return null;

    const oldStatus = complaint.status;
    const newStatus = updateData.status || oldStatus;

    complaint.status = newStatus;
    complaint.updatedAt = new Date().toISOString();

    if (updateData.resolutionNote !== undefined) {
      complaint.resolutionNote = updateData.resolutionNote;
    }
    if (updateData.afterPhotoUrl !== undefined) {
      complaint.afterPhotoUrl = updateData.afterPhotoUrl;
    }
    if (updateData.assignedWorkerGroup !== undefined) {
      complaint.assignedWorkerGroup = updateData.assignedWorkerGroup;
    }

    // Log admin audit activity for accountability
    const actId = `act-${Date.now()}`;
    const activityRecord = {
      id: actId,
      complaintId: id,
      oldStatus: oldStatus,
      newStatus: newStatus,
      note: updateData.resolutionNote || `Status updated from ${oldStatus} to ${newStatus}`,
      actorLabel: updateData.actorLabel || 'Ward Sanitation Officer',
      timestamp: complaint.updatedAt
    };
    this.data.adminActivities.unshift(activityRecord);

    // If resolved, award civic resolution bonus points to the citizen ledger
    if (newStatus === 'Resolved' && oldStatus !== 'Resolved') {
      this.addRewardPoints(`Resolution verified for report ${id}`, 30, id);
    }

    this.save();
    return complaint;
  }

  reopenComplaint(id, reason) {
    const complaint = this.getComplaintById(id);
    if (!complaint) return null;

    const oldStatus = complaint.status;
    complaint.status = 'Reopened';
    complaint.updatedAt = new Date().toISOString();

    const activityRecord = {
      id: `act-${Date.now()}`,
      complaintId: id,
      oldStatus: oldStatus,
      newStatus: 'Reopened',
      note: `Resident reopened ticket: ${reason || 'Area reported still unclean or waste reappeared.'}`,
      actorLabel: 'Citizen Feedback Loop',
      timestamp: complaint.updatedAt
    };
    this.data.adminActivities.unshift(activityRecord);

    this.save();
    return complaint;
  }

  // --- Pickup Requests ---
  getAllPickups() {
    return this.data.pickupRequests.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }

  createPickup(pickupData) {
    const randomDigits = Math.floor(1000 + Math.random() * 9000);
    const newId = `REQ-2026-${randomDigits}`;

    const newRecord = {
      id: newId,
      wasteType: pickupData.wasteType,
      wasteTypeName: pickupData.wasteTypeName || 'Special Waste Collection',
      description: pickupData.description,
      quantityDescription: pickupData.quantityDescription,
      address: pickupData.address,
      preferredSlot: pickupData.preferredSlot,
      status: 'Request Received',
      createdAt: new Date().toISOString(),
      createdBy: pickupData.createdBy || 'resident_citizen'
    };

    this.data.pickupRequests.unshift(newRecord);
    this.save();
    return newRecord;
  }

  // --- Waste Guide Items ---
  getWasteGuide(query = '', category = 'all') {
    let items = [...this.data.wasteGuideItems];
    if (category && category !== 'all') {
      items = items.filter(item => item.category === category);
    }
    if (query && query.trim() !== '') {
      const q = query.toLowerCase().trim();
      items = items.filter(item => 
        item.itemName.toLowerCase().includes(q) ||
        item.instructions.toLowerCase().includes(q) ||
        item.categoryName.toLowerCase().includes(q)
      );
    }
    return items;
  }

  // --- Community Events ---
  getCommunityEvents() {
    return this.data.communityEvents;
  }

  registerForEvent(eventId, userId = 'resident_citizen') {
    const event = this.data.communityEvents.find(e => e.id === eventId);
    if (!event) return null;

    if (!event.registeredUsers) {
      event.registeredUsers = [];
    }

    if (event.registeredUsers.includes(userId)) {
      return { ...event, alreadyRegistered: true };
    }

    if (event.registrationCount < event.maxCapacity) {
      event.registrationCount += 1;
      event.registeredUsers.push(userId);
      this.addRewardPoints(`Volunteered for ${event.title}`, event.rewardPoints || 50, event.id);
      this.save();
      return { ...event, alreadyRegistered: false };
    }
    return event;
  }

  // --- Citizen Feedback Loop (PCE Ethics & Satisfaction) ---
  submitComplaintFeedback(id, rating, comment = '') {
    const complaint = this.getComplaintById(id);
    if (!complaint) return null;

    complaint.feedback = {
      rating: parseInt(rating, 10) || 5,
      comment: comment.trim(),
      submittedAt: new Date().toISOString()
    };
    
    // Reward citizen for evaluating public service
    this.addRewardPoints(`Completed cleanliness resolution feedback for ${id}`, 15, `FB-${id}`);
    this.save();
    return complaint;
  }

  // --- Coupon Redemption ---
  redeemCoupon(couponId) {
    const coupon = this.data.rewards.sampleCoupons.find(c => c.id === couponId);
    if (!coupon) return { success: false, error: 'Voucher not found' };

    if (this.data.rewards.balance < coupon.costPoints) {
      return { success: false, error: 'Insufficient Eco-Points balance' };
    }

    this.data.rewards.balance -= coupon.costPoints;
    const voucherCode = `ECO-${coupon.id.toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const newLedgerEntry = {
      id: `led-${Date.now()}`,
      reason: `Redeemed: ${coupon.title} (Voucher Code: ${voucherCode})`,
      points: -coupon.costPoints,
      createdAt: new Date().toISOString(),
      relatedRecordId: voucherCode,
      voucherCode
    };

    this.data.rewards.ledger.unshift(newLedgerEntry);
    this.save();

    return {
      success: true,
      voucherCode,
      coupon,
      newBalance: this.data.rewards.balance
    };
  }

  // --- Rewards & Ledger ---
  getRewardsData() {
    return this.data.rewards;
  }

  addRewardPoints(reason, points, relatedRecordId = null) {
    // Avoid double rewarding same record in demo
    const alreadyRewarded = this.data.rewards.ledger.some(
      entry => entry.relatedRecordId === relatedRecordId && entry.reason === reason
    );
    if (alreadyRewarded && relatedRecordId) {
      return this.data.rewards;
    }

    const newEntry = {
      id: `led-${Date.now()}`,
      reason: reason,
      points: points,
      createdAt: new Date().toISOString(),
      relatedRecordId: relatedRecordId
    };

    this.data.rewards.balance += points;
    this.data.rewards.ledger.unshift(newEntry);
    this.save();
    return this.data.rewards;
  }

  // --- Dashboard Aggregates ---
  getDashboardStats() {
    const complaints = this.data.complaints;
    const submittedCount = complaints.filter(c => c.status === 'Submitted' || c.status === 'Reopened').length;
    const inProgressCount = complaints.filter(c => c.status === 'Under Review' || c.status === 'Assigned' || c.status === 'Cleaning In Progress').length;
    const resolvedCount = complaints.filter(c => c.status === 'Resolved').length;
    const totalCount = complaints.length;

    return {
      submittedCount,
      inProgressCount,
      resolvedCount,
      totalCount,
      ecoPoints: this.data.rewards.balance,
      activePickups: this.data.pickupRequests.length,
      upcomingDrives: this.data.communityEvents.length,
      latestComplaint: complaints[0] || null
    };
  }

  exportComplaintsCsv() {
    const complaints = this.getAllComplaints();
    const headers = ['Ticket ID', 'Issue Type', 'Severity', 'Address', 'Landmark', 'Status', 'Created At', 'Updated At', 'Squad', 'Resolution Note'];
    const rows = complaints.map(c => [
      c.id,
      `"${(c.issueTypeName || c.issueType).replace(/"/g, '""')}"`,
      c.severity,
      `"${(c.address || '').replace(/"/g, '""')}"`,
      `"${(c.landmark || '').replace(/"/g, '""')}"`,
      c.status,
      c.createdAt,
      c.updatedAt,
      `"${(c.assignedWorkerGroup || '').replace(/"/g, '""')}"`,
      `"${(c.resolutionNote || '').replace(/"/g, '""')}"`
    ]);

    return [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  }

  getAdminAuditLog() {
    return this.data.adminActivities;
  }
}

// Export singleton instance
const dbInstance = new DatabaseStore();
module.exports = dbInstance;
