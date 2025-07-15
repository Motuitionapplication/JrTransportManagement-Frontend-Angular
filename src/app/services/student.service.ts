import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { Student, StudentRegistrationRequest, StudentResponse, MessageResponse } from '../models/student.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class StudentService {
  private readonly API_URL = `${environment.apiUrl}/students`;
  
  private getApiEndpoint(endpoint: string): string {
    const isLocal = (environment as any).isLocal;
    
    if (isLocal) {
      // Use public endpoints for local development
      switch (endpoint) {
        case '/':
        case '/all':
          return `${this.API_URL}/public/list`;
        case '/count':
          return `${this.API_URL}/public/count`;
        case '/register':
          return `${this.API_URL}/public/register`; // If you have public registration
        case '/search':
          return `${this.API_URL}/public/search`;
        default:
          return `${this.API_URL}${endpoint}`;
      }
    } else {
      // Use protected endpoints for cloud/production
      return `${this.API_URL}${endpoint}`;
    }
  }
  
  private getHttpOptions() {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    // Only add authentication for cloud/production environments
    // Skip authentication for local development
    if (!(environment as any).isLocal) {
      const auth = (environment as any).auth;
      if (auth) {
        headers.set('Authorization', 'Basic ' + btoa(`${auth.username}:${auth.password}`));
      }
    }
    
    return { headers };
  }

  constructor(private http: HttpClient) {}

  /**
   * Get all active students
   */
  getAllStudents(): Observable<StudentResponse[]> {
    const endpoint = this.getApiEndpoint('/');
    return this.http.get<StudentResponse[]>(endpoint, this.getHttpOptions())
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Get student by ID
   */
  getStudentById(id: number): Observable<StudentResponse> {
    return this.http.get<StudentResponse>(`${this.API_URL}/${id}`, this.getHttpOptions())
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Register a new student
   */
  registerStudent(student: StudentRegistrationRequest): Observable<StudentResponse> {
    const endpoint = this.getApiEndpoint('/register');
    console.log('📝 Registering student at:', endpoint);
    return this.http.post<StudentResponse>(endpoint, student, this.getHttpOptions())
      .pipe(
        map((response: StudentResponse) => {
          console.log('✅ Student registered successfully:', response);
          return response;
        }),
        catchError(this.handleError)
      );
  }

  /**
   * Update existing student
   */
  updateStudent(id: number, student: StudentRegistrationRequest): Observable<StudentResponse> {
    return this.http.put<StudentResponse>(`${this.API_URL}/${id}`, student, this.getHttpOptions())
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Delete/Deactivate student
   */
  deleteStudent(id: number): Observable<MessageResponse> {
    return this.http.delete<MessageResponse>(`${this.API_URL}/${id}`, this.getHttpOptions())
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Reactivate student
   */
  reactivateStudent(id: number): Observable<StudentResponse> {
    return this.http.put<StudentResponse>(`${this.API_URL}/${id}/reactivate`, {}, this.getHttpOptions())
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Search students by name
   */
  searchStudents(name: string): Observable<StudentResponse[]> {
    const params = new HttpParams().set('name', name);
    const endpoint = this.getApiEndpoint('/search');
    return this.http.get<StudentResponse[]>(endpoint, { ...this.getHttpOptions(), params })
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Get students by parent email
   */
  getStudentsByParentEmail(email: string): Observable<StudentResponse[]> {
    return this.http.get<StudentResponse[]>(`${this.API_URL}/parent/${email}`, this.getHttpOptions())
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Get total active students count
   */
  getTotalActiveStudents(): Observable<number> {
    const endpoint = this.getApiEndpoint('/count');
    console.log('🔢 Getting student count from:', endpoint);
    return this.http.get<number>(endpoint, this.getHttpOptions())
      .pipe(
        map((response: any) => {
          // Handle case where backend returns an object instead of a number
          const count = typeof response === 'number' ? response : (response.count || response.total || 0);
          console.log('📊 Student count response:', response, '-> parsed count:', count);
          return count;
        }),
        catchError(this.handleError)
      );
  }

  /**
   * Handle HTTP errors
   */
  private handleError(error: any): Observable<never> {
    let errorMessage = 'An error occurred';
    
    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Server-side error
      if (error.error && error.error.message) {
        errorMessage = error.error.message;
      } else if (error.message) {
        errorMessage = error.message;
      } else {
        errorMessage = `Error Code: ${error.status}\nMessage: ${error.statusText}`;
      }
    }
    
    console.error('StudentService Error:', errorMessage);
    return throwError(() => new Error(errorMessage));
  }

  /**
   * Utility method to format date for API
   */
  formatDateForApi(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  /**
   * Utility method to convert StudentResponse to Student
   */
  convertToStudent(response: StudentResponse): Student {
    return {
      id: response.id,
      studentId: response.studentId,
      firstName: response.firstName,
      lastName: response.lastName,
      dateOfBirth: response.dateOfBirth,
      gender: response.gender as 'MALE' | 'FEMALE' | 'OTHER',
      address: response.address,
      parentName: response.parentName,
      parentPhone: response.parentPhone,
      parentEmail: response.parentEmail,
      emergencyContact: response.emergencyContact,
      emergencyPhone: response.emergencyPhone,
      medicalInfo: response.medicalInfo,
      allergies: response.allergies,
      enrollmentDate: response.enrollmentDate,
      isActive: response.isActive
    };
  }
}
