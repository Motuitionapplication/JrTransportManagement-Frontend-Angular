export interface CustomerCreateDto {
  userId: number;   // matches backend
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  alternatePhone?: string;
  dateOfBirth: string;  // "YYYY-MM-DD"
  password: string;     // add password for backend
}
