import { Component, OnInit } from '@angular/core';
import { DatabaseService, DatabaseConnectionStatus } from '../../services/database.service';

@Component({
  selector: 'app-database-test',
  templateUrl: './database-test.component.html',
  styleUrls: ['./database-test.component.scss']
})
export class DatabaseTestComponent implements OnInit {
  connectionStatus: DatabaseConnectionStatus | null = null;
  databaseInfo: any = null;
  tables: any[] = [];
  isLoading = false;
  errorMessage = '';
  successMessage = '';
  customQuery = 'SELECT * FROM pg_tables WHERE schemaname = \'public\' LIMIT 10;';
  queryResults: any[] = [];

  constructor(private databaseService: DatabaseService) {}

  ngOnInit(): void {
    this.databaseInfo = this.databaseService.getDatabaseInfo();
  }

  testConnection(): void {
    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.databaseService.testConnection().subscribe({
      next: (status) => {
        this.connectionStatus = status;
        this.isLoading = false;
        if (status.connected) {
          this.successMessage = 'Successfully connected to PostgreSQL database!';
        } else {
          this.errorMessage = status.message || 'Failed to connect to database';
        }
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = error.message || 'Connection test failed';
        this.connectionStatus = { connected: false, message: this.errorMessage };
      }
    });
  }

  getDatabaseTables(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.databaseService.getDatabaseTables().subscribe({
      next: (tables) => {
        this.tables = tables;
        this.isLoading = false;
        this.successMessage = `Found ${tables.length} table(s) in database`;
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = error.message || 'Failed to fetch tables';
      }
    });
  }

  executeCustomQuery(): void {
    if (!this.customQuery || !this.customQuery.trim()) return;

    this.isLoading = true;
    this.errorMessage = '';
    this.queryResults = [];

    this.databaseService.executeQuery(this.customQuery).subscribe({
      next: (result) => {
        this.isLoading = false;
        if (result.success && result.data) {
          this.queryResults = result.data.slice(0, 50); // Limit to 50 rows for display
          this.successMessage = `Query executed successfully. ${result.rowCount || result.data.length} row(s) returned.`;
        } else {
          this.errorMessage = result.error || 'Query execution failed';
        }
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = error.message || 'Query execution failed';
      }
    });
  }

  clearResults(): void {
    this.connectionStatus = null;
    this.tables = [];
    this.queryResults = [];
    this.errorMessage = '';
    this.successMessage = '';
  }

  getColumnNames(): string[] {
    if (!this.queryResults || this.queryResults.length === 0) return [];
    return Object.keys(this.queryResults[0]);
  }

  getColumnValue(row: any, column: string): any {
    const value = row[column];
    if (value === null || value === undefined) return 'NULL';
    if (typeof value === 'object') return JSON.stringify(value);
    return value;
  }

  getConnectionStatusClass(): string {
    return this.connectionStatus?.connected ? 'bg-success' : 'bg-danger';
  }
}
