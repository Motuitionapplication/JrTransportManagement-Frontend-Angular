import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';

export interface Customer {
  id: number;
  name: string;
  email: string;
  phone: string;
  company?: string;
  totalBookings: number;
  totalSpent: number;
  status: 'active' | 'inactive' | 'suspended';
  registeredDate: Date;
  lastActivity: Date;
  rating?: number;
  location: string;
}

@Component({
  selector: 'app-admin-customers',
  templateUrl: './admin-customers.component.html',
  styleUrls: ['./admin-customers.component.scss']
})
export class AdminCustomersComponent implements OnInit {

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  // Table configuration
  displayedColumns: string[] = ['id', 'name', 'email', 'phone', 'company', 'totalBookings', 'totalSpent', 'status', 'lastActivity', 'actions'];
  dataSource = new MatTableDataSource<Customer>();

  // Filter states
  statusFilter: string = 'all';
  searchQuery: string = '';
  dateRangeStart: Date | null = null;
  dateRangeEnd: Date | null = null;

  // Summary statistics
  customerStats = {
    total: 0,
    active: 0,
    inactive: 0,
    suspended: 0,
    totalRevenue: 0,
    averageBookings: 0
  };

  // Status options for filter
  statusOptions = [
    { value: 'all', label: 'All Customers' },
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' },
    { value: 'suspended', label: 'Suspended' }
  ];

  constructor() { }

  ngOnInit(): void {
    this.loadCustomers();
    this.calculateStats();
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;

    // Custom filter predicate
    this.dataSource.filterPredicate = (data: Customer, filter: string) => {
      const searchString = filter.toLowerCase();
      return (
        data.name.toLowerCase().includes(searchString) ||
        data.email.toLowerCase().includes(searchString) ||
        data.phone.includes(searchString) ||
        (data.company && data.company.toLowerCase().includes(searchString)) ||
        data.location.toLowerCase().includes(searchString)
      );
    };
  }

  /**
   * Load customers data (replace with actual service call)
   */
  loadCustomers(): void {
    const mockCustomers: Customer[] = [
      {
        id: 1,
        name: 'John Doe',
        email: 'john.doe@email.com',
        phone: '+1-234-567-8901',
        company: 'ABC Corp',
        totalBookings: 45,
        totalSpent: 12500.00,
        status: 'active',
        registeredDate: new Date('2023-01-15'),
        lastActivity: new Date('2024-01-10'),
        rating: 4.8,
        location: 'New York, NY'
      },
      {
        id: 2,
        name: 'Sarah Johnson',
        email: 'sarah.j@company.com',
        phone: '+1-234-567-8902',
        company: 'Tech Solutions Inc',
        totalBookings: 32,
        totalSpent: 8900.00,
        status: 'active',
        registeredDate: new Date('2023-03-20'),
        lastActivity: new Date('2024-01-08'),
        rating: 4.6,
        location: 'San Francisco, CA'
      },
      {
        id: 3,
        name: 'Mike Wilson',
        email: 'mike.wilson@gmail.com',
        phone: '+1-234-567-8903',
        totalBookings: 18,
        totalSpent: 4200.00,
        status: 'inactive',
        registeredDate: new Date('2023-05-10'),
        lastActivity: new Date('2023-12-15'),
        rating: 4.2,
        location: 'Chicago, IL'
      },
      {
        id: 4,
        name: 'Emily Davis',
        email: 'emily.davis@business.com',
        phone: '+1-234-567-8904',
        company: 'Global Enterprises',
        totalBookings: 67,
        totalSpent: 18900.00,
        status: 'active',
        registeredDate: new Date('2022-11-05'),
        lastActivity: new Date('2024-01-09'),
        rating: 4.9,
        location: 'Los Angeles, CA'
      },
      {
        id: 5,
        name: 'Robert Brown',
        email: 'r.brown@email.com',
        phone: '+1-234-567-8905',
        totalBookings: 8,
        totalSpent: 1800.00,
        status: 'suspended',
        registeredDate: new Date('2023-08-12'),
        lastActivity: new Date('2023-11-20'),
        rating: 3.1,
        location: 'Miami, FL'
      }
    ];

    this.dataSource.data = mockCustomers;
  }

  /**
   * Calculate customer statistics
   */
  calculateStats(): void {
    const customers = this.dataSource.data;
    this.customerStats = {
      total: customers.length,
      active: customers.filter(c => c.status === 'active').length,
      inactive: customers.filter(c => c.status === 'inactive').length,
      suspended: customers.filter(c => c.status === 'suspended').length,
      totalRevenue: customers.reduce((sum, c) => sum + c.totalSpent, 0),
      averageBookings: customers.length > 0 ? 
        Math.round(customers.reduce((sum, c) => sum + c.totalBookings, 0) / customers.length) : 0
    };
  }

  /**
   * Apply search filter
   */
  applySearchFilter(): void {
    this.dataSource.filter = this.searchQuery.trim().toLowerCase();
    
    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  /**
   * Apply status filter
   */
  applyStatusFilter(): void {
    if (this.statusFilter === 'all') {
      this.dataSource.data = this.dataSource.data; // Reset filter
    } else {
      // You would implement actual filtering logic here
      console.log('Filtering by status:', this.statusFilter);
    }
  }

  /**
   * Clear all filters
   */
  clearFilters(): void {
    this.searchQuery = '';
    this.statusFilter = 'all';
    this.dateRangeStart = null;
    this.dateRangeEnd = null;
    this.dataSource.filter = '';
    this.loadCustomers();
  }

  /**
   * Export customers data
   */
  exportCustomers(): void {
    console.log('Exporting customers data...');
    // Implement export functionality (CSV, PDF, etc.)
  }

  /**
   * View customer details
   */
  viewCustomer(customer: Customer): void {
    console.log('Viewing customer:', customer);
    // Navigate to customer detail page or open modal
  }

  /**
   * Edit customer
   */
  editCustomer(customer: Customer): void {
    console.log('Editing customer:', customer);
    // Navigate to customer edit page or open modal
  }

  /**
   * Delete customer
   */
  deleteCustomer(customer: Customer): void {
    console.log('Deleting customer:', customer);
    // Show confirmation dialog and delete customer
  }

  /**
   * Toggle customer status
   */
  toggleCustomerStatus(customer: Customer): void {
    if (customer.status === 'active') {
      customer.status = 'inactive';
    } else if (customer.status === 'inactive') {
      customer.status = 'active';
    }
    console.log('Customer status updated:', customer);
  }

  /**
   * Send message to customer
   */
  sendMessage(customer: Customer): void {
    console.log('Sending message to:', customer);
    // Open message composition dialog
  }

  /**
   * View customer booking history
   */
  viewBookingHistory(customer: Customer): void {
    console.log('Viewing booking history for:', customer);
    // Navigate to customer bookings page
  }

  /**
   * Get status badge class
   */
  getStatusClass(status: string): string {
    switch (status) {
      case 'active':
        return 'status-active';
      case 'inactive':
        return 'status-inactive';
      case 'suspended':
        return 'status-suspended';
      default:
        return 'status-unknown';
    }
  }

  /**
   * Format currency display
   */
  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  }

  /**
   * Format date display
   */
  formatDate(date: Date): string {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(date);
  }
}