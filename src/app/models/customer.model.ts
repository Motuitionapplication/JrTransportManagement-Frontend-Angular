export interface Customer {
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
    dateOfBirth?: Date;
  };
  
  // Authentication
  userId: string;
  password: string; // hashed

  totalBookings?: number;
  revenue?: number;
  activeTrips?: number;
  pendingPayments?: number;
  
  // Identity verification
  identityProof: {
    type: 'aadhar' | 'voter_id' | 'pan_card' | 'passport' | 'govt_id';
    number: string;
    documentUrl: string;
    isVerified: boolean;
    verificationDate?: Date;
  };
  
  // Bank account details
  bankDetails: {
    accountNumber: string;
    accountHolderName: string;
    ifscCode: string;
    bankName: string;
    branchName: string;
    branchAddress: string;
    passbookPhoto: string; // compressed by system
    upiId?: string;
    phonePayNumber?: string;
    isVerified: boolean;
    verificationDate?: Date;
  };
  
  // Wallet and payments
  wallet: {
    balance: number;
    reservedAmount: number;
    transactions: WalletTransaction[];
  };
  
  // Booking history
  bookingHistory: string[]; // booking IDs
  
  // Preferences
  preferences: {
    notifications: {
      email: boolean;
      sms: boolean;
      push: boolean;
      whatsapp: boolean;
    };
    defaultPickupAddress?: Address;
    frequentDestinations: Address[];
    preferredVehicleType?: string;
  };
  
  // Customer ratings and reviews
  rating: {
    averageRating: number;
    totalRatings: number;
    givenReviews: CustomerReview[];
  };
  
  // Complaints and support
  complaints: Complaint[];
  supportTickets: SupportTicket[];
  
  // Verification and status
  verificationStatus: 'pending' | 'verified' | 'rejected';
  accountStatus: 'active' | 'suspended' | 'blocked';
  
  // Activity tracking
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface Address {
  id?: string;
  label?: string; // 'Home', 'Office', etc.
  street: string;
  landmark?: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
  latitude?: number;
  longitude?: number;
}

export interface CustomerReview {
  id: string;
  bookingId: string;
  driverId: string;
  ownerId: string;
  rating: number; // 1-5
  comment?: string;
  categories: {
    punctuality: number;
    vehicleCondition: number;
    driverBehavior: number;
    cargoHandling: number;
  };
  timestamp: Date;
}

export interface Complaint {
  id: string;
  bookingId?: string;
  type: 'delivery_issue' | 'driver_behavior' | 'vehicle_condition' | 'billing' | 'other';
  subject: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  photos?: string[]; // URLs to uploaded photos
  whatsappComplaint?: {
    messageId: string;
    timestamp: Date;
  };
  assignedTo?: string; // admin/support staff ID
  resolution?: string;
  resolutionDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface SupportTicket {
  id: string;
  category: 'technical' | 'billing' | 'booking' | 'account' | 'general';
  subject: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  messages: TicketMessage[];
  assignedTo?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface TicketMessage {
  id: string;
  senderId: string;
  senderType: 'customer' | 'support' | 'admin';
  message: string;
  attachments?: string[];
  timestamp: Date;
  isRead: boolean;
}

export interface WalletTransaction {
  id: string;
  type: 'credit' | 'debit' | 'reserved' | 'released' | 'refund';
  amount: number;
  description: string;
  referenceId?: string; // booking ID, refund ID, etc.
  paymentMethod?: 'card' | 'upi' | 'net_banking' | 'wallet' | 'cash';
  timestamp: Date;
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
}
