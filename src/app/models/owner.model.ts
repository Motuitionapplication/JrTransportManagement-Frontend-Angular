export interface VehicleOwner {
  drivers: any[];
  id: string;
  profile: {
    firstName: string;
    lastName: string;
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
    profilePhoto?: string;
  };
  
  // Authentication
  userId: string;
  password: string; // hashed
  
  // Business details
  businessDetails?: {
    companyName: string;
    gstNumber?: string;
    panNumber: string;
    businessType: 'individual' | 'partnership' | 'company';
    businessAddress: {
      street: string;
      city: string;
      state: string;
      pincode: string;
      country: string;
    };
  };
  
  // Identity verification
  identityProof: {
    type: 'aadhar' | 'voter_id' | 'pan_card' | 'passport' | 'govt_id' | 'driving_license';
    number: string;
    documentUrl: string;
    isVerified: boolean;
    verificationDate?: Date;
  };
  
  // Financial details
  bankDetails: {
    accountNumber: string;
    accountHolderName: string;
    ifscCode: string;
    bankName: string;
    branchName: string;
    branchAddress: string;
    passbookPhoto?: string;
    isVerified: boolean;
  };
  
  // Vehicle management
  vehicles: string[]; // vehicle IDs
  
  // Wallet and payments
  wallet: {
    balance: number;
    reservedAmount: number;
    transactions: WalletTransaction[];
  };
  
  // Service preferences
  servicePreferences: {
    notifications: {
      email: boolean;
      sms: boolean;
      push: boolean;
    };
    trackingEnabled: boolean;
    autoAcceptOrders: boolean;
  };
  
  // Status and verification
  verificationStatus: 'pending' | 'verified' | 'rejected';
  accountStatus: 'active' | 'suspended' | 'blocked';
  
  // Activity tracking
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface WalletTransaction {
  id: string;
  type: 'credit' | 'debit' | 'reserved' | 'released';
  amount: number;
  description: string;
  referenceId?: string; // order ID, booking ID, etc.
  timestamp: Date;
  status: 'pending' | 'completed' | 'failed';
}

export interface OwnerEarnings {
  ownerId: string;
  totalEarnings: number;
  monthlyEarnings: MonthlyEarning[];
  completedTrips: number;
  averageRating: number;
  lastPaymentDate?: Date;
}

export interface MonthlyEarning {
  month: number;
  year: number;
  grossEarnings: number;
  platformFee: number;
  netEarnings: number;
  tripsCompleted: number;
}
