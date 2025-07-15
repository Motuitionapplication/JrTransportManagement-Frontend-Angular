import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, from } from 'rxjs';
import { catchError, retry, timeout } from 'rxjs/operators';
import { environment } from '../../environments/environment';

export interface DatabaseQueryResult {
  success: boolean;
  data?: any[];
  error?: string;
  rowCount?: number;
}

export interface DatabaseConnectionStatus {
  connected: boolean;
  message: string;
  database?: string;
  host?: string;
}

@Injectable({
  providedIn: 'root'
})
export class DatabaseService {
  private readonly baseUrl = environment.apiUrl;
  private readonly dbConfig = environment.database;

  constructor(private http: HttpClient) {}

  /**
   * Test database connection
   */
  testConnection(): Observable<DatabaseConnectionStatus> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    });

    return this.http.get<DatabaseConnectionStatus>(`${this.baseUrl}/database/test-connection`, { headers })
      .pipe(
        timeout(10000),
        retry(2),
        catchError(this.handleError)
      );
  }

  /**
   * Execute a custom SQL query
   * WARNING: Use with caution in production
   */
  executeQuery(query: string, params: any[] = []): Observable<DatabaseQueryResult> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    const payload = {
      query: query,
      parameters: params
    };

    return this.http.post<DatabaseQueryResult>(`${this.baseUrl}/database/query`, payload, { headers })
      .pipe(
        timeout(30000),
        catchError(this.handleError)
      );
  }

  /**
   * Get database tables information
   */
  getDatabaseTables(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/database/tables`)
      .pipe(
        timeout(10000),
        catchError(this.handleError)
      );
  }

  /**
   * Get table schema information
   */
  getTableSchema(tableName: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/database/tables/${tableName}/schema`)
      .pipe(
        timeout(10000),
        catchError(this.handleError)
      );
  }

  /**
   * Execute SELECT query with pagination
   */
  selectData(tableName: string, limit: number = 50, offset: number = 0, conditions?: any): Observable<DatabaseQueryResult> {
    const params = {
      limit: limit.toString(),
      offset: offset.toString(),
      ...conditions
    };

    return this.http.get<DatabaseQueryResult>(`${this.baseUrl}/database/tables/${tableName}/data`, { params })
      .pipe(
        timeout(15000),
        catchError(this.handleError)
      );
  }

  /**
   * Insert data into table
   */
  insertData(tableName: string, data: any): Observable<DatabaseQueryResult> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    return this.http.post<DatabaseQueryResult>(`${this.baseUrl}/database/tables/${tableName}`, data, { headers })
      .pipe(
        timeout(15000),
        catchError(this.handleError)
      );
  }

  /**
   * Update data in table
   */
  updateData(tableName: string, id: any, data: any): Observable<DatabaseQueryResult> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    return this.http.put<DatabaseQueryResult>(`${this.baseUrl}/database/tables/${tableName}/${id}`, data, { headers })
      .pipe(
        timeout(15000),
        catchError(this.handleError)
      );
  }

  /**
   * Delete data from table
   */
  deleteData(tableName: string, id: any): Observable<DatabaseQueryResult> {
    return this.http.delete<DatabaseQueryResult>(`${this.baseUrl}/database/tables/${tableName}/${id}`)
      .pipe(
        timeout(10000),
        catchError(this.handleError)
      );
  }

  /**
   * Get current database configuration (without sensitive data)
   */
  getDatabaseInfo(): any {
    return {
      host: this.dbConfig.host,
      database: this.dbConfig.database,
      port: this.dbConfig.port,
      ssl: this.dbConfig.ssl,
      // Don't expose username/password
    };
  }

  private handleError = (error: HttpErrorResponse): Observable<never> => {
    console.error('Database Service Error:', error);
    
    let errorMessage = 'Database operation failed';
    
    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Server-side error
      switch (error.status) {
        case 0:
          errorMessage = 'Cannot connect to database server. Please check your connection.';
          break;
        case 401:
          errorMessage = 'Unauthorized: Invalid database credentials.';
          break;
        case 403:
          errorMessage = 'Forbidden: Insufficient database permissions.';
          break;
        case 404:
          errorMessage = 'Database or table not found.';
          break;
        case 500:
          errorMessage = 'Internal server error: Database operation failed.';
          break;
        case 503:
          errorMessage = 'Database service unavailable. Please try again later.';
          break;
        default:
          errorMessage = `Database error: ${error.status} - ${error.message}`;
      }
    }
    
    return throwError(() => new Error(errorMessage));
  }
}
