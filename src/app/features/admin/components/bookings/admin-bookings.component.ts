import { Component, OnInit } from '@angular/core';

interface Booking {
  id: string;
  customerName: string;
  pickup: string;
  delivery: string;
  date: Date;
  status: 'pending' | 'confirmed' | 'in-progress' | 'completed' | 'cancelled';
  amount: number;
  driverName?: string;
}

@Component({
  selector: 'app-admin-bookings',
  template: `
    <div class="bookings-management">
      <!-- Header -->
      <div class="page-header">
        <h1 class="page-title">Bookings Management</h1>
        <div class="page-actions">
          <button mat-raised-button color="primary" (click)="addNewBooking()">
            <mat-icon>add</mat-icon>
            New Booking
          </button>
        </div>
      </div>

      <!-- Filter Section -->
      <div class="filters-section">
        <mat-form-field appearance="outline">
          <mat-label>Search bookings</mat-label>
          <input matInput [(ngModel)]="searchTerm" placeholder="Search by ID, customer name..." (input)="filterBookings()">
          <mat-icon matSuffix>search</mat-icon>
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Status</mat-label>
          <mat-select [(value)]="selectedStatus" (selectionChange)="filterBookings()">
            <mat-option value="">All Status</mat-option>
            <mat-option value="pending">Pending</mat-option>
            <mat-option value="confirmed">Confirmed</mat-option>
            <mat-option value="in-progress">In Progress</mat-option>
            <mat-option value="completed">Completed</mat-option>
            <mat-option value="cancelled">Cancelled</mat-option>
          </mat-select>
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Date Range</mat-label>
          <mat-date-range-input [rangePicker]="picker">
            <input matStartDate placeholder="Start date" [(ngModel)]="startDate">
            <input matEndDate placeholder="End date" [(ngModel)]="endDate">
          </mat-date-range-input>
          <mat-datepicker-toggle matSuffix [for]="picker"></mat-datepicker-toggle>
          <mat-date-range-picker #picker></mat-date-range-picker>
        </mat-form-field>
      </div>

      <!-- Bookings Table -->
      <div class="table-container">
        <table mat-table [dataSource]="filteredBookings" class="bookings-table" matSort>
          <!-- Booking ID Column -->
          <ng-container matColumnDef="id">
            <th mat-header-cell *matHeaderCellDef mat-sort-header>Booking ID</th>
            <td mat-cell *matCellDef="let booking">{{ booking.id }}</td>
          </ng-container>

          <!-- Customer Column -->
          <ng-container matColumnDef="customer">
            <th mat-header-cell *matHeaderCellDef mat-sort-header>Customer</th>
            <td mat-cell *matCellDef="let booking">{{ booking.customerName }}</td>
          </ng-container>

          <!-- Route Column -->
          <ng-container matColumnDef="route">
            <th mat-header-cell *matHeaderCellDef>Route</th>
            <td mat-cell *matCellDef="let booking">
              <div class="route-info">
                <span class="pickup">{{ booking.pickup }}</span>
                <mat-icon class="route-arrow">arrow_forward</mat-icon>
                <span class="delivery">{{ booking.delivery }}</span>
              </div>
            </td>
          </ng-container>

          <!-- Date Column -->
          <ng-container matColumnDef="date">
            <th mat-header-cell *matHeaderCellDef mat-sort-header>Date</th>
            <td mat-cell *matCellDef="let booking">{{ booking.date | date:'short' }}</td>
          </ng-container>

          <!-- Status Column -->
          <ng-container matColumnDef="status">
            <th mat-header-cell *matHeaderCellDef>Status</th>
            <td mat-cell *matCellDef="let booking">
              <span class="status-badge" [ngClass]="booking.status">
                {{ booking.status | titlecase }}
              </span>
            </td>
          </ng-container>

          <!-- Driver Column -->
          <ng-container matColumnDef="driver">
            <th mat-header-cell *matHeaderCellDef>Driver</th>
            <td mat-cell *matCellDef="let booking">
              {{ booking.driverName || 'Unassigned' }}
            </td>
          </ng-container>

          <!-- Amount Column -->
          <ng-container matColumnDef="amount">
            <th mat-header-cell *matHeaderCellDef mat-sort-header>Amount</th>
            <td mat-cell *matCellDef="let booking">₹{{ booking.amount | number:'1.2-2' }}</td>
          </ng-container>

          <!-- Actions Column -->
          <ng-container matColumnDef="actions">
            <th mat-header-cell *matHeaderCellDef>Actions</th>
            <td mat-cell *matCellDef="let booking">
              <button mat-icon-button [matMenuTriggerFor]="actionMenu">
                <mat-icon>more_vert</mat-icon>
              </button>
              <mat-menu #actionMenu="matMenu">
                <button mat-menu-item (click)="viewBooking(booking)">
                  <mat-icon>visibility</mat-icon>
                  View Details
                </button>
                <button mat-menu-item (click)="editBooking(booking)">
                  <mat-icon>edit</mat-icon>
                  Edit
                </button>
                <button mat-menu-item (click)="assignDriver(booking)" *ngIf="!booking.driverName">
                  <mat-icon>person_add</mat-icon>
                  Assign Driver
                </button>
                <button mat-menu-item (click)="cancelBooking(booking)" [disabled]="booking.status === 'completed' || booking.status === 'cancelled'">
                  <mat-icon>cancel</mat-icon>
                  Cancel
                </button>
              </mat-menu>
            </td>
          </ng-container>

          <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
          <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
        </table>
      </div>

      <!-- Pagination -->
      <mat-paginator 
        [pageSizeOptions]="[10, 25, 50, 100]" 
        [pageSize]="25"
        showFirstLastButtons>
      </mat-paginator>
    </div>
  `,
  styles: [`
    .bookings-management {
      padding: 1rem;
      height: 100%;
    }

    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2rem;
    }

    .page-title {
      font-size: 1.8rem;
      font-weight: 600;
      margin: 0;
      color: #333;
    }

    .page-actions button {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .filters-section {
      display: grid;
      grid-template-columns: 2fr 1fr 1fr;
      gap: 1rem;
      margin-bottom: 2rem;
      padding: 1.5rem;
      background: white;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }

    .table-container {
      background: white;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      overflow: hidden;
    }

    .bookings-table {
      width: 100%;
    }

    .route-info {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.9rem;
    }

    .route-arrow {
      font-size: 1rem;
      color: #666;
    }

    .pickup {
      color: #2196f3;
      font-weight: 500;
    }

    .delivery {
      color: #4caf50;
      font-weight: 500;
    }

    .status-badge {
      padding: 0.25rem 0.75rem;
      border-radius: 20px;
      font-size: 0.8rem;
      font-weight: 500;
      text-transform: capitalize;
    }

    .status-badge.pending {
      background: rgba(255, 193, 7, 0.1);
      color: #ff9800;
    }

    .status-badge.confirmed {
      background: rgba(33, 150, 243, 0.1);
      color: #2196f3;
    }

    .status-badge.in-progress {
      background: rgba(156, 39, 176, 0.1);
      color: #9c27b0;
    }

    .status-badge.completed {
      background: rgba(76, 175, 80, 0.1);
      color: #4caf50;
    }

    .status-badge.cancelled {
      background: rgba(244, 67, 54, 0.1);
      color: #f44336;
    }

    /* Responsive Design */
    @media (max-width: 768px) {
      .filters-section {
        grid-template-columns: 1fr;
      }
      
      .page-header {
        flex-direction: column;
        gap: 1rem;
        align-items: stretch;
      }
      
      .page-actions {
        display: flex;
        justify-content: center;
      }
    }
  `]
})
export class AdminBookingsComponent implements OnInit {
  
  displayedColumns: string[] = ['id', 'customer', 'route', 'date', 'status', 'driver', 'amount', 'actions'];
  
  searchTerm: string = '';
  selectedStatus: string = '';
  startDate: Date | null = null;
  endDate: Date | null = null;

  bookings: Booking[] = [
    {
      id: 'B12345',
      customerName: 'John Doe',
      pickup: 'Mumbai',
      delivery: 'Delhi',
      date: new Date('2024-01-15'),
      status: 'confirmed',
      amount: 15000,
      driverName: 'Raj Kumar'
    },
    {
      id: 'B12346',
      customerName: 'Jane Smith',
      pickup: 'Bangalore',
      delivery: 'Chennai',
      date: new Date('2024-01-16'),
      status: 'pending',
      amount: 8000
    },
    {
      id: 'B12347',
      customerName: 'Mike Johnson',
      pickup: 'Pune',
      delivery: 'Hyderabad',
      date: new Date('2024-01-17'),
      status: 'in-progress',
      amount: 12000,
      driverName: 'Suresh Patel'
    },
    {
      id: 'B12348',
      customerName: 'Sarah Wilson',
      pickup: 'Kolkata',
      delivery: 'Guwahati',
      date: new Date('2024-01-18'),
      status: 'completed',
      amount: 18000,
      driverName: 'Arun Singh'
    },
    {
      id: 'B12349',
      customerName: 'David Brown',
      pickup: 'Ahmedabad',
      delivery: 'Jaipur',
      date: new Date('2024-01-19'),
      status: 'cancelled',
      amount: 10000
    }
  ];

  filteredBookings: Booking[] = [];

  constructor() { }

  ngOnInit(): void {
    this.filteredBookings = [...this.bookings];
  }

  filterBookings(): void {
    this.filteredBookings = this.bookings.filter(booking => {
      const matchesSearch = !this.searchTerm || 
        booking.id.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        booking.customerName.toLowerCase().includes(this.searchTerm.toLowerCase());
      
      const matchesStatus = !this.selectedStatus || booking.status === this.selectedStatus;
      
      const matchesDate = (!this.startDate || booking.date >= this.startDate) &&
                         (!this.endDate || booking.date <= this.endDate);
      
      return matchesSearch && matchesStatus && matchesDate;
    });
  }

  addNewBooking(): void {
    console.log('Add new booking clicked');
    // Implement add booking functionality
  }

  viewBooking(booking: Booking): void {
    console.log('View booking:', booking);
    // Implement view booking functionality
  }

  editBooking(booking: Booking): void {
    console.log('Edit booking:', booking);
    // Implement edit booking functionality
  }

  assignDriver(booking: Booking): void {
    console.log('Assign driver to booking:', booking);
    // Implement assign driver functionality
  }

  cancelBooking(booking: Booking): void {
    console.log('Cancel booking:', booking);
    // Implement cancel booking functionality
  }
}