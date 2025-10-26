import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { CustomerService } from 'src/app/features/customer/customer.service';
import { Customer } from 'src/app/models/customer.model';
// For Excel export
import * as XLSX from 'xlsx';
// For PDF export
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface CustomerView {
  id: string;
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
  dataSource = new MatTableDataSource<CustomerView>();

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

  loading = false;
  error: string | null = null;
  // UI control for export format
  exportFormat: 'xlsx' | 'pdf' | 'both' = 'both';

  constructor(private customerService: CustomerService) { }

  ngOnInit(): void {
    this.loadCustomers();
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;

    // Custom filter predicate
    this.dataSource.filterPredicate = (data: CustomerView, filter: string) => {
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
    this.loading = true;
    this.error = null;
    this.customerService.getAllCustomers().subscribe({ next: (list) => {
      this.dataSource.data = list.map(c => this.mapToView(c));
      this.loading = false;
      this.calculateStats();
    }, error: (err) => { console.error('Failed to load customers', err); this.error = 'Failed to load customers'; this.loading = false; } });
  }
  private mapToView(c: Customer): CustomerView {
    const name = `${c.profile?.firstName || ''} ${c.profile?.lastName || ''}`.trim() || 'Customer';
    const email = c.profile?.email || '';
    const phone = c.profile?.phoneNumber || '';
    const location = c.profile?.address ? `${c.profile.address.city}, ${c.profile.address.state}` : '';
    const totalBookings = Array.isArray(c.bookingHistory) ? c.bookingHistory.length : 0;
    const totalSpent = Array.isArray(c.wallet?.transactions) ? c.wallet.transactions.reduce((s, t) => s + (t.type === 'debit' ? t.amount : 0), 0) : 0;
    const rating = c.rating?.averageRating || undefined;
    const registeredDate = c.createdAt ? new Date(c.createdAt) : new Date();
    const lastActivity = c.lastLogin ? new Date(c.lastLogin) : (c.updatedAt ? new Date(c.updatedAt) : new Date());

    return {
      id: c.id,
      name,
      email,
      phone,
      company: undefined,
      totalBookings,
      totalSpent,
      status: c.accountStatus === 'active' ? 'active' : (c.accountStatus === 'suspended' ? 'suspended' : 'inactive'),
      registeredDate,
      lastActivity,
      rating,
      location
    };
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
    // Default to exporting both formats when called without args
    this.exportCustomersAs('both');
  }

  /**
   * Export customers as Excel and/or PDF.
   * format: 'xlsx' | 'pdf' | 'both'
   */
  exportCustomersAs(format: 'xlsx' | 'pdf' | 'both' = 'both'): void {
    const data = this.dataSource.data || [];
    if (!data || data.length === 0) {
      alert('No customers available to export.');
      return;
    }

    // Normalize rows into plain objects suitable for XLSX/pdf
    const rows = data.map(r => ({
      ID: r.id,
      Name: r.name,
      Email: r.email,
      Phone: r.phone,
      Company: r.company || '',
      TotalBookings: r.totalBookings,
      TotalSpent: this.formatCurrency(r.totalSpent),
      Status: r.status,
      Registered: this.formatDate(r.registeredDate),
      LastActivity: this.formatDate(r.lastActivity),
      Location: r.location || ''
    }));

    // Excel
    if (format === 'xlsx' || format === 'both') {
      try {
        const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(rows);
        const wb: XLSX.WorkBook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Customers');
        XLSX.writeFile(wb, 'customers.xlsx');
      } catch (err) {
        console.error('Failed to export XLSX', err);
        alert('Failed to export Excel file.');
      }
    }

    // PDF
    if (format === 'pdf' || format === 'both') {
      try {
        const doc = new jsPDF({ unit: 'pt' });
        const head = [Object.keys(rows[0])];
        const body = rows.map(r => Object.values(r));

        autoTable(doc, {
          head,
          body,
          styles: { fontSize: 9 },
          headStyles: { fillColor: [33, 150, 243] }
        });

        doc.save('customers.pdf');
      } catch (err) {
        console.error('Failed to export PDF', err);
        alert('Failed to export PDF file.');
      }
    }
  }

  export(mode: string): void {
    if (mode === 'pdf') {
      this.exportPDF();
    } else if (mode === 'excel') {
      this.exportExcel();
    }
  }

  exportPDF(): void {
    const doc = new jsPDF();
    const head = [['ID', 'Name', 'Email', 'Phone']];
    const body = this.dataSource.data.map(customer => [customer.id, customer.name, customer.email, customer.phone]);
    autoTable(doc, { head, body, styles: { fontSize: 8 } });
    doc.save('customers_report.pdf');
  }

  exportExcel(): void {
    const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(this.dataSource.data);
    const workbook: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Customers');
    XLSX.writeFile(workbook, 'customers_report.xlsx');
  }

  /**
   * View customer details
   */
  viewCustomer(customer: CustomerView): void {
    console.log('Viewing customer:', customer);
    // Navigate to customer detail page or open modal
  }

  /**
   * Edit customer
   */
  editCustomer(customer: CustomerView): void {
    console.log('Editing customer:', customer);
    // Navigate to customer edit page or open modal
  }

  /**
   * Delete customer
   */
  deleteCustomer(customer: CustomerView): void {
    if (!confirm(`Delete customer ${customer.name}?`)) return;
    this.loading = true;
    this.customerService.deleteCustomer(String(customer.id)).subscribe({ next: () => {
      this.dataSource.data = this.dataSource.data.filter(c => c.id !== customer.id);
      this.calculateStats();
      this.loading = false;
    }, error: (err) => { console.error('Failed to delete', err); alert('Failed to delete'); this.loading = false; } });
  }

  /**
   * Toggle customer status
   */
  toggleCustomerStatus(customer: CustomerView): void {
    const newStatus = customer.status === 'active' ? 'inactive' : 'active';
    this.loading = true;
    // Fetch full backend customer, update accountStatus, then PUT
    this.customerService.getCustomerById(String(customer.id)).subscribe({ next: (full) => {
      if (!full) { this.loading = false; alert('Customer not found'); return; }
  // Map view status to backend accountStatus. Treat 'inactive' as 'suspended' for backend.
  full.accountStatus = newStatus === 'active' ? 'active' : 'suspended';
      this.customerService.updateCustomer(String(customer.id), full).subscribe({ next: () => {
        customer.status = newStatus as any;
        this.calculateStats();
        this.loading = false;
      }, error: (err) => { console.error('Failed to update status', err); alert('Failed to update status'); this.loading = false; } });
    }, error: (err) => { console.error('Failed to fetch customer', err); this.loading = false; alert('Failed to update status'); } });
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