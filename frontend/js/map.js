/**
 * Interactive Leaflet Map Integration for Smart Waste Management
 * Includes Dashboard Cleanliness Heatmap & Report GPS Location Picker
 */

let dashMap = null;
let reportMap = null;
let reportMarker = null;
let dashMarkersLayer = null;
let reportLandmarksLayer = null;

// Default map center (Central Mumbai / Kurla-Chembur civic zone)
const DEFAULT_COORDS = [19.0680, 72.8800];

// Prominent municipal landmarks for quick reporting
const REPORT_LANDMARKS = [
  {
    name: "Kurla Railway Station (West Exit)",
    shortName: "Kurla Station",
    lat: 19.0657,
    lng: 72.8794,
    address: "Station Road, Kurla West",
    icon: "train"
  },
  {
    name: "Vivekanand College (Main Gate)",
    shortName: "Vivekanand College",
    lat: 19.0553,
    lng: 72.8893,
    address: "Sindhi Society, Chembur",
    icon: "graduation-cap"
  },
  {
    name: "Phoenix Marketcity Kurla",
    shortName: "Phoenix Marketcity",
    lat: 19.0863,
    lng: 72.8890,
    address: "LBS Marg, Kurla West",
    icon: "shopping-bag"
  },
  {
    name: "Chembur Railway Station",
    shortName: "Chembur Station",
    lat: 19.0622,
    lng: 72.8997,
    address: "Station Road, Chembur East",
    icon: "train"
  },
  {
    name: "Kurla BEST Bus Depot",
    shortName: "Kurla Bus Depot",
    lat: 19.0601,
    lng: 72.8812,
    address: "Nehru Nagar, Kurla East",
    icon: "bus"
  },
  {
    name: "Diamond Garden",
    shortName: "Diamond Garden",
    lat: 19.0526,
    lng: 72.9004,
    address: "Central Avenue, Chembur",
    icon: "trees"
  },
  {
    name: "BKC Connector Junction",
    shortName: "BKC Connector",
    lat: 19.0668,
    lng: 72.8682,
    address: "Near MTNL, Bandra-Kurla Complex",
    icon: "navigation"
  },
  {
    name: "Nehru Nagar Sports Ground",
    shortName: "Nehru Nagar Ground",
    lat: 19.0634,
    lng: 72.8845,
    address: "Near Mother Dairy, Kurla East",
    icon: "flag"
  }
];

/**
 * Initialize Dashboard Cleanliness Map
 */
function initDashboardMap(complaints = []) {
  const mapElement = document.getElementById('dashboard-map');
  if (!mapElement) return;

  if (!dashMap) {
    try {
      dashMap = L.map('dashboard-map', {
        zoomControl: true,
        scrollWheelZoom: true
      }).setView(DEFAULT_COORDS, 13);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
        maxZoom: 19
      }).addTo(dashMap);

      dashMarkersLayer = L.layerGroup().addTo(dashMap);
    } catch (err) {
      console.warn('Leaflet initialization warning:', err);
    }
  }

  // Force size recalculation to handle CSS transitions
  [50, 150, 300, 600].forEach(delay => {
    setTimeout(() => {
      if (dashMap) dashMap.invalidateSize();
    }, delay);
  });

  updateDashboardMapPins(complaints);
}

/**
 * Update Dashboard Hotspot & Complaint Pins
 */
function updateDashboardMapPins(complaints = []) {
  if (!dashMap || !dashMarkersLayer) return;
  dashMarkersLayer.clearLayers();

  // If no live complaints provided, use default verified hotspots
  const listToRender = (complaints && complaints.length > 0) ? complaints : [
    {
      id: "TKT-2026-0101",
      issueTypeName: "Roadside Dumping",
      address: "Cross Road 4, Near Green Park Bus Stop",
      latitude: 19.0760,
      longitude: 72.8777,
      status: "Cleaning In Progress",
      severity: "high"
    },
    {
      id: "TKT-2026-0102",
      issueTypeName: "Overflowing Public Bin",
      address: "Corner of Market Street & Library Road",
      latitude: 19.0820,
      longitude: 72.8850,
      status: "Resolved",
      severity: "medium"
    },
    {
      id: "TKT-2026-0103",
      issueTypeName: "Missed Door-to-Door Collection",
      address: "Silver Birch Apartments, Lane 3",
      latitude: 19.0710,
      longitude: 72.8715,
      status: "Assigned",
      severity: "low"
    },
    {
      id: "TKT-2026-0104",
      issueTypeName: "Hazardous Chemical Spillage",
      address: "Industrial Link Road, Plot 14-B",
      latitude: 19.0680,
      longitude: 72.8920,
      status: "Submitted",
      severity: "high"
    }
  ];

  listToRender.forEach(item => {
    if (!item.latitude || !item.longitude) return;

    let markerColor = '#f59e0b'; // amber medium
    if (item.status === 'Resolved') markerColor = '#10b981'; // green
    else if (item.severity === 'high') markerColor = '#ef4444'; // red
    else if (item.status === 'Assigned') markerColor = '#8b5cf6'; // purple

    const customIcon = L.divIcon({
      className: 'custom-map-pin',
      html: `<div style="background-color: ${markerColor}; width: 14px; height: 14px; border: 2.5px solid white; border-radius: 50%; box-shadow: 0 0 8px rgba(0,0,0,0.45); cursor: pointer; transition: transform 0.2s;" onmouseover="this.style.transform='scale(1.4)'" onmouseout="this.style.transform='scale(1)'"></div>`,
      iconSize: [14, 14],
      iconAnchor: [7, 7]
    });

    const marker = L.marker([item.latitude, item.longitude], { icon: customIcon });

    const popupHtml = `
      <div style="font-family: inherit; font-size: 12px; min-width: 180px; padding: 2px;">
        <div style="font-weight: 800; color: #0f172a; margin-bottom: 2px;">${item.id}</div>
        <div style="color: #047857; font-weight: 700; margin-bottom: 3px;">${item.issueTypeName || item.issueType}</div>
        <div style="color: #475569; font-size: 11px; margin-bottom: 6px; line-height: 1.3;">${item.address}</div>
        <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid #f1f5f9; padding-top: 4px;">
          <span style="font-size: 10px; font-weight: 700; padding: 2px 6px; border-radius: 4px; background: #f8fafc; color: #334155; border: 1px solid #e2e8f0;">${item.status}</span>
          <button onclick="viewComplaintDetail('${item.id}')" style="font-size: 10px; color: #10b981; font-weight: 800; text-decoration: underline; background: none; border: none; cursor: pointer;">Inspect &rarr;</button>
        </div>
      </div>
    `;

    marker.bindPopup(popupHtml);
    dashMarkersLayer.addLayer(marker);
  });
}

/**
 * Initialize Report Garbage GPS Picker Map with Landmark Hotspots
 */
function initReportMap(onLocationPicked) {
  const mapElement = document.getElementById('report-map');
  if (!mapElement) return;

  if (!reportMap) {
    reportMap = L.map('report-map', {
      zoomControl: true,
      scrollWheelZoom: true
    }).setView(DEFAULT_COORDS, 13);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap',
      maxZoom: 19
    }).addTo(reportMap);

    reportLandmarksLayer = L.layerGroup().addTo(reportMap);

    // Add prominent clickable landmark markers onto the report map
    REPORT_LANDMARKS.forEach(lm => {
      const landmarkIcon = L.divIcon({
        className: 'landmark-map-pin',
        html: `
          <div style="display: flex; align-items: center; background: white; border: 1.5px solid #10b981; border-radius: 6px; padding: 2px 6px; box-shadow: 0 2px 6px rgba(0,0,0,0.18); font-size: 10px; font-weight: 800; color: #047857; white-space: nowrap; cursor: pointer; transform: translate(-50%, -50%);">
            <span style="width: 7px; height: 7px; border-radius: 50%; background: #10b981; margin-right: 4px; display: inline-block;"></span>
            ${lm.shortName}
          </div>
        `,
        iconSize: [0, 0]
      });

      const lmMarker = L.marker([lm.lat, lm.lng], { icon: landmarkIcon }).addTo(reportLandmarksLayer);
      lmMarker.on('click', () => {
        setQuickLandmark(lm.name, lm.lat, lm.lng, lm.address);
      });
    });

    // Tap anywhere on map to reposition custom pin
    reportMap.on('click', function(e) {
      const lat = parseFloat(e.latlng.lat.toFixed(5));
      const lng = parseFloat(e.latlng.lng.toFixed(5));
      setReportMapMarker(lat, lng);
      if (typeof onLocationPicked === 'function') {
        onLocationPicked(lat, lng);
      }
    });
  }

  [50, 150, 300, 600].forEach(delay => {
    setTimeout(() => {
      if (reportMap) reportMap.invalidateSize();
    }, delay);
  });
}

/**
 * Position Marker on Report Map
 */
function setReportMapMarker(lat, lng) {
  if (!reportMap) return;
  if (reportMarker) {
    reportMarker.setLatLng([lat, lng]);
  } else {
    const pinIcon = L.divIcon({
      className: 'active-report-pin',
      html: `<div style="background-color: #ef4444; width: 18px; height: 18px; border: 3px solid white; border-radius: 50%; box-shadow: 0 0 10px rgba(239,68,68,0.7); animation: pulse 1.5s infinite;"></div>`,
      iconSize: [18, 18],
      iconAnchor: [9, 9]
    });

    reportMarker = L.marker([lat, lng], { draggable: true, icon: pinIcon }).addTo(reportMap);
    reportMarker.on('dragend', function(e) {
      const pos = e.target.getLatLng();
      const newLat = parseFloat(pos.lat.toFixed(5));
      const newLng = parseFloat(pos.lng.toFixed(5));
      const latInput = document.getElementById('report-lat');
      const lngInput = document.getElementById('report-lng');
      const coordsText = document.getElementById('report-coords-text');
      if (latInput) latInput.value = newLat;
      if (lngInput) lngInput.value = newLng;
      if (coordsText) coordsText.textContent = `${newLat}, ${newLng}`;
    });
  }
  reportMap.panTo([lat, lng]);
}
