/**
 * Firebase Integration for Smart Waste Management
 * Project: smartwaste-98279
 * Asia Southeast 1 Realtime Database
 */

const firebaseConfig = {
  apiKey: "AIzaSyDwdsQwUY7aq-rbLc9_163de5wJDQq4KKw",
  authDomain: "smartwaste-98279.firebaseapp.com",
  databaseURL: "https://smartwaste-98279-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "smartwaste-98279",
  storageBucket: "smartwaste-98279.firebasestorage.app",
  messagingSenderId: "633492402476",
  appId: "1:633492402476:web:70dd517b3ec13a97327c89",
  measurementId: "G-5NTJC5BPPP"
};

let firebaseApp = null;
let firebaseDb = null;
let firebaseAnalytics = null;

try {
  if (typeof firebase !== 'undefined') {
    firebaseApp = firebase.initializeApp(firebaseConfig);
    if (typeof firebase.analytics === 'function') {
      try {
        firebaseAnalytics = firebase.analytics();
      } catch (anErr) {
        // Analytics may be blocked by adblockers/incognito; silent ignore
      }
    }
    if (typeof firebase.database === 'function') {
      firebaseDb = firebase.database();
      console.log('[Firebase] Connected to Realtime Database:', firebaseConfig.databaseURL);
    }
  }
} catch (err) {
  console.warn('[Firebase] Initialization notice:', err.message);
}

// Cloud Realtime Database Synchronization Service
const FirebaseSync = {
  async saveComplaint(complaint) {
    if (!firebaseDb) return false;
    try {
      await firebaseDb.ref('complaints/' + complaint.id).set(complaint);
      console.log('[Firebase] Complaint synced to cloud:', complaint.id);
      return true;
    } catch (e) {
      console.warn('[Firebase] Cloud write notice (Ensure rules in Firebase Console allow read/write):', e.message);
      return false;
    }
  },

  async updateComplaint(id, updates) {
    if (!firebaseDb) return false;
    try {
      await firebaseDb.ref('complaints/' + id).update(updates);
      console.log('[Firebase] Complaint status updated in cloud:', id);
      return true;
    } catch (e) {
      console.warn('[Firebase] Cloud update notice:', e.message);
      return false;
    }
  },

  async saveRewards(rewardsData) {
    if (!firebaseDb) return false;
    try {
      await firebaseDb.ref('rewards').set(rewardsData);
      console.log('[Firebase] Rewards ledger synced to cloud');
      return true;
    } catch (e) {
      console.warn('[Firebase] Rewards cloud sync notice:', e.message);
      return false;
    }
  },

  async getCloudComplaints() {
    if (!firebaseDb) return null;
    try {
      const snapshot = await firebaseDb.ref('complaints').once('value');
      const val = snapshot.val();
      if (val) {
        return Object.values(val);
      }
    } catch (e) {
      console.warn('[Firebase] Cloud read notice:', e.message);
    }
    return null;
  },

  async getCloudRewards() {
    if (!firebaseDb) return null;
    try {
      const snapshot = await firebaseDb.ref('rewards').once('value');
      const val = snapshot.val();
      if (val) return val;
    } catch (e) {
      console.warn('[Firebase] Cloud rewards read notice:', e.message);
    }
    return null;
  }
};

if (typeof window !== 'undefined') {
  window.FirebaseSync = FirebaseSync;
  window.firebaseConfig = firebaseConfig;
}
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { firebaseConfig, FirebaseSync };
}
