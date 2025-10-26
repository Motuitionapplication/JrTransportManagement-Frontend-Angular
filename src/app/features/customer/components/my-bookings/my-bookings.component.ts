import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subject, combineLatest } from 'rxjs';
import { takeUntil, finalize, switchMap } from 'rxjs/operators';
import { BookingService } from '../../../../services/booking.service';
import { CustomerService } from '../../customer.service';
import { Customer } from 'src/app/models/customer.model';

export interface BookingSummary {
  total: number;
  pending: number;
  confirmed: number;
  inTransit: number;
  completed: number;
  cancelled: number;
  totalAmount: number;
  averageAmount: number;
}

export interface Booking {
  id: string;
  bookingNumber: string;
  pickupLocation: string;
  dropoffLocation: string;
  pickupAddress: string;
  dropoffAddress: string;
  pickupDateTime: Date;
  dropoffDateTime?: Date;
  vehicleType: 'truck' | 'van' | 'pickup' | 'heavy-truck';
  status: 'pending' | 'confirmed' | 'in-transit' | 'completed' | 'cancelled';
  driver?: DriverInfo;
  vehicle?: VehicleInfo;
  driverInfo?: DriverInfo;
  vehicleInfo?: VehicleInfo;
  estimatedCost: number;
  actualCost?: number;
  totalAmount: number;
  distance: number;
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  specialInstructions?: string;
  createdAt: Date;
  updatedAt: Date;
  trackingInfo?: {
    lastUpdate: Date;
    currentStatus: string;
    statusHistory: Array<{ status: string; timestamp: Date; description: string; }>;
  };
  updates?: Array<{ status: string; timestamp: Date; description: string; }>;
}

export interface DriverInfo {
  id: string;
  name: string;
  phone: string;
  rating: number;
  profileImage?: string;
  licenseNumber?: string;
}

export interface VehicleInfo {
  id: string;
  registrationNumber: string;
  make: string;
  model: string;
  type: string;
  capacity: number;
  plateNumber?: string;
  year?: number;
}

export interface TrackingInfo {
  bookingId?: string;
  currentLocation?: {
    latitude: number;
    longitude: number;
    address: string;
  };
  estimatedArrival?: Date;
  status?: string;
  lastUpdate: Date;
  currentStatus: string;
}

@Component({
  selector: 'app-my-bookings',
  templateUrl: './my-bookings.component.html',
  styleUrls: ['./my-bookings.component.scss']
})
export class MyBookingsComponent implements OnInit, OnDestroy {
  // Component state
  bookings: Booking[] = [];
  filteredBookings: Booking[] = [];
  selectedBooking: Booking | null = null;
  bookingSummary: BookingSummary = {
    total: 0,
    pending: 0,
    confirmed: 0,
    inTransit: 0,
    completed: 0,
    cancelled: 0,
    totalAmount: 0,
    averageAmount: 0
  };
  
  // Modal controls
  showBookingModal: boolean = false;
  showTrackingModal: boolean = false;
  
  // Filters and search
  searchQuery: string = '';
  statusFilter: string = 'all';
  dateFilter: string = 'all';
  sortBy: string = 'date-desc';
  
  // Pagination
  currentPage: number = 1;
  totalPages: number = 1;
  pageSize: number = 10;
  totalBookings: number = 0;
  
  // Tracking data
  trackingInfo: TrackingInfo | null = null;
  
  // Loading states
  isLoading: boolean = false;
  isRefreshing: boolean = false;
  
  // Export options
  exportFormat: 'csv' | 'excel' = 'csv';
    customer: Customer | null = null;
  
  // Customer ID (should come from auth service)
  private customerId: string = 'CUST-001'; // Mock customer ID
  
  private destroy$ = new Subject<void>();

  constructor(private bookingService: BookingService,private customerservice : CustomerService) {}

  ngOnInit(): void {
    this.loadBookingsData();
    this.subscribeToBookingsUpdates();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Subscribe to booking updates
   */
  private subscribeToBookingsUpdates(): void {
    this.bookingService.bookings$
      .pipe(takeUntil(this.destroy$))
      .subscribe(bookings => {
        this.bookings = this.mapServiceBookings(bookings);
        this.filterBookings();
        this.calculateSummary();
      });
  }

  /**
   * Load bookings data from service
   */
  private loadBookingsData(): void {
  this.isLoading = true;
  const userId = localStorage.getItem('userId');

  if (!userId) {
    console.error('❌ No user ID found in localStorage');
    this.generateMockBookings();
    this.isLoading = false;
    return;
  }

  this.customerservice.getCustomerByUserId(userId).pipe(
    switchMap(customer => {
      console.log('✅ Fetched customer:', customer.id);
      this.customer = customer;
      this.customerId = customer.id;
      // Now fetch booking history for this customer
      return this.customerservice.getBookingHistory(customer.id);
    }),
    takeUntil(this.destroy$),
    finalize(() => this.isLoading = false)
  ).subscribe({
    next: (bookings) => {
      console.log('✅ Bookings loaded:', bookings.length);
      if (bookings.length === 0) {
        this.generateMockBookings();
      } else {
        // Use your mapping function to convert the data
        this.bookings = this.mapServiceBookings(bookings);
        // You must also call filter and summary after loading
        this.filterBookings();
        this.calculateSummary();
      }
    },
    error: (error) => {
      console.error('❌ Error loading bookings:', error);
      this.generateMockBookings();
    }
  });
}


  /**
   * Generate mock bookings for demonstration
   */
  private generateMockBookings(): void {
    const mockBookings: Booking[] = [
      {
        id: 'BK-001',
        bookingNumber: 'JRT-2024-001',
        pickupLocation: 'Main Street, Downtown',
        dropoffLocation: 'Industrial Area, Zone 5',
        pickupAddress: 'Main Street, Downtown',
        dropoffAddress: 'Industrial Area, Zone 5',
        pickupDateTime: new Date('2024-01-20T09:00:00'),
        dropoffDateTime: new Date('2024-01-20T11:30:00'),
        vehicleType: 'truck',
        status: 'completed',
        driver: {
          id: 'DRV-001',
          name: 'John Smith',
          phone: '+1-555-0123',
          rating: 4.8,
          profileImage: 'https://via.placeholder.com/50x50/4299e1/ffffff?text=JS',
          licenseNumber: 'DL123456789'
        },
        driverInfo: {
          id: 'DRV-001',
          name: 'John Smith',
          phone: '+1-555-0123',
          rating: 4.8,
          profileImage: 'https://via.placeholder.com/50x50/4299e1/ffffff?text=JS',
          licenseNumber: 'DL123456789'
        },
        vehicle: {
          id: 'VEH-001',
          registrationNumber: 'ABC-123',
          make: 'Ford',
          model: 'Transit',
          type: 'Medium Truck',
          capacity: 5000,
          plateNumber: 'ABC-123',
          year: 2020
        },
        vehicleInfo: {
          id: 'VEH-001',
          registrationNumber: 'ABC-123',
          make: 'Ford',
          model: 'Transit',
          type: 'Medium Truck',
          capacity: 5000,
          plateNumber: 'ABC-123',
          year: 2020
        },
        estimatedCost: 150.00,
        actualCost: 145.00,
        totalAmount: 145.00,
        distance: 25.5,
        paymentStatus: 'paid',
        specialInstructions: 'Please handle fragile items with care',
        createdAt: new Date('2024-01-19T14:30:00'),
        updatedAt: new Date('2024-01-20T11:35:00'),
        trackingInfo: {
          lastUpdate: new Date('2024-01-20T11:35:00'),
          currentStatus: 'Completed',
          statusHistory: [
            { status: 'Booked', timestamp: new Date('2024-01-19T14:30:00'), description: 'Booking confirmed' },
            { status: 'Driver Assigned', timestamp: new Date('2024-01-20T08:00:00'), description: 'Driver John Smith assigned' },
            { status: 'In Transit', timestamp: new Date('2024-01-20T09:00:00'), description: 'Vehicle en route to pickup' },
            { status: 'Completed', timestamp: new Date('2024-01-20T11:35:00'), description: 'Delivery completed successfully' }
          ]
        }
      },
      {
        id: 'BK-002',
        bookingNumber: 'JRT-2024-002',
        pickupLocation: 'Residential Complex, Block A',
        dropoffLocation: 'Shopping Mall, Central Plaza',
        pickupAddress: 'Residential Complex, Block A',
        dropoffAddress: 'Shopping Mall, Central Plaza',
        pickupDateTime: new Date('2024-01-22T14:00:00'),
        vehicleType: 'van',
        status: 'in-transit',
        driver: {
          id: 'DRV-002',
          name: 'Mike Johnson',
          phone: '+1-555-0456',
          rating: 4.6,
          profileImage: 'https://via.placeholder.com/50x50/48bb78/ffffff?text=MJ',
          licenseNumber: 'DL987654321'
        },
        driverInfo: {
          id: 'DRV-002',
          name: 'Mike Johnson',
          phone: '+1-555-0456',
          rating: 4.6,
          profileImage: 'https://via.placeholder.com/50x50/48bb78/ffffff?text=MJ',
          licenseNumber: 'DL987654321'
        },
        vehicle: {
          id: 'VEH-002',
          registrationNumber: 'XYZ-789',
          make: 'Mercedes',
          model: 'Sprinter',
          type: 'Large Van',
          capacity: 3500,
          plateNumber: 'XYZ-789',
          year: 2019
        },
        vehicleInfo: {
          id: 'VEH-002',
          registrationNumber: 'XYZ-789',
          make: 'Mercedes',
          model: 'Sprinter',
          type: 'Large Van',
          capacity: 3500,
          plateNumber: 'XYZ-789',
          year: 2019
        },
        estimatedCost: 85.00,
        totalAmount: 85.00,
        distance: 15.2,
        paymentStatus: 'pending',
        createdAt: new Date('2024-01-21T10:15:00'),
        updatedAt: new Date('2024-01-22T14:15:00'),
        trackingInfo: {
          lastUpdate: new Date('2024-01-22T14:15:00'),
          currentStatus: 'In Transit',
          statusHistory: [
            { status: 'Booked', timestamp: new Date('2024-01-21T10:15:00'), description: 'Booking confirmed' },
            { status: 'Driver Assigned', timestamp: new Date('2024-01-22T13:00:00'), description: 'Driver Mike Johnson assigned' },
            { status: 'In Transit', timestamp: new Date('2024-01-22T14:00:00'), description: 'Vehicle en route to pickup location' }
          ]
        }
      },
      {
        id: 'BK-003',
        bookingNumber: 'JRT-2024-003',
        pickupLocation: 'Office Building, Tech Park',
        dropoffLocation: 'Warehouse District',
        pickupAddress: 'Office Building, Tech Park',
        dropoffAddress: 'Warehouse District',
        pickupDateTime: new Date('2024-01-25T16:30:00'),
        vehicleType: 'pickup',
        status: 'confirmed',
        estimatedCost: 120.00,
        totalAmount: 120.00,
        distance: 32.8,
        paymentStatus: 'pending',
        specialInstructions: 'Contact security before entering premises',
        createdAt: new Date('2024-01-24T09:45:00'),
        updatedAt: new Date('2024-01-24T09:45:00'),
        trackingInfo: {
          lastUpdate: new Date('2024-01-24T09:45:00'),
          currentStatus: 'Confirmed',
          statusHistory: [
            { status: 'Booked', timestamp: new Date('2024-01-24T09:45:00'), description: 'Booking confirmed and awaiting driver assignment' }
          ]
        }
      }
    ];
    
    // Generate additional dynamic bookings
    this.generateDynamicBookings();
    this.filterBookings();
    this.calculateSummary();
  }

  /**
   * Generate additional dynamic bookings
   */
  private generateDynamicBookings(): void {
    const vehicleTypes = ['car', 'van', 'truck', 'pickup', 'motorcycle'];
    const statuses = ['pending', 'confirmed', 'in-transit', 'completed', 'cancelled'];
    const paymentStatuses = ['pending', 'paid', 'failed', 'refunded'];
    const cities = ['Downtown', 'Airport', 'Mall', 'University', 'Hospital', 'Station', 'Office Park'];
    
    // Generate 10-20 additional bookings
    const additionalCount = Math.floor(Math.random() * 11) + 10;
    
    for (let i = 0; i < additionalCount; i++) {
      const createdAt = new Date(Date.now() - Math.random() * 60 * 24 * 60 * 60 * 1000); // Last 60 days
      const status = statuses[Math.floor(Math.random() * statuses.length)] as any;
      const vehicleType = vehicleTypes[Math.floor(Math.random() * vehicleTypes.length)] as any;
      const pickupCity = cities[Math.floor(Math.random() * cities.length)];
      const dropoffCity = cities[Math.floor(Math.random() * cities.length)];
      
      const booking: Booking = {
        id: `BK-DYN-${Date.now()}-${i}`,
        bookingNumber: `JRT-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 9999) + 1000).padStart(4, '0')}`,
        pickupLocation: pickupCity,
        dropoffLocation: dropoffCity,
        pickupAddress: `${pickupCity} Hub, Main Street`,
        dropoffAddress: `${dropoffCity} Center, Central Avenue`,
        pickupDateTime: new Date(createdAt.getTime() + Math.random() * 48 * 60 * 60 * 1000),
        dropoffDateTime: status === 'completed' ? new Date(createdAt.getTime() + Math.random() * 72 * 60 * 60 * 1000) : undefined,
        vehicleType,
        status,
        paymentStatus: paymentStatuses[Math.floor(Math.random() * paymentStatuses.length)] as any,
        estimatedCost: Math.round((Math.random() * 200 + 30) * 100) / 100,
        actualCost: status === 'completed' ? Math.round((Math.random() * 200 + 30) * 100) / 100 : undefined,
        totalAmount: Math.round((Math.random() * 200 + 30) * 100) / 100,
        distance: Math.round((Math.random() * 50 + 3) * 10) / 10,
        specialInstructions: Math.random() > 0.7 ? 'Please handle with care' : undefined,
        driverInfo: status !== 'pending' ? {
          id: `DRV-${Math.floor(Math.random() * 999) + 100}`,
          name: ['Alex Kumar', 'Priya Sharma', 'Raj Patel', 'Nina Singh', 'Amit Verma'][Math.floor(Math.random() * 5)],
          phone: `+91-${Math.floor(Math.random() * 9000000000) + 1000000000}`,
          rating: Math.round((Math.random() * 2 + 3) * 10) / 10,
          licenseNumber: `DL${Math.floor(Math.random() * 1000000000)}`
        } : undefined,
        vehicleInfo: status !== 'pending' ? {
          id: `VEH-${Math.floor(Math.random() * 999) + 100}`,
          registrationNumber: `${String.fromCharCode(65 + Math.floor(Math.random() * 26))}${String.fromCharCode(65 + Math.floor(Math.random() * 26))}-${Math.floor(Math.random() * 999) + 100}`,
          make: ['Tata', 'Mahindra', 'Maruti', 'Hyundai', 'Honda'][Math.floor(Math.random() * 5)],
          model: ['Ace', 'Bolero', 'Swift', 'i20', 'City'][Math.floor(Math.random() * 5)],
          type: vehicleType,
          capacity: Math.floor(Math.random() * 5000) + 500,
          plateNumber: `HR-${Math.floor(Math.random() * 99) + 10}-${String.fromCharCode(65 + Math.floor(Math.random() * 26))}${String.fromCharCode(65 + Math.floor(Math.random() * 26))}-${Math.floor(Math.random() * 9999) + 1000}`,
          year: 2018 + Math.floor(Math.random() * 6)
        } : undefined,
        createdAt,
        updatedAt: new Date(createdAt.getTime() + Math.random() * 24 * 60 * 60 * 1000),
        trackingInfo: ['in-transit', 'confirmed'].includes(status) ? {
          lastUpdate: new Date(),
          currentStatus: status === 'in-transit' ? 'En route' : 'Confirmed',
          statusHistory: [
            { status: 'Booked', timestamp: createdAt, description: 'Booking confirmed' },
            ...(status !== 'pending' ? [{ status: 'Driver Assigned', timestamp: new Date(createdAt.getTime() + 30 * 60 * 1000), description: 'Driver assigned' }] : []),
            ...(status === 'in-transit' ? [{ status: 'In Transit', timestamp: new Date(createdAt.getTime() + 60 * 60 * 1000), description: 'Vehicle en route' }] : [])
          ]
        } : undefined
      };
      
      this.bookings.push(booking);
    }
  }

  /**
   * Map service bookings to component booking format
   */
  private mapServiceBookings(serviceBookings: any[]): Booking[] {
    return serviceBookings.map(booking => {
      // Helper variables for addresses
      const pAddress = booking.pickup?.address;
      const dAddress = booking.delivery?.address;

      // Create formatted address strings
      const pickupAddressString = pAddress
        ? `${pAddress.street}, ${pAddress.city}, ${pAddress.state}`
        : 'Unknown';
        
      const dropoffAddressString = dAddress
        ? `${dAddress.street}, ${dAddress.city}, ${dAddress.state}`
        : 'Unknown';

      return {
        id: booking.id,
        bookingNumber: booking.bookingNumber,

        pickupLocation: pickupAddressString,
        dropoffLocation: dropoffAddressString,
        pickupAddress: pickupAddressString,
        dropoffAddress: dropoffAddressString,
        pickupDateTime: new Date(booking.pickup?.scheduledDate || Date.now()),
        dropoffDateTime: booking.delivery?.scheduledDate ? new Date(booking.delivery.scheduledDate) : undefined,
        vehicleType: booking.vehicle?.type || 'truck',
        status: booking.status,
        paymentStatus: booking.payment?.status || 'pending',
        estimatedCost: booking.pricing?.baseFare || 0,
        actualCost: booking.pricing?.finalAmount || undefined,
        totalAmount: booking.pricing?.finalAmount || booking.pricing?.baseFare || 0,
        distance: booking.distance || 0,
        specialInstructions: booking.specialInstructions,
        createdAt: new Date(booking.createdAt),
        updatedAt: new Date(booking.updatedAt)
      };
    });
  }
  private calculateSummary(): void {
    const summary = this.bookings.reduce((acc, booking) => {
      acc.total++;
      acc.totalAmount += booking.totalAmount;
      
      switch (booking.status) {
        case 'pending': acc.pending++; break;
        case 'confirmed': acc.confirmed++; break;
        case 'in-transit': acc.inTransit++; break;
        case 'completed': acc.completed++; break;
        case 'cancelled': acc.cancelled++; break;
      }
      
      return acc;
    }, {
      total: 0,
      pending: 0,
      confirmed: 0,
      inTransit: 0,
      completed: 0,
      cancelled: 0,
      totalAmount: 0,
      averageAmount: 0
    });
    
    summary.averageAmount = summary.total > 0 ? summary.totalAmount / summary.total : 0;
    this.bookingSummary = summary;
  }

  /**
   * Filter bookings based on search and filters
   */
  filterBookings(): void {
    // Apply filters
    let filtered = this.bookings.filter(booking => {
      const matchesSearch = !this.searchQuery ||
        booking.bookingNumber.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        booking.pickupLocation.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        booking.dropoffLocation.toLowerCase().includes(this.searchQuery.toLowerCase());

      const matchesStatus = this.statusFilter === 'all' || booking.status === this.statusFilter;

      const matchesDate = this.dateFilter === 'all' || this.checkDateFilter(booking.pickupDateTime);

      return matchesSearch && matchesStatus && matchesDate;
    });

    // Apply sorting
    filtered = this.sortBookings(filtered);
    
    // Calculate pagination
    this.totalBookings = filtered.length;
    this.totalPages = Math.ceil(this.totalBookings / this.pageSize);
    
    // Apply pagination
    const startIndex = (this.currentPage - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    this.filteredBookings = filtered.slice(startIndex, endIndex);
  }

  /**
   * Sort bookings based on sortBy criteria
   */
  private sortBookings(bookings: Booking[]): Booking[] {
    return bookings.sort((a, b) => {
      switch (this.sortBy) {
        case 'date-desc':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'date-asc':
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case 'amount':
          return b.totalAmount - a.totalAmount;
        case 'status':
          return a.status.localeCompare(b.status);
        default:
          return 0;
      }
    });
  }

  // Check date filter
  private checkDateFilter(bookingDate: Date): boolean {
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - bookingDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    switch (this.dateFilter) {
      case 'today':
        return diffDays <= 1;
      case 'week':
        return diffDays <= 7;
      case 'month':
        return diffDays <= 30;
      default:
        return true;
    }
  }

  // Booking operations
  openBookingDetails(booking: Booking): void {
    this.selectedBooking = booking;
    this.showBookingModal = true;
  }

  trackBooking(booking: Booking): void {
    if (booking.status === 'in-transit' || booking.status === 'confirmed') {
      // Mock tracking data
      this.trackingInfo = {
        bookingId: booking.id,
        currentLocation: {
          latitude: 40.7128,
          longitude: -74.0060,
          address: 'En route to destination'
        },
        estimatedArrival: new Date(Date.now() + 45 * 60 * 1000), // 45 minutes from now
        status: 'On schedule',
        lastUpdate: new Date(),
        currentStatus: 'On schedule'
      };
      this.selectedBooking = booking;
      this.showTrackingModal = true;
    }
  }

  /**
   * Cancel booking
   */
  cancelBooking(booking: Booking): void {
    if (booking.status === 'pending' || booking.status === 'confirmed') {
      const reason = prompt(`Please provide a reason for cancelling booking ${booking.bookingNumber}:`);
      if (reason) {
        this.bookingService.cancelBooking(booking.id, reason, this.customerId)
          .pipe(takeUntil(this.destroy$))
          .subscribe({
            next: (success) => {
              if (success) {
                console.log('✅ Booking cancelled successfully');
                booking.status = 'cancelled';
                booking.updatedAt = new Date();
                this.filterBookings();
                this.calculateSummary();
              } else {
                alert('Failed to cancel booking. Please try again.');
              }
            },
            error: (error) => {
              console.error('❌ Error cancelling booking:', error);
              alert('Error cancelling booking. Please try again.');
            }
          });
      }
    }
  }

  rebookService(booking: Booking): void {
    // Navigate to booking form with pre-filled data
    console.log('Rebooking service for:', booking.bookingNumber);
    // Implementation depends on routing structure
  }

  downloadInvoice(booking: Booking): void {
    if (booking.paymentStatus === 'paid') {
      console.log('Downloading invoice for:', booking.bookingNumber);
      // Implementation for invoice download
    }
  }

  // Modal controls
  closeBookingModal(): void {
    this.showBookingModal = false;
    this.selectedBooking = null;
  }

  closeTrackingModal(): void {
    this.showTrackingModal = false;
    this.trackingInfo = null;
    this.selectedBooking = null;
  }

  // Utility methods
  getStatusClass(status: string): string {
    switch (status) {
      case 'pending': return 'status-pending';
      case 'confirmed': return 'status-confirmed';
      case 'in-transit': return 'status-in-transit';
      case 'completed': return 'status-completed';
      case 'cancelled': return 'status-cancelled';
      default: return 'status-pending';
    }
  }

  getPaymentStatusClass(status: string): string {
    switch (status) {
      case 'pending': return 'payment-pending';
      case 'paid': return 'payment-paid';
      case 'failed': return 'payment-failed';
      case 'refunded': return 'payment-refunded';
      default: return 'payment-pending';
    }
  }

  getVehicleTypeIcon(type: string): string {
    switch (type) {
      case 'truck': return 'fas fa-truck';
      case 'van': return 'fas fa-shuttle-van';
      case 'pickup': return 'fas fa-truck-pickup';
      case 'heavy-truck': return 'fas fa-truck-moving';
      default: return 'fas fa-truck';
    }
  }

  canCancel(booking: Booking): boolean {
    return booking.status === 'pending' || booking.status === 'confirmed';
  }

  canTrack(booking: Booking): boolean {
    return booking.status === 'in-transit' || booking.status === 'confirmed';
  }

  canDownloadInvoice(booking: Booking): boolean {
    return booking.paymentStatus === 'paid';
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  }

  formatDistance(distance: number): string {
    return `${distance.toFixed(1)} km`;
  }

  // Additional utility methods for HTML template
  getStatusBadgeClass(status: string): string {
    const statusClasses = {
      'pending': 'badge-warning',
      'confirmed': 'badge-info',
      'in-transit': 'badge-primary',
      'completed': 'badge-success',
      'cancelled': 'badge-danger'
    };
    return statusClasses[status as keyof typeof statusClasses] || 'badge-secondary';
  }

  getStatusText(status: string): string {
    const statusTexts = {
      'pending': 'Pending',
      'confirmed': 'Confirmed',
      'in-transit': 'In Transit',
      'completed': 'Completed',
      'cancelled': 'Cancelled'
    };
    return statusTexts[status as keyof typeof statusTexts] || status;
  }

  formatDateTime(date: Date): string {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  }

  formatDate(date: Date): string {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(date);
  }

  /**
   * Export bookings to CSV/Excel
   */
  exportBookings() {
    console.log('Exporting bookings...');
    
    const headers = [
      'Booking Number', 'Date', 'Pickup Location', 'Dropoff Location', 
      'Vehicle Type', 'Status', 'Amount', 'Payment Status'
    ];
    
    const csvData = this.filteredBookings.map(booking => [
      booking.bookingNumber,
      this.formatDate(booking.createdAt),
      booking.pickupLocation,
      booking.dropoffLocation,
      this.getVehicleTypeName(booking.vehicleType),
      this.getStatusText(booking.status),
      this.formatCurrency(booking.totalAmount),
      booking.paymentStatus
    ]);
    
    const csvContent = [headers, ...csvData]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `bookings-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    window.URL.revokeObjectURL(url);
  }

  refreshBookings() {
    console.log('Refreshing bookings...');
    this.isRefreshing = true;
    this.loadBookingsData();
    setTimeout(() => this.isRefreshing = false, 1000);
  }

  goToPage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.filterBookings();
    }
  }

  getVehicleTypeName(type: string): string {
    const typeNames = {
      'car': 'Car',
      'van': 'Van',
      'truck': 'Truck',
      'pickup': 'Pickup Truck',
      'motorcycle': 'Motorcycle'
    };
    return typeNames[type as keyof typeof typeNames] || type;
  }

  getProgressPercentage(status: string): number {
    const progressMap = {
      'pending': 25,
      'confirmed': 50,
      'in-transit': 75,
      'completed': 100,
      'cancelled': 0
    };
    return progressMap[status as keyof typeof progressMap] || 0;
  }

  getProgressClass(status: string): string {
    const classMap = {
      'pending': 'progress-warning',
      'confirmed': 'progress-info',
      'in-transit': 'progress-primary',
      'completed': 'progress-success',
      'cancelled': 'progress-danger'
    };
    return classMap[status as keyof typeof classMap] || 'progress-secondary';
  }

  shareBooking(booking: Booking) {
    console.log('Sharing booking:', booking.bookingNumber);
    // Implementation for sharing booking details
  }

  applyFilters() {
    this.filterBookings();
  }

  resetFilters() {
    // Reset filters and reload bookings
    this.searchQuery = '';
    this.statusFilter = 'all';
    this.dateFilter = 'all';
    this.sortBy = 'date-desc';
    this.currentPage = 1;
    this.filterBookings();
  }

  // Additional missing methods
  viewBookingDetails(booking: Booking) {
    this.openBookingDetails(booking);
  }

  getTimelineMarkerClass(status: string): string {
    const markerClasses = {
      'pending': 'timeline-warning',
      'confirmed': 'timeline-info',
      'in-transit': 'timeline-primary',
      'completed': 'timeline-success',
      'cancelled': 'timeline-danger'
    };
    return markerClasses[status as keyof typeof markerClasses] || 'timeline-secondary';
  }



  // Additional methods needed by HTML template
  canTrackBooking(booking: Booking): boolean {
    return booking.status === 'in-transit' || booking.status === 'confirmed';
  }

  canCancelBooking(booking: Booking): boolean {
    return booking.status === 'pending' || booking.status === 'confirmed';
  }

  getPaginationPages(): number[] {
    const pages: number[] = [];
    const maxPages = 5; // Show max 5 page numbers
    
    let startPage = Math.max(1, this.currentPage - Math.floor(maxPages / 2));
    let endPage = Math.min(this.totalPages, startPage + maxPages - 1);
    
    // Adjust start page if we're near the end
    if (endPage - startPage < maxPages - 1) {
      startPage = Math.max(1, endPage - maxPages + 1);
    }
    
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    
    return pages;
  }
}