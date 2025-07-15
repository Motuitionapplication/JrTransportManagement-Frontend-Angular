// Student models matching backend API structure
export interface Student {
  id?: number;
  studentId?: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string; // ISO date string
  gender: 'MALE' | 'FEMALE' | 'OTHER';
  address: string;
  parentName: string;
  parentPhone: string;
  parentEmail: string;
  emergencyContact: string;
  emergencyPhone: string;
  medicalInfo?: string;
  allergies?: string;
  enrollmentDate: string; // ISO date string
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface StudentRegistrationRequest {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: 'MALE' | 'FEMALE' | 'OTHER';
  address: string;
  parentName: string;
  parentPhone: string;
  parentEmail: string;
  emergencyContact: string;
  emergencyPhone: string;
  medicalInfo?: string;
  allergies?: string;
  enrollmentDate: string;
}

export interface StudentResponse {
  id: number;
  studentId: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: string;
  address: string;
  parentName: string;
  parentPhone: string;
  parentEmail: string;
  emergencyContact: string;
  emergencyPhone: string;
  medicalInfo?: string;
  allergies?: string;
  enrollmentDate: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface MessageResponse {
  message: string;
}

// Legacy interfaces for backward compatibility
export interface ParentInfo {
  father: ContactInfo;
  mother: ContactInfo;
  guardian?: ContactInfo;
}

export interface ContactInfo {
  name: string;
  email: string;
  phone: string;
  occupation?: string;
  address: Address;
}

export interface MedicalInfo {
  allergies?: string[];
  medications?: string[];
  medicalConditions?: string[];
  doctorName?: string;
  doctorPhone?: string;
  bloodGroup?: string;
}

export interface EmergencyContact {
  name: string;
  relationship: string;
  phone: string;
  email?: string;
}

export interface Address {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}
