export interface CustomerCreateDto {
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  alternatePhone?: string;  // optional
  dateOfBirth?: string;     // formatted as 'YYYY-MM-DD'
}
