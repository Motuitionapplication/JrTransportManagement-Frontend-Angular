export interface Driver {
  id: string;
  profile: {
    firstName: string;
    lastName: string;
    fatherName: string; // or husband name
    email: string;
    phoneNumber: string;
    alternatePhone?: string;
    address: {
      street: string;
      city: string;
      state: string;
      pincode: string;
      country: string;
    };
    profilePhoto: string; // captured with eye blinking verification
    bloodGroup: string;
    dateOfBirth: Date;
    emergencyContact: {
      name: string;
      relationship: string;
      phoneNumber: string;
    };
  };
  
  // Authentication
  userId: string;
  password: string; // hashed
  
  // Driving License details
  drivingLicense: {
    licenseNumber: string;
    licenseType: 'LMV' | 'HMV' | 'HPMV' | 'HGMV' | 'PSV' | 'TRANSPORT';
    issueDate: Date;
    expiryDate: Date;
    issuingAuthority: string;
    documentUrl: string;
    isVerified: boolean;
  };
  
  // Identity verification
  identityProof: {
    type: 'aadhar' | 'voter_id' | 'pan_card' | 'passport' | 'govt_id';
    number: string;
    documentUrl: string;
    isVerified: boolean;
    verificationDate?: Date;
  };
  
  // Insurance details
  insurance: {
    policyNumber: string;
    provider: string;
    coverageAmount: number;
    expiryDate: Date;
    documentUrl: string;
  };
  
  // Vehicle assignment
  assignedVehicles: string[]; // vehicle IDs
  currentVehicle?: string;
  
  // Driver status and availability
  status: 'available' | 'on_trip' | 'off_duty' | 'break';
  workingHours: {
    startTime: string; // HH:MM format
    endTime: string;
    workingDays: string[]; // ['monday', 'tuesday', ...]
  };
  
  // Experience and ratings
  experience: {
    totalYears: number;
    previousEmployers?: string[];
    specializations: string[]; // ['long_distance', 'city_delivery', 'heavy_cargo']
  };
  
  rating: {
    averageRating: number;
    totalRatings: number;
    reviews: DriverReview[];
  };
  
  // Reward points and incentives
  rewardPoints: {
    currentPoints: number;
    totalEarned: number;
    redeemed: number;
    history: RewardTransaction[];
  };
  
  // Service centers added by driver
  serviceCenters: ServiceCenter[];
  
  // Trip history
  tripHistory: string[]; // trip IDs
  totalTripsCompleted: number;
  
  // Notifications and communications
  notifications: Notification[];
  
  // Verification and status
  verificationStatus: 'pending' | 'verified' | 'rejected';
  accountStatus: 'active' | 'suspended' | 'blocked';
  backgroundCheckStatus: 'pending' | 'cleared' | 'failed';
  
  // Activity tracking
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface DriverReview {
  id: string;
  customerId: string;
  tripId: string;
  rating: number; // 1-5
  comment?: string;
  timestamp: Date;
}

export interface RewardTransaction {
  id: string;
  type: 'earned' | 'redeemed';
  points: number;
  description: string;
  referenceId?: string;
  timestamp: Date;
}

export interface ServiceCenter {
  id: string;
  name: string;
  type: 'fuel' | 'garage' | 'tire' | 'spare_parts' | 'restaurant' | 'rest_area';
  location: {
    latitude: number;
    longitude: number;
    address: string;
    city: string;
    state: string;
  };
  contact: {
    phoneNumber: string;
    email?: string;
  };
  operatingHours: {
    open: string;
    close: string;
    is24Hours: boolean;
  };
  services: string[];
  addedBy: string; // driver ID
  verifiedBy?: string[]; // other driver IDs who confirmed
  rating: number;
  isVerified: boolean;
  createdAt: Date;
}

export interface Notification {
  id: string;
  type: 'trip_assignment' | 'payment' | 'system' | 'customer_message' | 'owner_message';
  title: string;
  message: string;
  isRead: boolean;
  timestamp: Date;
  actionRequired?: boolean;
  relatedId?: string; // trip ID, order ID, etc.
}
