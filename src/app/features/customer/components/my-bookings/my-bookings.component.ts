import { Component, OnInit } from '@angular/core';

export interface BookingSummary {
  total: number;
  pending: number;
  inTransit: number;
  completed: number;
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
export class MyBookingsComponent implements OnInit {
  // Component state
  bookings: Booking[] = [];
  filteredBookings: Booking[] = [];
  selectedBooking: Booking | null = null;
  bookingSummary: BookingSummary = {
    total: 0,
    pending: 0,
    inTransit: 0,
    completed: 0
  };
  
  // Modal controls
  showBookingModal: boolean = false;
  showTrackingModal: boolean = false;
  
  // Filters and search
  searchQuery: string = '';
  statusFilter: string = 'all';
  dateFilter: string = 'all';
  sortBy: string = 'date';
  
  // Pagination
  currentPage: number = 1;
  totalPages: number = 1;
  pageNumbers: number[] = [];
  
  // Tracking data
  trackingInfo: TrackingInfo | null = null;
  
  // Loading states
  isLoading: boolean = false;

  constructor() {}

  ngOnInit(): void {
    this.loadBookings();
  }

  // Load bookings data
  loadBookings(): void {
    // Mock data - replace with actual API call
    this.bookings = [
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
    this.filterBookings();
  }

  // Filter bookings based on search and filters
  filterBookings(): void {
    this.filteredBookings = this.bookings.filter(booking => {
      const matchesSearch = !this.searchQuery ||
        booking.bookingNumber.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        booking.pickupLocation.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        booking.dropoffLocation.toLowerCase().includes(this.searchQuery.toLowerCase());

      const matchesStatus = this.statusFilter === 'all' || booking.status === this.statusFilter;

      const matchesDate = this.dateFilter === 'all' || this.checkDateFilter(booking.pickupDateTime);

      return matchesSearch && matchesStatus && matchesDate;
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

  cancelBooking(booking: Booking): void {
    if (booking.status === 'pending' || booking.status === 'confirmed') {
      if (confirm(`Are you sure you want to cancel booking ${booking.bookingNumber}?`)) {
        booking.status = 'cancelled';
        booking.updatedAt = new Date();
        this.filterBookings();
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

  exportBookings() {
    console.log('Exporting bookings...');
    // Implementation for exporting bookings to PDF/Excel
  }

  refreshBookings() {
    console.log('Refreshing bookings...');
    this.loadBookings();
  }

  goToPage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.loadBookings();
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
    this.loadBookings();
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
    for (let i = 1; i <= this.totalPages; i++) {
      pages.push(i);
    }
    return pages;
  }
}