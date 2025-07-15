export interface Teacher {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: Date;
  hireDate: Date;
  qualifications: string[];
  specializations: string[];
  experience: number; // years
  classAssignments: string[]; // class IDs
  address: Address;
  emergencyContact: EmergencyContact;
  profilePicture?: string;
  isActive: boolean;
  salary?: number;
  notes?: string;
}

export interface Address {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export interface EmergencyContact {
  name: string;
  relationship: string;
  phone: string;
  email?: string;
}
