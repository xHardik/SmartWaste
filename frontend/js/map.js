/**
 * Interactive Leaflet Map Integration for Smart Waste Management
 */

let dashMap = null;
let reportMap = null;
let reportMarker = null;
let dashMarkersLayer = null;

const DEFAULT_COORDS = [19.0760, 72.8777]; // Metro Hub default center

function initDashboardMap(complaints = []) {
  const mapElement = document.getElementById('dashboard-map');
  if (!mapElement) return;

  if (!dashMap) {
    dashMap = L.map('dashboard-map').setView(DEFAULT_COORDS, 13);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(dashMap);
    dashMarkersLayer = L.layerGroup().addTo(dashMap);
  }

  updateDashboardMapPins(complaints);
}

function updateDashboardMapPins(complaints = []) {
  if (!dashMap || !dashMarkersLayer) return;
  dashMarkersLayer.clearLayers();

  complaints.forEach(item => {
    if (!item.latitude || !item.longitude) return;

    let markerColor = '#f59e0b'; // amber medium
    if (item.status === 'Resolved') markerColor = '#16a34a'; // green
    else if (item.severity === 'high') markerColor = '#dc2626'; // red

    const customIcon = L.divIcon({
      className: 'custom-map-pin',
      html: `<div style="background-color: ${markerColor}; width: 14px; height: 14px; border: 2.5px solid white; border-radius: 50%; box-shadow: 0 0 8px rgba(0,0,0,0.4);"></div>`,
      iconSize: [14, 14],
      iconAnchor: [7, 7]
    });

    const marker = L.marker([item.latitude, item.longitude], { icon: customIcon });

    const popupHtml = `
      <div style="font-family: inherit; font-size: 12px; min-width: 170px;">
        <div style="font-weight: 700; color: #0f172a; margin-bottom: 2px;">${item.id}</div>
        <div style="color: #475569; font-weight: 600; margin-bottom: 4px;">${item.issueTypeName || item.issueType}</div>
        <div style="color: #64748b; font-size: 11px; margin-bottom: 6px;">${item.address}</div>
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <span style="font-size: 10px; font-weight: 700; padding: 2px 6px; border-radius: 4px; background: #f1f5f9; color: #334155;">${item.status}</span>
          <button onclick="viewComplaintDetail('${item.id}')" style="font-size: 10px; color: #16a34a; font-weight: 700; text-decoration: underline; background: none; border: none; cursor: pointer;">Inspect Details</button>
        </div>
      </div>
    `;

    marker.bindPopup(popupHtml);
    dashMarkersLayer.addLayer(marker);
  });
}

function initReportMap(onLocationPicked) {
  const mapElement = document.getElementById('report-map');
  if (!mapElement) return;

  if (!reportMap) {
    reportMap = L.map('report-map').setView(DEFAULT_COORDS, 14);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap'
    }).addTo(reportMap);

    reportMap.on('click', function(e) {
      const lat = e.latlng.lat.toFixed(5);
      const lng = e.latlng.lng.toFixed(5);
      setReportMapMarker(lat, lng);
      if (typeof onLocationPicked === 'function') {
        onLocationPicked(lat, lng);
      }
    });
  }

  setTimeout(() => {
    reportMap.invalidateSize();
  }, 200);
}

function setReportMapMarker(lat, lng) {
  if (!reportMap) return;
  if (reportMarker) {
    reportMarker.setLatLng([lat, lng]);
  } else {
    reportMarker = L.marker([lat, lng], { draggable: true }).addTo(reportMap);
    reportMarker.on('dragend', function(e) {
      const pos = e.target.getLatLng();
      const newLat = pos.lat.toFixed(5);
      const newLng = pos.lng.toFixed(5);
      const latInput = document.getElementById('report-lat');
      const lngInput = document.getElementById('report-lng');
      if (latInput) latInput.value = newLat;
      if (lngInput) lngInput.value = newLng;
    });
  }
  reportMap.panTo([lat, lng]);
}
