export interface Vehicle {
  id: string;
  vehicleNumber: string;
  vehicleType: 'truck' | 'van' | 'trailer' | 'container' | 'pickup';
  model: string;
  manufacturer: string;
  year: number;
  capacity: number; // in kg or cubic meters
  ownerId: string;
  driverId?: string;
  
  // Document details
  documents: {
    registration: {
      number: string;
      expiryDate: Date;
      documentUrl?: string;
    };
    insurance: {
      policyNumber: string;
      expiryDate: Date;
      provider: string;
      documentUrl?: string;
    };
    permit: {
      number: string;
      expiryDate: Date;
      documentUrl?: string;
    };
    fitness: {
      certificateNumber: string;
      expiryDate: Date;
      documentUrl?: string;
    };
    pollution: {
      certificateNumber: string;
      expiryDate: Date;
      documentUrl?: string;
    };
  };
  
  // Location and status
  currentLocation?: {
    latitude: number;
    longitude: number;
    address: string;
    timestamp: Date;
  };
  
  status: 'available' | 'in_transit' | 'maintenance' | 'inactive';
  
  // Fare details
  fareDetails: {
    perKmRate: number;
    wholeFare: number;
    sharingFare: number;
    gstIncluded: boolean;
    movingInsurance: number;
  };
  
  // Maintenance
  maintenanceHistory: MaintenanceRecord[];
  nextServiceDate?: Date;
  
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
}

export interface MaintenanceRecord {
  id: string;
  vehicleId: string;
  type: 'routine' | 'repair' | 'emergency';
  description: string;
  cost: number;
  serviceCenter: string;
  date: Date;
  nextServiceKm?: number;
}

export interface VehicleTracking {
  vehicleId: string;
  locations: LocationPoint[];
  currentSpeed: number;
  fuelLevel?: number;
  engineStatus: 'on' | 'off' | 'idle';
  lastUpdated: Date;
}

export interface LocationPoint {
  latitude: number;
  longitude: number;
  timestamp: Date;
  speed: number;
  address?: string;
}
