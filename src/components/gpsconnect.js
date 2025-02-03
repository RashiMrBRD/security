// GPS location handling and connection
class GPSService {
  constructor() {
    this.serviceUrl = window.location.hostname === 'localhost' 
      ? 'http://localhost:3000' 
      : 'https://gpsconnect.rashlink.eu.org';
    this.deviceLocation = null;
    this.connectionStatus = 'disconnected';
    this.lastUpdate = null;
    this.retryAttempts = 0;
    this.maxRetries = 3;
    this.updateInterval = null;
    this.locationHistory = [];
    this.map = null;
    this.markers = [];
  }

  // Initialize GPS detection and dashboard
  async init() {
    try {
      await this.initializeDashboard();
      await this.loadLocationHistory();
      this.startPeriodicUpdates();
    } catch (error) {
      console.error('Failed to initialize GPS service:', error);
      this.showError('Initialization failed');
    }
  }

  // Initialize dashboard
  async initializeDashboard() {
    // Create dashboard container
    const dashboard = document.createElement('div');
    dashboard.className = 'dashboard-container';
    dashboard.innerHTML = `
      <div class="dashboard-header">
        <h1>🎯 Target Tracking System</h1>
        <div class="dashboard-controls">
          <button id="refresh-btn" class="control-btn">🔄 Refresh</button>
          <button id="follow-btn" class="control-btn">👁 Auto-Follow</button>
          <button id="export-btn" class="control-btn">📥 Export Data</button>
          <div class="search-box">
            <input type="text" id="search-input" placeholder="Search targets...">
          </div>
        </div>
        <div class="dashboard-status">
          <span id="connection-status">Status: Initializing...</span>
          <span id="last-update">Last Update: Never</span>
          <span id="targets-count">Targets: 0</span>
        </div>
      </div>
      
      <div class="dashboard-grid">
        <div class="map-section">
          <div class="card map-card">
            <div class="card-header">
              <h2>Live Tracking Map</h2>
              <div class="map-controls">
                <button id="cluster-btn" class="map-btn">Toggle Clustering</button>
                <button id="heatmap-btn" class="map-btn">Toggle Heatmap</button>
                <select id="map-style">
                  <option value="street">Street View</option>
                  <option value="satellite">Satellite</option>
                  <option value="dark">Dark Mode</option>
                </select>
              </div>
            </div>
            <div id="map"></div>
          </div>
        </div>
        
        <div class="info-section">
          <div class="card">
            <div class="card-header">
              <h2>Target Analysis</h2>
              <div class="card-controls">
                <button id="analyze-btn" class="control-btn">🔍 Analyze</button>
              </div>
            </div>
            <div id="target-info">
              <div class="stats-grid">
                <div class="stat-box">
                  <h3>Active Targets</h3>
                  <span id="active-targets">0</span>
                </div>
                <div class="stat-box">
                  <h3>Total Detections</h3>
                  <span id="total-detections">0</span>
                </div>
                <div class="stat-box">
                  <h3>Average Accuracy</h3>
                  <span id="avg-accuracy">0m</span>
                </div>
                <div class="stat-box">
                  <h3>Coverage Area</h3>
                  <span id="coverage-area">0 km²</span>
                </div>
              </div>
              <div id="device-info" class="detail-section">
                <h3>Latest Target Details</h3>
                <div class="info-content">Waiting for data...</div>
              </div>
            </div>
          </div>
          
          <div class="card">
            <div class="card-header">
              <h2>Detection History</h2>
              <div class="card-controls">
                <select id="history-filter">
                  <option value="all">All Detections</option>
                  <option value="today">Today</option>
                  <option value="week">This Week</option>
                  <option value="month">This Month</option>
                </select>
                <button id="clear-history" class="control-btn">🗑️ Clear</button>
              </div>
            </div>
            <div id="history-list" class="history-list"></div>
          </div>
        </div>
      </div>
    `;

    // Add dashboard styles
    const style = document.createElement('style');
    style.textContent = `
      .dashboard-container {
        padding: 20px;
        max-width: 1400px;
        margin: 0 auto;
        font-family: Arial, sans-serif;
        background: #1a1a1a;
        color: #fff;
      }

      .dashboard-header {
        background: #2a2a2a;
        padding: 20px;
        border-radius: 10px;
        margin-bottom: 20px;
      }

      .dashboard-controls {
        display: flex;
        gap: 10px;
        margin: 15px 0;
      }

      .control-btn {
        background: #3a3a3a;
        border: none;
        color: #fff;
        padding: 8px 15px;
        border-radius: 5px;
        cursor: pointer;
        transition: background 0.2s;
      }

      .control-btn:hover {
        background: #4a4a4a;
      }

      .search-box {
        flex: 1;
        max-width: 300px;
      }

      .search-box input {
        width: 100%;
        padding: 8px;
        border: none;
        border-radius: 5px;
        background: #3a3a3a;
        color: #fff;
      }

      .dashboard-grid {
        display: grid;
        grid-template-columns: 1fr 400px;
        gap: 20px;
      }

      .card {
        background: #2a2a2a;
        border-radius: 10px;
        padding: 20px;
        margin-bottom: 20px;
      }

      .card-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 15px;
      }

      .map-controls {
        display: flex;
        gap: 10px;
      }

      .map-btn {
        background: #3a3a3a;
        border: none;
        color: #fff;
        padding: 5px 10px;
        border-radius: 3px;
        cursor: pointer;
      }

      #map {
        height: 600px;
        border-radius: 5px;
        background: #3a3a3a;
      }

      .stats-grid {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 15px;
        margin-bottom: 20px;
      }

      .stat-box {
        background: #3a3a3a;
        padding: 15px;
        border-radius: 5px;
        text-align: center;
      }

      .stat-box h3 {
        margin: 0;
        font-size: 14px;
        color: #aaa;
      }

      .stat-box span {
        font-size: 24px;
        font-weight: bold;
        color: #fff;
      }

      .detail-section {
        background: #3a3a3a;
        padding: 15px;
        border-radius: 5px;
        margin-top: 15px;
      }

      .history-list {
        max-height: 400px;
        overflow-y: auto;
      }

      .history-item {
        padding: 10px;
        border-bottom: 1px solid #3a3a3a;
        cursor: pointer;
        transition: background 0.2s;
      }

      .history-item:hover {
        background: #3a3a3a;
      }

      .history-item .time {
        color: #aaa;
        font-size: 12px;
      }

      @media (max-width: 1200px) {
        .dashboard-grid {
          grid-template-columns: 1fr;
        }
        
        #map {
          height: 400px;
        }
      }
    `;

    // Add dashboard to page
    document.head.appendChild(style);
    document.getElementById('app').appendChild(dashboard);

    // Initialize map
    this.map = L.map('map').setView([0, 0], 2);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(this.map);

    // Initialize event listeners
    this.initializeEventListeners();
  }

  initializeEventListeners() {
    // Refresh button
    document.getElementById('refresh-btn').onclick = () => this.loadLocationHistory();

    // Auto-follow toggle
    let autoFollow = false;
    document.getElementById('follow-btn').onclick = (e) => {
      autoFollow = !autoFollow;
      e.target.style.background = autoFollow ? '#4CAF50' : '#3a3a3a';
      if (autoFollow && this.locationHistory.length > 0) {
        const latest = this.locationHistory[this.locationHistory.length - 1];
        this.map.setView([latest.latitude, latest.longitude], 13);
      }
    };

    // Export data
    document.getElementById('export-btn').onclick = () => {
      const data = JSON.stringify(this.locationHistory, null, 2);
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `location_history_${new Date().toISOString()}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    };

    // Search functionality
    const searchInput = document.getElementById('search-input');
    searchInput.onkeyup = () => {
      const query = searchInput.value.toLowerCase();
      const items = document.querySelectorAll('.history-item');
      items.forEach(item => {
        const text = item.textContent.toLowerCase();
        item.style.display = text.includes(query) ? '' : 'none';
      });
    };

    // Map style selector
    document.getElementById('map-style').onchange = (e) => {
      const style = e.target.value;
      if (style === 'dark') {
        this.map.removeLayer(this.tileLayer);
        this.tileLayer = L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png').addTo(this.map);
      } else if (style === 'satellite') {
        this.map.removeLayer(this.tileLayer);
        this.tileLayer = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}').addTo(this.map);
      } else {
        this.map.removeLayer(this.tileLayer);
        this.tileLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(this.map);
      }
    };

    // History filter
    document.getElementById('history-filter').onchange = () => this.updateHistoryList();

    // Clear history
    document.getElementById('clear-history').onclick = () => {
      if (confirm('Are you sure you want to clear the history? This cannot be undone.')) {
        this.locationHistory = [];
        this.updateMap();
        this.updateHistoryList();
        this.updateDeviceInfo();
      }
    };
  }

  // Load location history
  async loadLocationHistory() {
    try {
      const response = await fetch('/history');
      if (!response.ok) throw new Error('Failed to fetch location history');
      
      this.locationHistory = await response.json();
      
      if (this.locationHistory.length > 0) {
        // Update map with new locations
        this.updateMap();
        this.updateHistoryList();
        this.updateDeviceInfo();
        
        // Update last update time
        this.lastUpdate = new Date();
        this.updateLastUpdateTime();
        
        // Update connection status
        const status = document.getElementById('connection-status');
        status.textContent = 'Status: Connected';
        status.style.color = 'green';
      }
    } catch (error) {
      console.error('Error loading location history:', error);
      this.showError('Failed to load location history');
    }
  }

  // Update history display
  updateHistoryDisplay() {
    const historyList = document.getElementById('history-list');
    if (!historyList) return;

    historyList.innerHTML = this.locationHistory
      .map((location, index) => `
        <div class="history-item" onclick="gpsService.focusLocation(${index})">
          <strong>${location.city}, ${location.state}, ${location.country}</strong>
          <br>
          <small>
            Lat: ${location.latitude.toFixed(4)}, 
            Lon: ${location.longitude.toFixed(4)}
            <br>
            ${new Date(location.timestamp).toLocaleString()}
          </small>
        </div>
      `)
      .join('');
  }

  // Update map with markers
  updateMap() {
    if (!this.map) return;

    // Clear existing markers
    this.markers.forEach(marker => this.map.removeLayer(marker));
    this.markers = [];

    // Add new markers for each location
    this.locationHistory.forEach((location, index) => {
      if (!location.latitude || !location.longitude) return;

      const marker = L.marker([location.latitude, location.longitude])
        .bindPopup(`
          <div class="popup-content">
            <h3>Location Details</h3>
            <p>Time: ${new Date(location.timestamp).toLocaleString()}</p>
            <p>Coordinates: ${location.latitude}, ${location.longitude}</p>
            <p>Accuracy: ${location.accuracy}m</p>
            <p>City: ${location.city || 'Unknown'}</p>
            <p>IP: ${location.ip || 'Unknown'}</p>
          </div>
        `);

      marker.addTo(this.map);
      this.markers.push(marker);

      // If this is the latest location, center map and open popup
      if (index === this.locationHistory.length - 1) {
        this.map.setView([location.latitude, location.longitude], 13);
        marker.openPopup();
      }
    });
  }

  // Focus on a specific location
  focusLocation(index) {
    const location = this.locationHistory[index];
    if (location && this.map) {
      this.map.setView([location.latitude, location.longitude], 13);
      this.markers[index].openPopup();
    }
  }

  // Start dashboard updates
  startDashboardUpdates() {
    setInterval(() => {
      this.loadLocationHistory();
      this.updateAttackerInfo();
    }, 10000); // Update every 10 seconds
  }

  // Update attacker information
  async updateAttackerInfo() {
    const attackerDetails = document.getElementById('attacker-details');
    if (!attackerDetails || this.locationHistory.length === 0) return;

    const latest = this.locationHistory[this.locationHistory.length - 1];
    
    attackerDetails.innerHTML = `
      <div class="attacker-card">
        <h3>Latest Detection</h3>
        <p><strong>Location:</strong> ${latest.city}, ${latest.state}, ${latest.country}</p>
        <p><strong>Coordinates:</strong> ${latest.latitude.toFixed(6)}, ${latest.longitude.toFixed(6)}</p>
        <p><strong>Accuracy:</strong> ${latest.accuracy || 'Unknown'}</p>
        <p><strong>Detected:</strong> ${new Date(latest.timestamp).toLocaleString()}</p>
        <p><strong>Device Info:</strong></p>
        <ul>
          <li>Platform: ${latest.platform || 'Unknown'}</li>
          <li>Browser: ${latest.userAgent || 'Unknown'}</li>
          <li>Language: ${latest.language || 'Unknown'}</li>
        </ul>
      </div>
    `;
  }

  // Fetch with timeout
  async fetchWithTimeout(url, options = {}, timeout = 5000) {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);
    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal
      });
      clearTimeout(id);
      return response;
    } catch (error) {
      clearTimeout(id);
      throw error;
    }
  }

  // Handle init response
  handleInitResponse(data) {
    if (data.location) {
      this.deviceLocation = {
        ...data.location,
        timestamp: new Date().toISOString(),
        accuracy: data.accuracy || 'medium',
        source: 'GPS'
      };
      this.connectionStatus = 'connected';
      this.lastUpdate = new Date();
      this.updateLocationDisplay();
      this.dispatchLocationEvent();
    }
  }

  // Start periodic updates
  startPeriodicUpdates() {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
    }
    this.updateInterval = setInterval(() => this.updateLocation(), 30000); // Update every 30 seconds
  }

  // Update location
  async updateLocation() {
    try {
      const response = await this.fetchWithTimeout(`${this.serviceUrl}/location`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'X-Last-Update': this.lastUpdate?.toISOString() || 'never'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to get location update');
      }

      const data = await response.json();
      if (data.location) {
        const previousLocation = this.deviceLocation;
        this.deviceLocation = {
          ...data.location,
          timestamp: new Date().toISOString(),
          accuracy: data.accuracy || 'medium',
          source: 'GPS'
        };
        this.lastUpdate = new Date();
        this.updateLocationDisplay();
        
        // Check if location has changed significantly
        if (this.hasLocationChanged(previousLocation, this.deviceLocation)) {
          this.dispatchLocationEvent();
        }
      }
    } catch (error) {
      this.handleError(error);
    }
  }

  // Check if location has changed significantly
  hasLocationChanged(prev, current) {
    if (!prev || !current) return true;
    const threshold = 0.0001; // Approximately 11 meters
    return Math.abs(prev.latitude - current.latitude) > threshold ||
           Math.abs(prev.longitude - current.longitude) > threshold;
  }

  // Handle errors
  handleError(error) {
    console.error('GPS service error:', error);
    this.connectionStatus = 'error';
    this.retryAttempts++;
    
    if (this.retryAttempts <= this.maxRetries) {
      const delay = Math.min(1000 * Math.pow(2, this.retryAttempts), 30000);
      setTimeout(() => this.init(), delay);
    }
    
    const locationInfo = document.getElementById('location-info');
    if (locationInfo) {
      locationInfo.textContent = `Location error: ${error.message}`;
      locationInfo.style.color = '#ff0000';
    }
    
    return {
      error: true,
      message: error.message,
      retryAttempt: this.retryAttempts,
      nextRetry: this.retryAttempts <= this.maxRetries ? 'scheduled' : 'max-reached'
    };
  }

  // Dispatch location event
  dispatchLocationEvent() {
    window.dispatchEvent(new CustomEvent('locationupdate', {
      detail: {
        location: this.deviceLocation,
        timestamp: new Date().toISOString(),
        status: this.connectionStatus
      }
    }));
  }

  // Update location display
  updateLocationDisplay() {
    const locationInfo = document.getElementById('location-info');
    if (locationInfo && this.deviceLocation) {
      const { city, state, country } = this.deviceLocation;
      locationInfo.textContent = `${city}, ${state}, ${country}`;
      locationInfo.style.color = ''; // Reset color
      window.deviceLocation = this.deviceLocation;
    }
  }

  // Get location data
  getLocationData() {
    return {
      ...this.deviceLocation,
      connectionStatus: this.connectionStatus,
      lastUpdate: this.lastUpdate?.toISOString(),
      accuracy: this.deviceLocation?.accuracy || 'unknown'
    };
  }

  // Generate Google Maps link
  generateMapsLink(location = this.deviceLocation) {
    if (!location) return '#';
    const { latitude, longitude } = location;
    if (!latitude || !longitude) return '#';
    return `https://www.google.com/maps?q=${latitude},${longitude}`;
  }

  // Format location string
  formatLocationString(location = this.deviceLocation) {
    if (!location) return 'Location unavailable';
    const { city, state, country } = location;
    return `${city}, ${state}, ${country}`;
  }

  // Generate location HTML
  generateLocationHTML(locationData) {
    if (!locationData) return '';
    
    const googleMapsLink = locationData.source === 'GPS' ? 
      this.generateMapsLink(locationData) : 
      `https://www.google.com/maps?q=${locationData.latitude},${locationData.longitude}`;

    const accuracy = locationData.accuracy ? 
      `<p><strong>Accuracy:</strong> ${locationData.accuracy}</p>` : '';
    const lastUpdate = locationData.timestamp ? 
      `<p><small>Last updated: ${new Date(locationData.timestamp).toLocaleString()}</small></p>` : '';

    return `
      <div style="margin-top: 20px; padding: 15px; background: #f8f8f8; border-radius: 5px;">
        <h3 style="color: #ff0000;">📍 Location Details</h3>
        ${accuracy}
        ${lastUpdate}
        <p style="margin-top: 10px;">
          <a href="${googleMapsLink}" style="background: #ff0000; color: white; padding: 8px 15px; text-decoration: none; border-radius: 3px; display: inline-block;">
            🗺️ View on Google Maps (${locationData.source === 'GPS' ? 'GPS' : (locationData.latitude && locationData.longitude ? 'Precise Location' : 'General Area')})
          </a>
        </p>
      </div>
    `;
  }

  // Clean up
  destroy() {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
    }
  }
}

// Export GPS service
const gpsService = new GPSService();
window.gpsService = gpsService; // Make it accessible globally for map interactions
export default gpsService;
