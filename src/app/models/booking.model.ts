export interface Booking {
  id: string;
  bookingNumber: string;
  
  // Customer details
  customerId: string;
  
  // Vehicle and owner details
  vehicleId?: string;
  ownerId?: string;
  driverId?: string;
  
  // Cargo details
  cargo: {
    description: string;
    type: 'general' | 'fragile' | 'hazardous' | 'perishable' | 'valuable';
    weight: number; // in kg
    dimensions?: {
      length: number;
      width: number;
      height: number;
    };
    value?: number; // declared value for insurance
    specialInstructions?: string;
    photos: string[]; // cargo photos with waybill
  };
  
  // Pickup and delivery details
  pickup: {
    address: Address;
    contactPerson: {
      name: string;
      phoneNumber: string;
    };
    scheduledDate: Date;
    scheduledTime: string;
    actualPickupTime?: Date;
    instructions?: string;
  };
  
  delivery: {
    address: Address;
    contactPerson: {
      name: string;
      phoneNumber: string;
    };
    scheduledDate: Date;
    scheduledTime?: string;
    actualDeliveryTime?: Date;
    instructions?: string;
    deliveryPhoto?: string; // photo with receiver
  };
  
  // Distance and route
  route: {
    totalDistance: number; // in km
    estimatedDuration: number; // in minutes
    routePoints?: LocationPoint[];
    tollCharges?: number;
  };
  
  // Pricing details
  pricing: {
    baseFare: number;
    perKmRate: number;
    gstAmount: number;
    serviceCharge: number;
    insuranceCharge: number;
    tollCharges?: number;
    totalAmount: number;
    discountAmount?: number;
    finalAmount: number;
  };
  
  // Payment details
  payment: {
    method: 'card' | 'upi' | 'net_banking' | 'wallet' | 'cash';
    status: 'pending' | 'paid' | 'failed' | 'refunded' | 'partially_refunded';
    paidAmount: number;
    transactionId?: string;
    paymentDate?: Date;
    refundAmount?: number;
    refundDate?: Date;
  };
  
  // Booking status and tracking
  status: 'pending' | 'confirmed' | 'assigned' | 'picked_up' | 'in_transit' | 'delivered' | 'cancelled' | 'disputed';
  
  // Tracking information
  tracking: {
    currentLocation?: {
      latitude: number;
      longitude: number;
      address: string;
      timestamp: Date;
    };
    statusHistory: StatusUpdate[];
    estimatedArrival?: Date;
  };
  
  // Communications
  communications: BookingMessage[];
  
  // Cancellation details
  cancellation?: {
    reason: string;
    cancelledBy: 'customer' | 'owner' | 'driver' | 'admin';
    cancellationFee: number;
    refundAmount: number;
    cancelledAt: Date;
  };
  
  // Terms and conditions acceptance
  termsAccepted: {
    customer: boolean;
    customerAcceptedAt?: Date;
    owner?: boolean;
    ownerAcceptedAt?: Date;
  };
  
  // Insurance details
  insurance: {
    provider: string;
    policyNumber: string;
    coverageAmount: number;
    premium: number;
  };
  
  // Reviews and ratings
  review?: {
    customerRating: number;
    customerComment?: string;
    driverRating?: number;
    driverComment?: string;
    reviewDate: Date;
  };
  
  // Admin approval
  adminApproval?: {
    isApproved: boolean;
    approvedBy?: string;
    approvedAt?: Date;
    rejectionReason?: string;
  };
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}

export interface StatusUpdate {
  status: string;
  timestamp: Date;
  location?: {
    latitude: number;
    longitude: number;
    address: string;
  };
  note?: string;
  updatedBy: string; // user ID
  photos?: string[];
}

export interface BookingMessage {
  id: string;
  senderId: string;
  senderType: 'customer' | 'owner' | 'driver' | 'admin';
  recipientId: string;
  recipientType: 'customer' | 'owner' | 'driver' | 'admin';
  message: string;
  messageType: 'text' | 'photo' | 'location' | 'voice';
  attachments?: string[];
  timestamp: Date;
  isRead: boolean;
  deliveredAt?: Date;
}

export interface Address {
  street: string;
  landmark?: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
  latitude?: number;
  longitude?: number;
}

export interface LocationPoint {
  latitude: number;
  longitude: number;
  timestamp: Date;
  speed?: number;
  address?: string;
}

// Booking demand and availability
export interface BookingDemand {
  id: string;
  customerId: string;
  route: {
    fromCity: string;
    toCity: string;
    fromState: string;
    toState: string;
  };
  cargoType: string;
  weight: number;
  requiredDate: Date;
  budgetRange: {
    min: number;
    max: number;
  };
  status: 'active' | 'matched' | 'expired';
  createdAt: Date;
  expiresAt: Date;
}

export interface VehicleAvailability {
  id: string;
  ownerId: string;
  vehicleId: string;
  route: {
    fromCity: string;
    toCity: string;
    fromState: string;
    toState: string;
  };
  availableFrom: Date;
  availableTo: Date;
  fareRate: number;
  status: 'available' | 'booked' | 'expired';
  createdAt: Date;
  expiresAt: Date;
}
