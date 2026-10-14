/**
 * Smart Waste Management Application Core Controller
 * High-Performance Desktop-First Civic Portal
 * Leaflet Maps, Toast Notifications, Voucher Engine & Feedback Loop
 */

let currentView = 'dashboard';
let currentRole = 'resident'; // 'resident' or 'admin'
let cachedComplaints = [];
let selectedGuideCategory = 'all';
let activeInspectedTicket = null;
let selectedFeedbackRating = 5;

// Initialize on DOM load
document.addEventListener('DOMContentLoaded', async () => {
  if (window.lucide) lucide.createIcons();

  // Pre-initialize dashboard map immediately
  if (typeof initDashboardMap === 'function') {
    initDashboardMap();
  }

  // Set up report map pin picker
  initReportMap((lat, lng) => {
    document.getElementById('report-lat').value = lat;
    document.getElementById('report-lng').value = lng;
    document.getElementById('report-coords-text').textContent = `${lat}, ${lng}`;
  });

  // Load initial view
  await navigateTo('dashboard');
});

// ================= ROLE TOGGLE =================
function toggleRole() {
  if (currentRole === 'resident') {
    navigateTo('admin');
    showToast('Switched to Demo Admin Mode (Sanitation Operations)', 'info');
  } else {
    navigateTo('dashboard');
    showToast('Switched to Resident Citizen Mode', 'info');
  }
}

// ================= TOAST NOTIFICATION ENGINE =================
function showToast(message, type = 'success') {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  let bg = 'bg-slate-900 text-white border-slate-700';
  let icon = 'info';

  if (type === 'success') {
    bg = 'bg-emerald-800 text-white border-emerald-700 shadow-lg shadow-emerald-950/20';
    icon = 'check-circle';
  } else if (type === 'error') {
    bg = 'bg-rose-800 text-white border-rose-700 shadow-lg shadow-rose-950/20';
    icon = 'alert-triangle';
  } else if (type === 'info') {
    bg = 'bg-blue-800 text-white border-blue-700 shadow-lg shadow-blue-950/20';
    icon = 'info';
  }

  toast.className = `toast-msg flex items-center space-x-2.5 px-4 py-2.5 rounded-xl border text-xs font-semibold shadow-md max-w-sm ${bg}`;
  toast.innerHTML = `
    <i data-lucide="${icon}" class="w-4 h-4 shrink-0"></i>
    <span class="flex-1">${message}</span>
  `;

  container.appendChild(toast);
  if (window.lucide) lucide.createIcons();

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(-10px)';
    setTimeout(() => toast.remove(), 250);
  }, 3500);
}

// ================= MOBILE DRAWER CONTROLLER =================
function toggleMobileDrawer() {
  const drawer = document.getElementById('mobile-drawer');
  const backdrop = document.getElementById('mobile-drawer-backdrop');
  if (!drawer || !backdrop) return;
  const isClosed = drawer.classList.contains('-translate-x-full');
  if (isClosed) {
    drawer.classList.remove('-translate-x-full');
    backdrop.classList.remove('hidden');
  } else {
    drawer.classList.add('-translate-x-full');
    backdrop.classList.add('hidden');
  }
}

// ================= SPA ROUTING & NAVIGATION =================
async function navigateTo(viewId) {
  currentView = viewId;
  currentRole = 'resident';

  // Update desktop sidebar buttons
  document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.classList.remove('bg-brand-50', 'text-brand-700', 'font-semibold', 'bg-purple-100');
    if (!btn.id.includes('admin')) {
      btn.classList.add('text-slate-600');
    }
  });

  const activeBtn = document.getElementById(`nav-${viewId}`);
  if (activeBtn) {
    if (viewId === 'admin') {
      activeBtn.classList.add('bg-purple-100', 'text-purple-800', 'font-semibold');
    } else {
      activeBtn.classList.remove('text-slate-600');
      activeBtn.classList.add('bg-brand-50', 'text-brand-700', 'font-semibold');
    }
  }

  // Update mobile bottom nav buttons
  document.querySelectorAll('.bnav-btn').forEach(btn => {
    btn.classList.remove('text-emerald-700', 'font-bold');
    btn.classList.add('text-slate-500');
  });
  const activeBNav = document.getElementById(`bnav-${viewId}`);
  if (activeBNav) {
    activeBNav.classList.remove('text-slate-500');
    activeBNav.classList.add('text-emerald-700', 'font-bold');
  }

  // Toggle visible section
  document.querySelectorAll('.view-panel').forEach(panel => {
    panel.classList.remove('active');
  });

  const activePanel = document.getElementById(`view-${viewId}`);
  if (activePanel) {
    activePanel.classList.add('active');
  }

  if (window.lucide) lucide.createIcons();

  // Scroll to top of content area on navigation
  const contentArea = document.getElementById('content-area');
  if (contentArea) contentArea.scrollTo({ top: 0, behavior: 'smooth' });

  // Load view-specific data
  if (viewId === 'dashboard') {
    await loadDashboardView();
    if (typeof dashMap !== 'undefined' && dashMap) {
      [50, 150, 300].forEach(d => setTimeout(() => dashMap.invalidateSize(), d));
    }
  }
  else if (viewId === 'guide') await loadWasteGuideView();
  else if (viewId === 'complaints') await loadComplaintsView();
  else if (viewId === 'collections') await loadPickupsView();
  else if (viewId === 'community') await loadCommunityView();
  else if (viewId === 'rewards') await loadRewardsView();
  else if (viewId === 'admin') await loadAdminView();
  else if (viewId === 'report') {
    if (typeof reportMap !== 'undefined' && reportMap) {
      [50, 150, 300].forEach(d => setTimeout(() => reportMap.invalidateSize(), d));
    }
  }
}

// ================= VIEW: DASHBOARD =================
async function loadDashboardView() {
  try {
    const statsRes = await API.getDashboardStats();
    if (statsRes.success) {
      const stats = statsRes.data;
      document.getElementById('dash-submitted').textContent = stats.submittedCount;
      document.getElementById('dash-inprogress').textContent = stats.inProgressCount;
      document.getElementById('dash-resolved').textContent = stats.resolvedCount;
      document.getElementById('top-eco-points').textContent = stats.ecoPoints;
      document.getElementById('dash-points-display').textContent = `${stats.ecoPoints} Pts`;

      // Render latest complaint
      const latestContainer = document.getElementById('dash-latest-container');
      if (stats.latestComplaint) {
        const c = stats.latestComplaint;
        const photoHtml = c.photoUrl ? `
          <div class="img-zoom-container h-24 rounded-lg overflow-hidden relative mb-2 bg-slate-200">
            <img src="${c.photoUrl}" alt="${c.issueTypeName || c.issueType}" class="w-full h-full object-cover" />
            <span class="absolute top-1.5 left-1.5 px-2 py-0.5 rounded text-[9px] font-bold uppercase ${c.severity === 'high' ? 'bg-rose-600 text-white' : 'bg-amber-500 text-white'}">
              ${c.severity || 'Normal'} Priority
            </span>
          </div>
        ` : '';
        latestContainer.innerHTML = `
          ${photoHtml}
          <div class="flex items-center justify-between">
            <span class="font-bold text-xs text-slate-900">${c.id}</span>
            <span class="px-2 py-0.5 rounded text-[10px] font-bold ${getStatusBadgeClass(c.status)}">${c.status}</span>
          </div>
          <div class="text-xs font-semibold text-slate-800">${c.issueTypeName || c.issueType}</div>
          <div class="text-[11px] text-slate-500 truncate"><i data-lucide="map-pin" class="w-3 h-3 inline mr-1 text-slate-400"></i>${c.address}</div>
          <button onclick="viewComplaintDetail('${c.id}')" class="w-full text-center text-xs font-bold text-brand-700 bg-white hover:bg-slate-50 py-2 rounded-lg border border-slate-200 shadow-xs transition mt-1.5 flex items-center justify-center space-x-1">
            <span>Inspect Complaint & Timeline &rarr;</span>
          </button>
        `;
      } else {
        latestContainer.innerHTML = `<div class="text-xs text-slate-400 py-3 text-center">No complaints recorded yet.</div>`;
      }
    }

    // Always initialize dashboard map immediately
    initDashboardMap(cachedComplaints);

    // Load complaints for map
    try {
      const compRes = await API.getComplaints();
      if (compRes && compRes.success) {
        cachedComplaints = compRes.data;
        const countBadge = document.getElementById('badge-complaints-count');
        if (countBadge) countBadge.textContent = cachedComplaints.length;
        updateDashboardMapPins(cachedComplaints);
      }
    } catch (e) {
      console.warn('Complaints fetch notice:', e);
      updateDashboardMapPins(cachedComplaints);
    }

    if (typeof dashMap !== 'undefined' && dashMap) {
      [50, 150, 300, 600].forEach(d => setTimeout(() => dashMap.invalidateSize(), d));
    }
  } catch (err) {
    console.error('Error loading dashboard:', err);
    if (typeof initDashboardMap === 'function') initDashboardMap();
  }
  if (window.lucide) lucide.createIcons();
}

// ================= VIEW: REPORT GARBAGE =================
function fillReportLocation(address, landmark, lat, lng) {
  document.getElementById('report-address').value = address;
  document.getElementById('report-landmark').value = landmark;
  document.getElementById('report-lat').value = lat;
  document.getElementById('report-lng').value = lng;
  document.getElementById('report-coords-text').textContent = `${lat}, ${lng}`;
  setReportMapMarker(lat, lng);
  showToast(`Location pre-filled: ${address}`, 'info');
}

function setQuickLandmark(landmark, lat, lng, defaultAddress) {
  const landmarkInput = document.getElementById('report-landmark');
  const addressInput = document.getElementById('report-address');
  if (landmarkInput) landmarkInput.value = landmark;
  if (addressInput && (!addressInput.value.trim() || addressInput.value.includes('Near') || addressInput.value.includes('Road'))) {
    addressInput.value = defaultAddress;
  }
  if (lat && lng) {
    document.getElementById('report-lat').value = lat;
    document.getElementById('report-lng').value = lng;
    document.getElementById('report-coords-text').textContent = `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
    setReportMapMarker(lat, lng);
  }
  showToast(`Landmark set: ${landmark}`, 'success');
}

function setPresetPhoto(url) {
  document.getElementById('report-photo-url').value = url;
  document.getElementById('upload-preview-img').src = url;
  document.getElementById('upload-placeholder').classList.add('hidden');
  document.getElementById('upload-preview-container').classList.remove('hidden');
  showToast('Demo photo attached successfully', 'info');
}

function handlePhotoSelect(e) {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function(evt) {
    const base64Data = evt.target.result;
    document.getElementById('report-photo-url').value = base64Data;
    document.getElementById('upload-preview-img').src = base64Data;
    document.getElementById('upload-placeholder').classList.add('hidden');
    document.getElementById('upload-preview-container').classList.remove('hidden');
    showToast('Image uploaded and preview generated');
  };
  reader.readAsDataURL(file);
}

function removePhoto(e) {
  e.stopPropagation();
  document.getElementById('report-photo-input').value = '';
  document.getElementById('report-photo-url').value = '';
  document.getElementById('upload-preview-img').src = '';
  document.getElementById('upload-preview-container').classList.add('hidden');
  document.getElementById('upload-placeholder').classList.remove('hidden');
}

function detectBrowserLocation() {
  if (!navigator.geolocation) {
    showToast('Geolocation is not supported by your browser.', 'error');
    return;
  }
  showToast('Detecting GPS coordinates...', 'info');
  navigator.geolocation.getCurrentPosition(
    pos => {
      const lat = pos.coords.latitude.toFixed(5);
      const lng = pos.coords.longitude.toFixed(5);
      document.getElementById('report-lat').value = lat;
      document.getElementById('report-lng').value = lng;
      document.getElementById('report-coords-text').textContent = `${lat}, ${lng}`;
      setReportMapMarker(lat, lng);
      document.getElementById('report-landmark').value = 'Auto-detected via GPS Device Location';
      showToast('GPS coordinates accurately locked', 'success');
    },
    err => {
      showToast('GPS access denied or timed out. You can click any point on the map.', 'info');
    }
  );
}

function toggleCustomIssueInput() {
  const otherRadio = document.querySelector('input[name="reportIssueType"][value="other"]');
  const customContainer = document.getElementById('other-custom-container');
  const customInput = document.getElementById('report-custom-issue');
  if (otherRadio && customContainer) {
    if (otherRadio.checked) {
      customContainer.classList.remove('hidden');
      if (customInput) customInput.focus();
    } else {
      customContainer.classList.add('hidden');
    }
  }
}

async function handleReportSubmit(e) {
  e.preventDefault();
  const errorBox = document.getElementById('report-error-box');
  const errorMsg = document.getElementById('report-error-msg');
  errorBox.classList.add('hidden');

  const issueTypeInput = document.querySelector('input[name="reportIssueType"]:checked');
  const severityInput = document.querySelector('input[name="reportSeverity"]:checked');
  const address = document.getElementById('report-address').value.trim();
  const landmark = document.getElementById('report-landmark').value.trim();
  const lat = document.getElementById('report-lat').value;
  const lng = document.getElementById('report-lng').value;
  const description = document.getElementById('report-description').value.trim();
  const photoUrl = document.getElementById('report-photo-url').value;

  if (!issueTypeInput) {
    errorMsg.textContent = 'Please choose an issue category.';
    errorBox.classList.remove('hidden');
    return;
  }
  if (!address) {
    errorMsg.textContent = 'Street address or location is required.';
    errorBox.classList.remove('hidden');
    return;
  }

  let issueType = issueTypeInput.value;
  let issueTypeName = '';
  if (issueType === 'other') {
    const customText = document.getElementById('report-custom-issue')?.value.trim();
    if (customText) {
      issueTypeName = customText;
    } else {
      issueTypeName = 'Other Sanitation Issue';
    }
  } else if (issueType === 'biohazard_sewage') {
    issueTypeName = 'Open Sewage & Biohazard';
  }

  const payload = {
    issueType,
    issueTypeName: issueTypeName || undefined,
    severity: severityInput ? severityInput.value : 'medium',
    address,
    landmark,
    latitude: lat,
    longitude: lng,
    description,
    photoUrl: photoUrl || null
  };

  try {
    const res = await API.submitComplaint(payload);
    if (res.success) {
      document.getElementById('success-ticket-id').textContent = res.data.id;
      openModal('report-success-modal');
      resetReportForm();
      showToast(`Cleanliness complaint registered: ${res.data.id} (+20 Eco-Pts)`, 'success');
    } else {
      errorMsg.textContent = res.error || 'Submission failed.';
      errorBox.classList.remove('hidden');
    }
  } catch (err) {
    errorMsg.textContent = 'Network or server error submitting report.';
    errorBox.classList.remove('hidden');
  }
}

function resetReportForm() {
  document.getElementById('form-report-garbage').reset();
  const customInput = document.getElementById('report-custom-issue');
  if (customInput) customInput.value = '';
  const customContainer = document.getElementById('other-custom-container');
  if (customContainer) customContainer.classList.add('hidden');
  removePhoto({ stopPropagation: () => {} });
  document.getElementById('report-coords-text').textContent = '19.0760, 72.8777';
}


// ================= VIEW: WASTE GUIDE & QUIZ =================
async function loadWasteGuideView() {
  const query = document.getElementById('guide-search-input').value;
  try {
    const res = await API.getWasteGuide(query, selectedGuideCategory);
    if (res.success) {
      renderWasteGuideItems(res.data);
    }
  } catch (err) {
    console.error('Error fetching waste guide:', err);
  }
}

function handleGuideSearch() {
  loadWasteGuideView();
}

function setGuideSearch(term) {
  document.getElementById('guide-search-input').value = term;
  loadWasteGuideView();
}

function filterGuideCategory(category) {
  selectedGuideCategory = category;
  document.querySelectorAll('.guide-cat-btn').forEach(btn => {
    if (btn.getAttribute('data-cat') === category) {
      btn.className = 'guide-cat-btn px-3 py-1.5 rounded-lg font-semibold bg-brand-600 text-white';
    } else {
      btn.className = 'guide-cat-btn px-3 py-1.5 rounded-lg font-semibold bg-slate-100 text-slate-600 hover:bg-slate-200';
    }
  });
  loadWasteGuideView();
}

function checkQuizAnswer(choice) {
  const feedback = document.getElementById('quiz-feedback');
  if (!feedback) return;
  feedback.classList.remove('hidden');

  if (choice === 'blue') {
    feedback.className = 'text-xs p-3.5 rounded-xl bg-rose-50 text-rose-800 border border-rose-200 space-y-1 mt-2';
    feedback.innerHTML = `
      <strong>Incorrect:</strong> Grease and melted cheese soak into paper fibers, permanently ruining the pulp recycling process. Food-soiled cardboard cannot be recycled in the Blue Bin.
    `;
  } else {
    feedback.className = 'text-xs p-3.5 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 space-y-1 mt-2';
    feedback.innerHTML = `
      <strong>Correct! (+10 Eco-Points):</strong> Food-soiled greasy cardboard belongs in wet composting or non-recyclable grey/black bins because grease contaminates standard recycling batches.
    `;
    showToast('Correct answer! +10 Eco-Points added to your balance.', 'success');
    
    // Add points to UI
    const topPoints = document.getElementById('top-eco-points');
    if (topPoints) {
      const current = parseInt(topPoints.textContent) || 240;
      topPoints.textContent = current + 10;
    }
  }
}

function renderWasteGuideItems(items) {
  const grid = document.getElementById('guide-items-grid');
  if (!items || items.length === 0) {
    grid.innerHTML = `
      <div class="col-span-2 p-8 bg-white rounded-xl border border-slate-200 text-center space-y-2">
        <i data-lucide="search-x" class="w-8 h-8 text-slate-400 mx-auto"></i>
        <div class="text-sm font-bold text-slate-700">No matching waste items found</div>
        <div class="text-xs text-slate-500">Try searching for common terms like peels, cardboard, batteries, or bottles.</div>
      </div>
    `;
    if (window.lucide) lucide.createIcons();
    return;
  }

  grid.innerHTML = items.map(item => {
    let binBg = 'bg-emerald-50 text-emerald-800 border-emerald-300 ring-emerald-500/10';
    let binIcon = 'leaf';
    let borderAccent = 'border-l-4 border-l-emerald-500';
    
    if (item.binColor === 'blue') {
      binBg = 'bg-blue-50 text-blue-800 border-blue-300 ring-blue-500/10';
      binIcon = 'package';
      borderAccent = 'border-l-4 border-l-blue-500';
    } else if (item.binColor === 'red') {
      binBg = 'bg-rose-50 text-rose-800 border-rose-300 ring-rose-500/10';
      binIcon = 'alert-triangle';
      borderAccent = 'border-l-4 border-l-rose-500';
    } else if (item.binColor === 'black') {
      binBg = 'bg-slate-100 text-slate-800 border-slate-300 ring-slate-500/10';
      binIcon = 'shield';
      borderAccent = 'border-l-4 border-l-slate-600';
    } else if (item.binColor === 'special') {
      binBg = 'bg-purple-50 text-purple-800 border-purple-300 ring-purple-500/10';
      binIcon = 'cpu';
      borderAccent = 'border-l-4 border-l-purple-500';
    }

    return `
      <div class="bg-white p-5 rounded-2xl border border-slate-200/90 ${borderAccent} shadow-xs hover-lift transition-all space-y-3.5 group">
        <div class="flex items-start justify-between gap-3">
          <div>
            <h3 class="font-bold text-sm text-slate-900 group-hover:text-emerald-950 transition">${item.itemName}</h3>
            <span class="inline-flex items-center text-[11px] font-semibold text-slate-400 mt-0.5">
              <span class="w-1.5 h-1.5 rounded-full bg-slate-300 mr-1.5"></span>
              ${item.categoryName}
            </span>
          </div>
          <span class="px-2.5 py-1 rounded-xl text-xs font-bold border ${binBg} ring-1 flex items-center space-x-1.5 shrink-0 shadow-2xs">
            <i data-lucide="${binIcon}" class="w-3.5 h-3.5"></i>
            <span>${item.binLabel}</span>
          </span>
        </div>

        <div class="text-xs text-slate-700 leading-relaxed space-y-2">
          <div class="bg-slate-50/70 p-3 rounded-xl border border-slate-100/80">
            <div class="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1">Proper Disposal Protocol</div>
            <div class="text-slate-800 font-medium">${item.instructions}</div>
          </div>
          
          <div class="p-2.5 bg-emerald-50/40 rounded-xl text-[11px] text-emerald-900 border border-emerald-100 flex items-start space-x-2">
            <i data-lucide="landmark" class="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5"></i>
            <div><strong>Municipal Guideline:</strong> ${item.localRuleNote}</div>
          </div>

          ${item.specialHandlingWarning ? `
            <div class="p-2.5 bg-rose-50/60 rounded-xl text-[11px] text-rose-900 border border-rose-100 flex items-start space-x-2">
              <i data-lucide="alert-circle" class="w-3.5 h-3.5 text-rose-600 shrink-0 mt-0.5"></i>
              <div><strong>Safety Warning:</strong> ${item.specialHandlingWarning}</div>
            </div>
          ` : ''}
        </div>
      </div>
    `;
  }).join('');

  if (window.lucide) lucide.createIcons();
}

// ================= VIEW: MY COMPLAINTS =================
let complaintFilterTab = 'all';

async function loadComplaintsView() {
  try {
    const res = await API.getComplaints();
    if (res.success) {
      cachedComplaints = res.data;
      renderComplaintsList();
    }
  } catch (err) {
    console.error('Error fetching complaints:', err);
  }
}

function filterComplaintsTab(tab) {
  complaintFilterTab = tab;
  document.querySelectorAll('.complaint-tab-btn').forEach(btn => {
    if (btn.getAttribute('data-tab') === tab) {
      btn.className = 'complaint-tab-btn px-3.5 py-1.5 rounded-lg font-bold bg-slate-800 text-white';
    } else {
      btn.className = 'complaint-tab-btn px-3.5 py-1.5 rounded-lg font-bold bg-white text-slate-600 border border-slate-200 hover:bg-slate-50';
    }
  });
  renderComplaintsList();
}

function renderComplaintsList() {
  const container = document.getElementById('complaints-list-container');
  let list = [...cachedComplaints];

  if (complaintFilterTab === 'active') {
    list = list.filter(c => c.status !== 'Resolved');
  } else if (complaintFilterTab === 'resolved') {
    list = list.filter(c => c.status === 'Resolved');
  }

  if (list.length === 0) {
    container.innerHTML = `
      <div class="p-12 bg-white rounded-3xl border border-slate-200/90 text-center space-y-3 shadow-xs">
        <div class="w-14 h-14 rounded-2xl bg-slate-100 text-slate-400 mx-auto flex items-center justify-center">
          <i data-lucide="inbox" class="w-7 h-7"></i>
        </div>
        <div class="text-base font-bold text-slate-800">No complaints in this category</div>
        <div class="text-xs text-slate-500 max-w-sm mx-auto">All reports are either handled or no new issues logged. Use "Report Garbage" anytime you spot unattended waste.</div>
        <button onclick="navigateTo('report')" class="mt-2 inline-flex items-center space-x-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition shadow-sm">
          <i data-lucide="plus" class="w-3.5 h-3.5"></i>
          <span>Report Garbage Spot</span>
        </button>
      </div>
    `;
    if (window.lucide) lucide.createIcons();
    return;
  }

  container.innerHTML = list.map(c => {
    let statusBorder = 'border-l-4 border-l-slate-400';
    if (c.status === 'Resolved') statusBorder = 'border-l-4 border-l-emerald-500';
    else if (c.status === 'Cleaning In Progress') statusBorder = 'border-l-4 border-l-amber-500';
    else if (c.status === 'Under Review' || c.status === 'Assigned') statusBorder = 'border-l-4 border-l-blue-500';
    else if (c.status === 'Reopened') statusBorder = 'border-l-4 border-l-rose-500';

    return `
      <div class="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/90 ${statusBorder} shadow-xs hover-lift transition-all space-y-4">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-3 border-b border-slate-100">
          <div class="flex flex-wrap items-center gap-2">
            <span class="font-black text-sm text-slate-900 tracking-tight font-mono">${c.id}</span>
            <span class="px-2.5 py-1 rounded-full text-xs font-bold ${getStatusBadgeClass(c.status)}">${c.status}</span>
            <span class="px-2.5 py-1 rounded-full text-[11px] font-bold ${getSeverityBadgeClass(c.severity)}">${c.severity.toUpperCase()}</span>
            ${c.feedback ? `<span class="px-2.5 py-0.5 bg-amber-50 text-amber-800 border border-amber-200 text-[11px] font-bold rounded-full flex items-center gap-1">★ ${c.feedback.rating}/5 Evaluated</span>` : ''}
            ${c.afterPhotoUrl ? `<span class="px-2 py-0.5 bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-bold rounded-full flex items-center gap-1"><i data-lucide="check-check" class="w-3 h-3"></i>Proof Ready</span>` : ''}
          </div>
          <span class="text-xs text-slate-400 font-medium">${new Date(c.createdAt).toLocaleDateString()} at ${new Date(c.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs items-center">
          <div class="md:col-span-3 space-y-2">
            <h4 class="font-bold text-sm text-slate-900">${c.issueTypeName || c.issueType}</h4>
            <p class="text-slate-600 leading-relaxed">${c.description || 'No additional resident observation logged.'}</p>
            <div class="text-slate-500 text-xs flex items-center space-x-1.5 pt-1">
              <i data-lucide="map-pin" class="w-3.5 h-3.5 text-emerald-600 shrink-0"></i>
              <span class="font-medium text-slate-700">${c.address} ${c.landmark ? `• Landmark: ${c.landmark}` : ''}</span>
            </div>
          </div>
          <div class="flex flex-col justify-between items-start md:items-end border-t md:border-t-0 md:border-l border-slate-100 pt-3 md:pt-0 md:pl-4 space-y-3">
            ${c.photoUrl ? `
              <div class="relative group cursor-pointer" onclick="viewComplaintDetail('${c.id}')">
                <img src="${c.photoUrl}" alt="Issue Photo" class="w-20 h-14 object-cover rounded-xl border border-slate-200 shadow-2xs group-hover:scale-105 transition">
                <span class="absolute bottom-1 right-1 bg-black/60 text-[9px] text-white px-1 rounded backdrop-blur-xs font-mono">GPS</span>
              </div>
            ` : `<div class="text-[11px] text-slate-400 italic">No photo attached</div>`}
            <button onclick="viewComplaintDetail('${c.id}')" class="text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-3.5 py-2 rounded-xl border border-emerald-200/80 transition flex items-center space-x-1.5 group">
              <span>View Timeline & Proof</span>
              <i data-lucide="arrow-right" class="w-3.5 h-3.5 group-hover:translate-x-1 transition"></i>
            </button>
          </div>
        </div>
      </div>
    `;
  }).join('');

  if (window.lucide) lucide.createIcons();
}

// ================= COMPLAINT DETAIL MODAL =================
async function viewComplaintDetail(ticketId) {
  try {
    const res = await API.getComplaintById(ticketId);
    if (!res.success) return;
    const c = res.data;
    activeInspectedTicket = c;

    document.getElementById('detail-ticket-id').textContent = c.id;
    document.getElementById('detail-status-badge').textContent = c.status;
    document.getElementById('detail-status-badge').className = `px-2.5 py-0.5 rounded-full text-xs font-bold ${getStatusBadgeClass(c.status)}`;
    document.getElementById('detail-issue-type').textContent = c.issueTypeName || c.issueType;
    document.getElementById('detail-severity').textContent = `${c.severity.toUpperCase()} Priority`;
    document.getElementById('detail-severity').className = `font-bold ${c.severity === 'high' ? 'text-red-600' : (c.severity === 'medium' ? 'text-amber-600' : 'text-green-600')}`;
    document.getElementById('detail-location').textContent = `${c.address} ${c.landmark ? `(${c.landmark})` : ''}`;
    document.getElementById('detail-date').textContent = new Date(c.createdAt).toLocaleString();
    document.getElementById('detail-description').textContent = c.description || 'No additional resident observations logged.';

    // Photos
    const beforePhoto = document.getElementById('detail-photo-before');
    if (c.photoUrl) {
      beforePhoto.src = c.photoUrl;
      beforePhoto.classList.remove('hidden');
    } else {
      beforePhoto.src = 'https://images.unsplash.com/photo-1530587191325-3db32d826c18?auto=format&fit=crop&w=600&q=80';
    }

    const afterBox = document.getElementById('detail-after-box');
    if (c.afterPhotoUrl) {
      afterBox.innerHTML = `<img src="${c.afterPhotoUrl}" alt="Cleaned Evidence" class="w-full h-36 object-cover rounded-lg border border-emerald-300">`;
    } else {
      afterBox.innerHTML = `<div class="p-4 text-center text-slate-400 italic">Cleaning resolution photo pending from squad</div>`;
    }

    // Resolution note
    const resBox = document.getElementById('detail-resolution-box');
    if (c.resolutionNote) {
      document.getElementById('detail-resolution-note').textContent = c.resolutionNote;
      resBox.classList.remove('hidden');
    } else {
      resBox.classList.add('hidden');
    }

    // Citizen Feedback Evaluation Box (PCE Mutual Accountability)
    const feedbackBox = document.getElementById('detail-feedback-box');
    const reopenBox = document.getElementById('detail-reopen-container');

    if (c.status === 'Resolved') {
      reopenBox.classList.remove('hidden');
      if (c.feedback) {
        feedbackBox.innerHTML = `
          <div class="flex items-center justify-between text-xs">
            <span class="font-bold text-amber-900">Your Cleanliness Rating: ${'★'.repeat(c.feedback.rating)}${'☆'.repeat(5 - c.feedback.rating)} (${c.feedback.rating}/5)</span>
            <span class="text-[11px] text-emerald-700 font-bold">✓ Feedback Logged</span>
          </div>
          ${c.feedback.comment ? `<p class="text-xs text-slate-600 italic">"${c.feedback.comment}"</p>` : ''}
        `;
        feedbackBox.classList.remove('hidden');
      } else {
        setFeedbackRating(5);
        feedbackBox.classList.remove('hidden');
      }
    } else {
      feedbackBox.classList.add('hidden');
      reopenBox.classList.add('hidden');
    }

    // 5-Step Timeline (PRD Section 7.3)
    const timelineContainer = document.getElementById('detail-timeline-steps');
    const stages = ['Submitted', 'Under Review', 'Assigned', 'Cleaning In Progress', 'Resolved'];
    const currentIdx = stages.indexOf(c.status);

    timelineContainer.innerHTML = stages.map((stage, idx) => {
      const isPast = currentIdx >= idx;
      const isCurrent = currentIdx === idx;
      let circleBg = isPast ? 'bg-brand-600 text-white' : 'bg-slate-200 text-slate-500';
      if (c.status === 'Reopened' && idx === 0) circleBg = 'bg-rose-600 text-white';

      return `
        <div class="flex-1 timeline-step ${isPast ? 'completed' : ''} text-center relative">
          <div class="w-8 h-8 rounded-full ${circleBg} flex items-center justify-center mx-auto text-xs font-bold mb-1 shadow-sm z-10 relative">
            ${isPast ? '<i data-lucide="check" class="w-4 h-4"></i>' : (idx + 1)}
          </div>
          <div class="text-[11px] font-semibold ${isCurrent ? 'text-brand-700 font-bold' : 'text-slate-600'} leading-tight">
            ${stage}
          </div>
        </div>
      `;
    }).join('');

    openModal('complaint-detail-modal');
    if (window.lucide) lucide.createIcons();
  } catch (err) {
    console.error('Error viewing complaint:', err);
  }
}

function setFeedbackRating(stars) {
  selectedFeedbackRating = stars;
  document.querySelectorAll('#star-rating-container .star-btn').forEach(btn => {
    const s = parseInt(btn.getAttribute('data-star'), 10);
    btn.style.color = s <= stars ? '#f59e0b' : '#cbd5e1';
  });
  const textEl = document.getElementById('star-rating-text');
  if (textEl) {
    textEl.textContent = `${stars} / 5 Stars`;
  }
}

async function submitCitizenFeedback() {
  if (!activeInspectedTicket) return;
  const comment = document.getElementById('feedback-comment').value;

  try {
    const res = await API.submitComplaintFeedback(activeInspectedTicket.id, selectedFeedbackRating, comment);
    if (res.success) {
      showToast(`Cleanliness evaluation submitted (+15 Eco-Pts)`, 'success');
      closeModal('complaint-detail-modal');
      await loadComplaintsView();
      await loadDashboardView();
    }
  } catch (err) {
    showToast('Failed to record evaluation', 'error');
  }
}

async function promptReopenComplaint() {
  if (!activeInspectedTicket) return;
  const reason = prompt('Please explain why this area requires re-inspection (e.g. residual waste or dumping reoccurred):');
  if (!reason || !reason.trim()) return;

  try {
    const res = await API.reopenComplaint(activeInspectedTicket.id, reason);
    if (res.success) {
      showToast(`Complaint ${activeInspectedTicket.id} reopened for re-inspection`, 'info');
      closeModal('complaint-detail-modal');
      await loadComplaintsView();
      await loadDashboardView();
    }
  } catch (err) {
    showToast('Failed to reopen complaint', 'error');
  }
}

// ================= VIEW: SPECIAL PICKUPS =================
async function loadPickupsView() {
  try {
    const res = await API.getPickups();
    if (res.success) {
      const list = res.data;
      const container = document.getElementById('pickups-list-container');
      if (list.length === 0) {
        container.innerHTML = `
          <div class="p-8 bg-white rounded-2xl border border-slate-200/90 text-center space-y-2">
            <div class="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 mx-auto flex items-center justify-center">
              <i data-lucide="truck" class="w-5 h-5"></i>
            </div>
            <div class="text-xs font-bold text-slate-700">No active pickup requests</div>
            <div class="text-[11px] text-slate-400">Fill out the booking form to schedule bulk disposal.</div>
          </div>
        `;
        if (window.lucide) lucide.createIcons();
        return;
      }
      container.innerHTML = list.map(p => `
        <div class="bg-white p-4 rounded-2xl border border-slate-200/90 border-l-4 border-l-blue-500 shadow-xs hover-lift transition-all space-y-2.5 text-xs">
          <div class="flex items-center justify-between">
            <span class="font-black text-slate-900 font-mono">${p.id}</span>
            <span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200 flex items-center gap-1">
              <span class="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
              <span>${p.status}</span>
            </span>
          </div>
          <div class="font-bold text-slate-900">${p.wasteTypeName}</div>
          <p class="text-slate-600 text-[11px]">${p.description} <span class="text-slate-400 font-semibold">• ${p.quantityDescription}</span></p>
          <div class="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <div class="flex items-center space-x-1.5 text-blue-700 font-medium">
              <i data-lucide="calendar-clock" class="w-3.5 h-3.5"></i>
              <span>${p.preferredSlot}</span>
            </div>
          </div>
        </div>
      `).join('');
      if (window.lucide) lucide.createIcons();
    }
  } catch (err) {
    console.error('Error loading pickups:', err);
  }
}

async function handlePickupSubmit(e) {
  e.preventDefault();
  const wasteType = document.getElementById('pickup-type').value;
  const description = document.getElementById('pickup-desc').value.trim();
  const quantityDescription = document.getElementById('pickup-qty').value.trim();
  const address = document.getElementById('pickup-address').value.trim();
  const preferredSlot = document.getElementById('pickup-slot').value;

  try {
    const res = await API.submitPickup({
      wasteType,
      description,
      quantityDescription,
      address,
      preferredSlot
    });
    if (res.success) {
      showToast(`Pickup scheduled! Reference: ${res.data.id}`, 'success');
      document.getElementById('form-pickup-request').reset();
      loadPickupsView();
    }
  } catch (err) {
    showToast('Failed to submit pickup booking', 'error');
  }
}

// ================= VIEW: COMMUNITY DRIVES =================
async function loadCommunityView() {
  try {
    const res = await API.getEvents();
    if (res.success) {
      const events = res.data;
      const grid = document.getElementById('community-events-grid');
      
      const eventPhotos = {
        'evt-01': 'https://images.unsplash.com/photo-1559027615-cd4628902d4a?auto=format&fit=crop&w=600&q=80',
        'evt-02': 'https://images.unsplash.com/photo-1584473457406-6240486418e9?auto=format&fit=crop&w=600&q=80',
        'evt-03': 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=600&q=80'
      };

      grid.innerHTML = events.map(evt => {
        const percent = Math.min(100, Math.round((evt.registrationCount / evt.maxCapacity) * 100));
        const isRegistered = evt.registeredUsers && evt.registeredUsers.includes('resident_citizen');
        const photo = eventPhotos[evt.id] || 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?auto=format&fit=crop&w=600&q=80';

        return `
          <div class="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden flex flex-col justify-between hover-lift transition-all group">
            <div class="img-zoom-container h-36 relative bg-slate-100">
              <img src="${photo}" alt="${evt.title}" class="w-full h-full object-cover">
              <div class="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-slate-950/20 to-transparent"></div>
              <div class="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-emerald-600/90 text-white backdrop-blur-md text-[10px] font-extrabold uppercase tracking-wider shadow-sm flex items-center space-x-1">
                <i data-lucide="sparkles" class="w-3 h-3 text-amber-300"></i>
                <span>+${evt.rewardPoints || 50} Eco-Pts</span>
              </div>
              <div class="absolute bottom-2.5 left-3 right-3 flex items-center justify-between text-white text-[11px] font-medium">
                <span class="flex items-center space-x-1">
                  <i data-lucide="calendar" class="w-3.5 h-3.5 text-emerald-300"></i>
                  <span>${evt.eventDate.split('•')[0]}</span>
                </span>
              </div>
            </div>

            <div class="p-5 space-y-3.5 flex-1 flex flex-col justify-between">
              <div class="space-y-2">
                <h3 class="font-bold text-sm text-slate-900 group-hover:text-emerald-800 transition leading-snug">${evt.title}</h3>
                <p class="text-xs text-slate-600 line-clamp-2 leading-relaxed">${evt.description}</p>
                
                <div class="text-xs text-slate-500 space-y-1.5 pt-2 border-t border-slate-100">
                  <div class="flex items-center space-x-2 text-slate-700">
                    <i data-lucide="clock" class="w-3.5 h-3.5 text-amber-600 shrink-0"></i>
                    <span class="font-medium text-[11px]">${evt.eventDate.includes('•') ? evt.eventDate.split('•')[1] : evt.eventDate}</span>
                  </div>
                  <div class="flex items-center space-x-2 text-slate-700">
                    <i data-lucide="map-pin" class="w-3.5 h-3.5 text-emerald-600 shrink-0"></i>
                    <span class="font-medium text-[11px] line-clamp-1">${evt.location}</span>
                  </div>
                </div>
              </div>

              <div class="space-y-3 pt-2">
                <div class="space-y-1.5">
                  <div class="flex justify-between text-[11px] font-semibold text-slate-600">
                    <span>Registered Volunteers</span>
                    <span class="font-bold text-slate-800">${evt.registrationCount} / ${evt.maxCapacity}</span>
                  </div>
                  <div class="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div class="bg-gradient-to-r from-emerald-500 to-teal-500 h-2 rounded-full transition-all duration-500" style="width: ${percent}%;"></div>
                  </div>
                </div>
                
                <button onclick="registerForEvent('${evt.id}')" ${isRegistered ? 'disabled' : ''} class="w-full py-2.5 ${isRegistered ? 'bg-emerald-50 text-emerald-800 border border-emerald-300 cursor-default' : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-700/20'} rounded-xl text-xs font-bold transition flex items-center justify-center space-x-2">
                  <i data-lucide="${isRegistered ? 'check-circle' : 'user-plus'}" class="w-4 h-4"></i>
                  <span>${isRegistered ? 'Seat Confirmed' : 'Register for Drive'}</span>
                </button>
              </div>
            </div>
          </div>
        `;
      }).join('');
      if (window.lucide) lucide.createIcons();
    }
  } catch (err) {
    console.error('Error loading community events:', err);
  }
}

async function registerForEvent(eventId) {
  try {
    const res = await API.registerEvent(eventId);
    if (res.success) {
      if (res.data.alreadyRegistered) {
        showToast('You are already registered for this drive', 'info');
      } else {
        showToast(`Registration confirmed! (+${res.data.rewardPoints || 50} Eco-Points)`, 'success');
        await loadCommunityView();
        await loadDashboardView();
      }
    }
  } catch (err) {
    showToast('Registration could not be completed', 'error');
  }
}

// ================= VIEW: ECO REWARDS & VOUCHER REDEEM =================
async function loadRewardsView() {
  try {
    const res = await API.getRewards();
    if (res && res.success) {
      const data = res.data;
      const currentBalance = typeof data.balance === 'number' ? data.balance : 240;
      
      const bigBalance = document.getElementById('rewards-balance-big');
      if (bigBalance) bigBalance.textContent = `${currentBalance} Eco-Pts`;
      
      const topPts = document.getElementById('top-eco-points');
      if (topPts) topPts.textContent = currentBalance;

      // Render Ledger
      const ledgerList = document.getElementById('rewards-ledger-list');
      const ledgerEntries = data.ledger || [];
      if (ledgerEntries.length === 0) {
        ledgerList.innerHTML = `<div class="text-xs text-slate-400 py-4 text-center">No transactions recorded yet. Complete activities or report garbage to earn points!</div>`;
      } else {
        ledgerList.innerHTML = ledgerEntries.map(entry => {
          const reason = entry.reason || entry.description || 'Civic Cleanliness Contribution';
          const rawDate = entry.createdAt || entry.date;
          let formattedDate = 'Recent';
          if (rawDate) {
            try {
              const d = new Date(rawDate);
              if (!isNaN(d.getTime())) {
                formattedDate = d.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
              }
            } catch (e) {
              formattedDate = 'Recent';
            }
          }
          const ptsNum = typeof entry.points === 'number' ? entry.points : (parseInt(entry.points) || 0);
          const isDeduction = ptsNum < 0;

          return `
            <div class="flex items-center justify-between p-3.5 rounded-xl border border-slate-100 bg-slate-50/70 hover:bg-slate-50 text-xs transition">
              <div class="flex items-center space-x-3">
                <div class="w-8 h-8 rounded-lg ${isDeduction ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'} flex items-center justify-center shrink-0">
                  <i data-lucide="${isDeduction ? 'gift' : 'award'}" class="w-4 h-4"></i>
                </div>
                <div class="space-y-0.5">
                  <div class="font-bold text-slate-800">${reason}</div>
                  <div class="text-[11px] text-slate-400">${formattedDate}</div>
                </div>
              </div>
              <span class="font-black ${isDeduction ? 'text-amber-800 bg-amber-100/70 border-amber-200' : 'text-emerald-700 bg-emerald-100/70 border-emerald-200'} px-2.5 py-1 rounded-lg text-xs border font-mono shrink-0">
                ${ptsNum > 0 ? '+' : ''}${ptsNum} Pts
              </span>
            </div>
          `;
        }).join('');
      }

      // Render sample coupons with active Redeem buttons (PRD Section 7.7)
      const couponsGrid = document.getElementById('rewards-coupons-grid');
      const sampleCoupons = data.sampleCoupons || [];
      couponsGrid.innerHTML = sampleCoupons.map(cpn => {
        const canAfford = currentBalance >= cpn.costPoints;
        return `
          <div class="p-4 rounded-2xl border border-amber-200/90 bg-gradient-to-r from-amber-50/70 via-white to-amber-50/40 shadow-xs hover-lift transition-all space-y-3 text-xs">
            <div class="flex items-center justify-between">
              <span class="font-black text-slate-900 text-xs">${cpn.title}</span>
              <span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
                ${cpn.badge}
              </span>
            </div>
            <p class="text-slate-600 text-[11px] leading-relaxed">${cpn.description}</p>
            <div class="flex items-center justify-between pt-2.5 border-t border-dashed border-amber-200">
              <span class="text-[11px] text-slate-500 font-medium">Partner: <strong class="text-slate-700">${cpn.partner}</strong></span>
              <div class="flex items-center space-x-2.5">
                <span class="font-black text-amber-900 bg-amber-100 px-2 py-0.5 rounded-lg border border-amber-300 font-mono">${cpn.costPoints} Pts</span>
                <button onclick="redeemVoucher('${cpn.id}')" ${canAfford ? '' : 'disabled'} class="px-3 py-1.5 ${canAfford ? 'bg-amber-600 hover:bg-amber-700 text-white shadow-sm cursor-pointer' : 'bg-slate-200 text-slate-400 cursor-not-allowed'} rounded-xl text-[11px] font-bold transition flex items-center space-x-1">
                  <i data-lucide="tag" class="w-3 h-3"></i>
                  <span>${canAfford ? 'Redeem Voucher' : 'Need More Pts'}</span>
                </button>
              </div>
            </div>
          </div>
        `;
      }).join('');
      if (window.lucide) lucide.createIcons();
    }
  } catch (err) {
    console.error('Error loading rewards:', err);
  }
}

async function redeemVoucher(couponId) {
  try {
    const res = await API.redeemReward(couponId);
    if (res.success) {
      document.getElementById('voucher-modal-title').textContent = res.coupon.title;
      document.getElementById('voucher-modal-code').textContent = res.voucherCode;
      openModal('voucher-success-modal');
      showToast(`Voucher claimed: ${res.voucherCode}`, 'success');
      await loadRewardsView();
      await loadDashboardView();
    } else {
      showToast(res.error || 'Failed to redeem coupon', 'error');
    }
  } catch (err) {
    showToast('Redemption transaction failed', 'error');
  }
}

// ================= VIEW: ADMIN PORTAL =================
async function loadAdminView() {
  await renderAdminComplaintsTable();
  await loadAdminAuditLog();
}

async function renderAdminComplaintsTable() {
  const statusFilter = document.getElementById('admin-filter-status').value;
  const typeFilter = document.getElementById('admin-filter-type').value;

  try {
    const res = await API.getComplaints({ status: statusFilter, issueType: typeFilter });
    if (res.success) {
      const complaints = res.data;
      const tbody = document.getElementById('admin-table-body');
      if (complaints.length === 0) {
        tbody.innerHTML = `<tr><td colspan="7" class="text-center py-6 text-slate-400 italic">No complaint reports match filter criteria.</td></tr>`;
        return;
      }
      tbody.innerHTML = complaints.map(c => `
        <tr class="hover:bg-slate-50 transition">
          <td class="px-4 py-3 font-extrabold text-slate-900 font-mono">${c.id}</td>
          <td class="px-4 py-3 font-semibold text-slate-800">${c.issueTypeName || c.issueType}</td>
          <td class="px-4 py-3 text-slate-600 max-w-xs truncate">${c.address}</td>
          <td class="px-4 py-3"><span class="px-2 py-0.5 rounded text-[10px] font-bold ${getSeverityBadgeClass(c.severity)}">${c.severity.toUpperCase()}</span></td>
          <td class="px-4 py-3 text-slate-400">${new Date(c.createdAt).toLocaleDateString()}</td>
          <td class="px-4 py-3"><span class="px-2.5 py-0.5 rounded text-[11px] font-bold ${getStatusBadgeClass(c.status)}">${c.status}</span></td>
          <td class="px-4 py-3 text-right space-x-1">
            <button onclick="openAdminUpdateModal('${c.id}')" class="px-2.5 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded text-[11px] font-bold transition">
              Update Status
            </button>
            ${c.status !== 'Resolved' ? `
              <button onclick="quickResolveComplaint('${c.id}')" class="px-2 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 rounded text-[11px] font-bold transition" title="1-Click Demo Resolve">
                ✓ Resolve
              </button>
            ` : ''}
          </td>
        </tr>
      `).join('');
    }
  } catch (err) {
    console.error('Error rendering admin table:', err);
  }
}

async function quickResolveComplaint(ticketId) {
  try {
    const res = await API.updateComplaintStatus(ticketId, {
      status: 'Resolved',
      assignedWorkerGroup: 'Central Zone Rapid Action Crew #1',
      resolutionNote: 'Spot thoroughly cleaned, waste cleared, and public surface disinfected.',
      afterPhotoUrl: 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?auto=format&fit=crop&w=600&q=80'
    });
    if (res.success) {
      showToast(`Ticket ${ticketId} resolved with verification proof!`, 'success');
      await renderAdminComplaintsTable();
      await loadAdminAuditLog();
      await loadDashboardView();
    }
  } catch (err) {
    showToast('Failed to quick-resolve ticket', 'error');
  }
}

async function loadAdminAuditLog() {
  try {
    const res = await API.getAuditLog();
    if (res.success) {
      const logs = res.data;
      const auditContainer = document.getElementById('admin-audit-list');
      if (logs.length === 0) {
        auditContainer.innerHTML = `<div class="text-slate-400 italic py-2">No administrative activity recorded yet.</div>`;
        return;
      }
      auditContainer.innerHTML = logs.map(l => `
        <div class="p-2.5 bg-slate-50 rounded-lg border border-slate-200 flex items-start justify-between">
          <div class="space-y-0.5">
            <div class="font-bold text-slate-800"><span class="text-purple-700 font-mono">${l.complaintId}</span>: ${l.oldStatus} &rarr; <span class="text-brand-700">${l.newStatus}</span></div>
            <div class="text-slate-600">${l.note}</div>
            <div class="text-[10px] text-slate-400">Actor: ${l.actorLabel}</div>
          </div>
          <span class="text-[10px] text-slate-400 shrink-0">${new Date(l.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
        </div>
      `).join('');
    }
  } catch (err) {
    console.error('Error loading audit log:', err);
  }
}

async function openAdminUpdateModal(ticketId) {
  const res = await API.getComplaintById(ticketId);
  if (!res.success) return;
  const c = res.data;

  document.getElementById('admin-update-ticket-id').value = c.id;
  document.getElementById('admin-modal-ticket-id').textContent = `Ticket: ${c.id} (${c.issueTypeName || c.issueType})`;
  document.getElementById('admin-new-status').value = c.status;
  document.getElementById('admin-assign-squad').value = c.assignedWorkerGroup || 'Central Zone Rapid Action Crew #1';
  document.getElementById('admin-note').value = c.resolutionNote || '';
  
  openModal('admin-update-modal');
}

async function handleAdminStatusSubmit(e) {
  e.preventDefault();
  const ticketId = document.getElementById('admin-update-ticket-id').value;
  const newStatus = document.getElementById('admin-new-status').value;
  const assignedWorkerGroup = document.getElementById('admin-assign-squad').value;
  const resolutionNote = document.getElementById('admin-note').value;
  const afterPhotoUrl = document.getElementById('admin-after-photo-select').value;

  try {
    const res = await API.updateComplaintStatus(ticketId, {
      status: newStatus,
      assignedWorkerGroup,
      resolutionNote,
      afterPhotoUrl: afterPhotoUrl || null
    });

    if (res.success) {
      closeModal('admin-update-modal');
      await loadAdminView();
      await loadDashboardView();
      showToast(`Status updated: ${ticketId} &rarr; ${newStatus}`, 'success');
    }
  } catch (err) {
    showToast('Failed to update status', 'error');
  }
}

// ================= MODAL HELPERS =================
function openModal(id) {
  const modal = document.getElementById(id);
  if (modal) {
    modal.classList.remove('hidden');
    modal.classList.add('flex');
    if (window.lucide) lucide.createIcons();
  }
}

function closeModal(id) {
  const modal = document.getElementById(id);
  if (modal) {
    modal.classList.add('hidden');
    modal.classList.remove('flex');
  }
}

// Reset Demo Data
async function resetDemoData() {
  if (confirm('Reset prototype state to initial demo seed dataset?')) {
    await API.resetDemoData();
    await navigateTo(currentView);
    showToast('Database reset to pristine seed state', 'info');
  }
}

// Helpers for badges
function getStatusBadgeClass(status) {
  switch (status) {
    case 'Submitted': return 'badge-status-submitted';
    case 'Under Review': return 'badge-status-under-review';
    case 'Assigned': return 'badge-status-assigned';
    case 'Cleaning In Progress': return 'badge-status-cleaning-in-progress';
    case 'Resolved': return 'badge-status-resolved';
    case 'Reopened': return 'badge-status-reopened';
    default: return 'bg-slate-100 text-slate-700';
  }
}

function getSeverityBadgeClass(sev) {
  switch (sev) {
    case 'high': return 'badge-sev-high';
    case 'medium': return 'badge-sev-medium';
    case 'low': return 'badge-sev-low';
    default: return 'badge-sev-medium';
  }
}
