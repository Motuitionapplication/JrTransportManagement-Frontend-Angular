import { Component, OnInit, OnDestroy } from '@angular/core';

interface VehicleLocation {
  vehicleId: string;
  vehiclePlate: string;
  driverName: string;
  latitude: number;
  longitude: number;
  heading: number; // Direction in degrees
  speed: number; // km/h
  status: 'active' | 'idle' | 'offline' | 'maintenance';
  lastUpdate: Date;
  currentBooking?: {
    id: string;
    customerName: string;
    pickup: string;
    destination: string;
    eta: Date;
  };
  batteryLevel?: number; // For electric vehicles
  fuelLevel?: number; // For fuel vehicles
}

interface RouteInfo {
  bookingId: string;
  vehicleId: string;
  waypoints: {
    lat: number;
    lng: number;
    timestamp: Date;
    type: 'pickup' | 'destination' | 'waypoint';
    address?: string;
  }[];
  estimatedDistance: number; // km
  estimatedDuration: number; // minutes
  actualDistance?: number; // km
  actualDuration?: number; // minutes
  status: 'planned' | 'in-progress' | 'completed' | 'cancelled';
}

interface TrackingAlert {
  id: string;
  type: 'speeding' | 'route_deviation' | 'breakdown' | 'emergency' | 'late_arrival' | 'fuel_low' | 'battery_low';
  vehicleId: string;
  vehiclePlate: string;
  driverName: string;
  message: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  timestamp: Date;
  location: { lat: number; lng: number; address: string };
  acknowledged: boolean;
}

interface GeofenceZone {
  id: string;
  name: string;
  type: 'pickup_zone' | 'restricted' | 'service_area' | 'depot';
  coordinates: { lat: number; lng: number }[];
  radius?: number; // For circular zones
  active: boolean;
  alerts: boolean;
}

@Component({
  selector: 'app-tracking',
  templateUrl: './tracking.component.html',
  styleUrls: ['./tracking.component.scss']
})
export class TrackingComponent implements OnInit, OnDestroy {
  vehicles: VehicleLocation[] = [];
  selectedVehicle: VehicleLocation | null = null;
  routes: RouteInfo[] = [];
  selectedRoute: RouteInfo | null = null;
  alerts: TrackingAlert[] = [];
  geofenceZones: GeofenceZone[] = [];

  // Map configuration
  mapCenter = { lat: 19.0760, lng: 72.8777 }; // Mumbai coordinates
  mapZoom = 12;
  mapStyle = 'roadmap'; // roadmap, satellite, hybrid, terrain

  // Filters
  vehicleStatusFilter: string = 'all';
  alertSeverityFilter: string = 'all';
  showGeofences: boolean = true;
  showTraffic: boolean = false;

  // View modes
  viewMode: 'fleet' | 'individual' | 'routes' = 'fleet';
  sidebarMode: 'vehicles' | 'routes' | 'alerts' | 'zones' = 'vehicles';

  // Real-time tracking
  private trackingInterval: any;
  isTracking: boolean = true;
  updateInterval: number = 30; // seconds

  // Statistics
  trackingStats = {
    activeVehicles: 0,
    ongoingTrips: 0,
    alertCount: 0,
    averageSpeed: 0,
    totalDistance: 0,
    fuelEfficiency: 0
  };

  ngOnInit(): void {
    this.loadVehicles();
    this.loadRoutes();
    this.loadAlerts();
    this.loadGeofenceZones();
    this.calculateStats();
    this.startTracking();
  }

  ngOnDestroy(): void {
    this.stopTracking();
  }

  loadVehicles(): void {
    // Mock vehicle data with real-time locations
    this.vehicles = [
      {
        vehicleId: 'VH001',
        vehiclePlate: 'MH-12-AB-1234',
        driverName: 'Raj Kumar',
        latitude: 19.0896,
        longitude: 72.8656,
        heading: 45,
        speed: 35,
        status: 'active',
        lastUpdate: new Date(),
        currentBooking: {
          id: 'BK001234',
          customerName: 'John Doe',
          pickup: 'Bandra Station',
          destination: 'Mumbai Airport',
          eta: new Date(Date.now() + 45 * 60 * 1000) // 45 minutes from now
        },
        fuelLevel: 75,
        batteryLevel: undefined
      },
      {
        vehicleId: 'VH002',
        vehiclePlate: 'MH-12-CD-5678',
        driverName: 'Priya Sharma',
        latitude: 19.0544,
        longitude: 72.8326,
        heading: 180,
        speed: 0,
        status: 'idle',
        lastUpdate: new Date(Date.now() - 5 * 60 * 1000), // 5 minutes ago
        fuelLevel: 90,
        batteryLevel: undefined
      },
      {
        vehicleId: 'VH003',
        vehiclePlate: 'MH-12-EF-9012',
        driverName: 'Amit Singh',
        latitude: 19.1136,
        longitude: 72.8697,
        heading: 270,
        speed: 42,
        status: 'active',
        lastUpdate: new Date(),
        currentBooking: {
          id: 'BK001235',
          customerName: 'Maria Garcia',
          pickup: 'Andheri East',
          destination: 'Powai Lake',
          eta: new Date(Date.now() + 25 * 60 * 1000) // 25 minutes from now
        },
        fuelLevel: 60,
        batteryLevel: undefined
      },
      {
        vehicleId: 'VH004',
        vehiclePlate: 'MH-12-GH-3456',
        driverName: 'Sarah Wilson',
        latitude: 19.0330,
        longitude: 72.8570,
        heading: 90,
        speed: 0,
        status: 'maintenance',
        lastUpdate: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
        fuelLevel: 45,
        batteryLevel: undefined
      },
      {
        vehicleId: 'VH005',
        vehiclePlate: 'MH-14-EV-7890',
        driverName: 'Ravi Patel',
        latitude: 19.0728,
        longitude: 72.8826,
        heading: 135,
        speed: 28,
        status: 'active',
        lastUpdate: new Date(),
        currentBooking: {
          id: 'BK001236',
          customerName: 'Alex Johnson',
          pickup: 'Colaba',
          destination: 'Worli Sea Link',
          eta: new Date(Date.now() + 15 * 60 * 1000) // 15 minutes from now
        },
        fuelLevel: undefined,
        batteryLevel: 85
      }
    ];
  }

  loadRoutes(): void {
    // Mock route data
    this.routes = [
      {
        bookingId: 'BK001234',
        vehicleId: 'VH001',
        waypoints: [
          { lat: 19.0544, lng: 72.8326, timestamp: new Date(Date.now() - 30 * 60 * 1000), type: 'pickup', address: 'Bandra Station' },
          { lat: 19.0700, lng: 72.8500, timestamp: new Date(Date.now() - 20 * 60 * 1000), type: 'waypoint' },
          { lat: 19.0896, lng: 72.8656, timestamp: new Date(), type: 'waypoint' },
          { lat: 19.0932, lng: 72.8665, timestamp: new Date(Date.now() + 15 * 60 * 1000), type: 'destination', address: 'Mumbai Airport' }
        ],
        estimatedDistance: 12.5,
        estimatedDuration: 45,
        actualDistance: 8.2,
        status: 'in-progress'
      },
      {
        bookingId: 'BK001235',
        vehicleId: 'VH003',
        waypoints: [
          { lat: 19.1197, lng: 72.8464, timestamp: new Date(Date.now() - 15 * 60 * 1000), type: 'pickup', address: 'Andheri East' },
          { lat: 19.1136, lng: 72.8697, timestamp: new Date(), type: 'waypoint' },
          { lat: 19.1153, lng: 72.9116, timestamp: new Date(Date.now() + 25 * 60 * 1000), type: 'destination', address: 'Powai Lake' }
        ],
        estimatedDistance: 8.3,
        estimatedDuration: 25,
        actualDistance: 3.7,
        status: 'in-progress'
      }
    ];
  }

  loadAlerts(): void {
    // Mock alert data
    this.alerts = [
      {
        id: 'ALT001',
        type: 'speeding',
        vehicleId: 'VH001',
        vehiclePlate: 'MH-12-AB-1234',
        driverName: 'Raj Kumar',
        message: 'Vehicle exceeding speed limit (65 km/h in 50 km/h zone)',
        severity: 'medium',
        timestamp: new Date(Date.now() - 10 * 60 * 1000),
        location: { lat: 19.0896, lng: 72.8656, address: 'Western Express Highway, Bandra' },
        acknowledged: false
      },
      {
        id: 'ALT002',
        type: 'fuel_low',
        vehicleId: 'VH004',
        vehiclePlate: 'MH-12-GH-3456',
        driverName: 'Sarah Wilson',
        message: 'Fuel level critically low (10%). Immediate refueling required.',
        severity: 'high',
        timestamp: new Date(Date.now() - 30 * 60 * 1000),
        location: { lat: 19.0330, lng: 72.8570, address: 'Nariman Point' },
        acknowledged: false
      },
      {
        id: 'ALT003',
        type: 'route_deviation',
        vehicleId: 'VH003',
        vehiclePlate: 'MH-12-EF-9012',
        driverName: 'Amit Singh',
        message: 'Vehicle has deviated from planned route by 2.5 km',
        severity: 'low',
        timestamp: new Date(Date.now() - 45 * 60 * 1000),
        location: { lat: 19.1136, lng: 72.8697, address: 'Jogeshwari East' },
        acknowledged: true
      }
    ];
  }

  loadGeofenceZones(): void {
    // Mock geofence data
    this.geofenceZones = [
      {
        id: 'GF001',
        name: 'Mumbai Airport Pickup Zone',
        type: 'pickup_zone',
        coordinates: [
          { lat: 19.0932, lng: 72.8665 },
          { lat: 19.0940, lng: 72.8670 },
          { lat: 19.0935, lng: 72.8680 },
          { lat: 19.0925, lng: 72.8675 }
        ],
        active: true,
        alerts: true
      },
      {
        id: 'GF002',
        name: 'Bandra Station Area',
        type: 'service_area',
        coordinates: [
          { lat: 19.0540, lng: 72.8320 },
          { lat: 19.0550, lng: 72.8320 },
          { lat: 19.0550, lng: 72.8340 },
          { lat: 19.0540, lng: 72.8340 }
        ],
        active: true,
        alerts: false
      },
      {
        id: 'GF003',
        name: 'Company Depot',
        type: 'depot',
        coordinates: [
          { lat: 19.0760, lng: 72.8777 }
        ],
        radius: 500, // meters
        active: true,
        alerts: true
      }
    ];
  }

  calculateStats(): void {
    this.trackingStats = {
      activeVehicles: this.vehicles.filter(v => v.status === 'active').length,
      ongoingTrips: this.vehicles.filter(v => v.currentBooking).length,
      alertCount: this.alerts.filter(a => !a.acknowledged).length,
      averageSpeed: this.vehicles
        .filter(v => v.status === 'active')
        .reduce((sum, v) => sum + v.speed, 0) / this.vehicles.filter(v => v.status === 'active').length || 0,
      totalDistance: this.routes.reduce((sum, r) => sum + (r.actualDistance || 0), 0),
      fuelEfficiency: 12.5 // Mock average fuel efficiency
    };
  }

  // Real-time tracking
  startTracking(): void {
    if (this.trackingInterval) {
      this.stopTracking();
    }

    this.trackingInterval = setInterval(() => {
      if (this.isTracking) {
        this.updateVehiclePositions();
        this.calculateStats();
      }
    }, this.updateInterval * 1000);
  }

  stopTracking(): void {
    if (this.trackingInterval) {
      clearInterval(this.trackingInterval);
      this.trackingInterval = null;
    }
  }

  toggleTracking(): void {
    this.isTracking = !this.isTracking;
    if (this.isTracking) {
      this.startTracking();
    }
  }

  setUpdateInterval(seconds: number): void {
    this.updateInterval = seconds;
    if (this.isTracking) {
      this.startTracking(); // Restart with new interval
    }
  }

  updateVehiclePositions(): void {
    // Simulate vehicle movement (in a real app, this would come from GPS data)
    this.vehicles.forEach(vehicle => {
      if (vehicle.status === 'active') {
        // Small random movement to simulate real tracking
        const deltaLat = (Math.random() - 0.5) * 0.001; // ~100m max movement
        const deltaLng = (Math.random() - 0.5) * 0.001;
        
        vehicle.latitude += deltaLat;
        vehicle.longitude += deltaLng;
        vehicle.heading = (vehicle.heading + (Math.random() - 0.5) * 20) % 360;
        vehicle.speed = Math.max(0, vehicle.speed + (Math.random() - 0.5) * 10);
        vehicle.lastUpdate = new Date();

        // Update fuel/battery levels
        if (vehicle.fuelLevel !== undefined) {
          vehicle.fuelLevel = Math.max(0, vehicle.fuelLevel - Math.random() * 0.5);
        }
        if (vehicle.batteryLevel !== undefined) {
          vehicle.batteryLevel = Math.max(0, vehicle.batteryLevel - Math.random() * 0.3);
        }
      }
    });
  }

  // Vehicle selection
  selectVehicle(vehicle: VehicleLocation): void {
    this.selectedVehicle = vehicle;
    this.viewMode = 'individual';
    this.centerMapOnVehicle(vehicle);
  }

  deselectVehicle(): void {
    this.selectedVehicle = null;
    this.viewMode = 'fleet';
  }

  // Route selection
  selectRoute(route: RouteInfo): void {
    this.selectedRoute = route;
    this.viewMode = 'routes';
  }

  deselectRoute(): void {
    this.selectedRoute = null;
    this.viewMode = 'fleet';
  }

  // Map controls
  centerMapOnVehicle(vehicle: VehicleLocation): void {
    this.mapCenter = { lat: vehicle.latitude, lng: vehicle.longitude };
    this.mapZoom = 15;
  }

  resetMapView(): void {
    this.mapCenter = { lat: 19.0760, lng: 72.8777 };
    this.mapZoom = 12;
  }

  changeMapStyle(style: string): void {
    this.mapStyle = style;
  }

  // Filters
  setVehicleStatusFilter(status: string): void {
    this.vehicleStatusFilter = status;
  }

  setAlertSeverityFilter(severity: string): void {
    this.alertSeverityFilter = severity;
  }

  getFilteredVehicles(): VehicleLocation[] {
    if (this.vehicleStatusFilter === 'all') {
      return this.vehicles;
    }
    return this.vehicles.filter(v => v.status === this.vehicleStatusFilter);
  }

  getFilteredAlerts(): TrackingAlert[] {
    let filtered = this.alerts;
    
    if (this.alertSeverityFilter !== 'all') {
      filtered = filtered.filter(a => a.severity === this.alertSeverityFilter);
    }

    return filtered.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  // Alert management
  acknowledgeAlert(alertId: string): void {
    const alert = this.alerts.find(a => a.id === alertId);
    if (alert) {
      alert.acknowledged = true;
      this.calculateStats();
    }
  }

  acknowledgeAllAlerts(): void {
    this.alerts.forEach(alert => alert.acknowledged = true);
    this.calculateStats();
  }

  dismissAlert(alertId: string): void {
    this.alerts = this.alerts.filter(a => a.id !== alertId);
    this.calculateStats();
  }

  // Utility methods
  getVehicleIcon(vehicle: VehicleLocation): string {
    switch (vehicle.status) {
      case 'active': return 'fas fa-car';
      case 'idle': return 'fas fa-pause-circle';
      case 'offline': return 'fas fa-times-circle';
      case 'maintenance': return 'fas fa-wrench';
      default: return 'fas fa-car';
    }
  }

  getVehicleStatusColor(status: string): string {
    switch (status) {
      case 'active': return '#10b981';
      case 'idle': return '#f59e0b';
      case 'offline': return '#64748b';
      case 'maintenance': return '#ef4444';
      default: return '#64748b';
    }
  }

  getAlertIcon(type: string): string {
    switch (type) {
      case 'speeding': return 'fas fa-tachometer-alt';
      case 'route_deviation': return 'fas fa-route';
      case 'breakdown': return 'fas fa-exclamation-triangle';
      case 'emergency': return 'fas fa-ambulance';
      case 'late_arrival': return 'fas fa-clock';
      case 'fuel_low': return 'fas fa-gas-pump';
      case 'battery_low': return 'fas fa-battery-quarter';
      default: return 'fas fa-exclamation';
    }
  }

  getAlertSeverityColor(severity: string): string {
    switch (severity) {
      case 'critical': return '#dc2626';
      case 'high': return '#ef4444';
      case 'medium': return '#f59e0b';
      case 'low': return '#10b981';
      default: return '#64748b';
    }
  }

  formatTimestamp(timestamp: Date): string {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const minutes = Math.floor(diff / (1000 * 60));

    if (minutes < 1) {
      return 'Just now';
    } else if (minutes < 60) {
      return `${minutes}m ago`;
    } else {
      const hours = Math.floor(minutes / 60);
      return `${hours}h ${minutes % 60}m ago`;
    }
  }

  formatETA(eta: Date): string {
    const now = new Date();
    const diff = eta.getTime() - now.getTime();
    const minutes = Math.floor(diff / (1000 * 60));

    if (minutes <= 0) {
      return 'Arrived';
    } else if (minutes < 60) {
      return `${minutes} min`;
    } else {
      const hours = Math.floor(minutes / 60);
      return `${hours}h ${minutes % 60}m`;
    }
  }

  // Export and reporting
  exportTrackingData(): void {
    const data = {
      timestamp: new Date().toISOString(),
      vehicles: this.vehicles,
      routes: this.routes,
      alerts: this.alerts,
      stats: this.trackingStats
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tracking-data-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  // Geofence management
  toggleGeofenceZone(zoneId: string): void {
    const zone = this.geofenceZones.find(z => z.id === zoneId);
    if (zone) {
      zone.active = !zone.active;
    }
  }

  setSidebarMode(mode: 'vehicles' | 'routes' | 'alerts' | 'zones'): void {
    this.sidebarMode = mode;
  }

  // Emergency functions
  sendEmergencyAlert(vehicleId: string): void {
    const vehicle = this.vehicles.find(v => v.vehicleId === vehicleId);
    if (vehicle) {
      const alert: TrackingAlert = {
        id: 'ALT' + Date.now(),
        type: 'emergency',
        vehicleId: vehicle.vehicleId,
        vehiclePlate: vehicle.vehiclePlate,
        driverName: vehicle.driverName,
        message: 'Emergency alert activated by system administrator',
        severity: 'critical',
        timestamp: new Date(),
        location: { 
          lat: vehicle.latitude, 
          lng: vehicle.longitude, 
          address: 'Current Location' 
        },
        acknowledged: false
      };
      this.alerts.unshift(alert);
      this.calculateStats();
    }
  }

  callDriver(vehicleId: string): void {
    // In a real app, this would initiate a phone call
    console.log(`Calling driver of vehicle ${vehicleId}`);
  }
}