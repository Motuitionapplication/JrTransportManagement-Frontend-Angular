import { Component, OnInit } from '@angular/core';

export interface DriverBooking {
  id: string;
  bookingNumber: string;
  customerName: string;
  pickupLocation: string;
  dropLocation: string;
  pickupDate: Date;
  status: 'pending' | 'accepted' | 'in-transit' | 'delivered' | 'cancelled';
  vehicleType: string;
  distance: number;
  estimatedEarnings: number;
  cargoType: string;
  weight: number;
  customerPhone: string;
  specialInstructions?: string;
}

export interface BookingFilter {
  status: string;
  dateRange: 'today' | 'week' | 'month' | 'all';
  searchTerm: string;
}

@Component({
  selector: 'app-driver-bookings',
  templateUrl: './driver-bookings.component.html',
  styleUrls: ['./driver-bookings.component.scss']
})
export class DriverBookingsComponent implements OnInit {
  bookings: DriverBooking[] = [];
  filteredBookings: DriverBooking[] = [];
  isLoading = false;

  filter: BookingFilter = {
    status: 'all',
    dateRange: 'all',
    searchTerm: ''
  };

  statusOptions = [
    { value: 'all', label: 'All Status' },
    { value: 'pending', label: 'Pending' },
    { value: 'accepted', label: 'Accepted' },
    { value: 'in-transit', label: 'In Transit' },
    { value: 'delivered', label: 'Delivered' },
    { value: 'cancelled', label: 'Cancelled' }
  ];

  dateRangeOptions = [
    { value: 'all', label: 'All Time' },
    { value: 'today', label: 'Today' },
    { value: 'week', label: 'This Week' },
    { value: 'month', label: 'This Month' }
  ];

  constructor() { }

  ngOnInit(): void {
    this.loadBookings();
  }

  /**
   * Load driver's bookings from service
   */
  loadBookings(): void {
    this.isLoading = true;
    
    // Mock data - replace with actual service call
    setTimeout(() => {
      this.bookings = [
        {
          id: '1',
          bookingNumber: 'BK001',
          customerName: 'John Smith',
          pickupLocation: 'Mumbai Central Station',
          dropLocation: 'Delhi Red Fort',
          pickupDate: new Date('2024-01-15T10:00:00'),
          status: 'accepted',
          vehicleType: 'Medium Truck',
          distance: 1400,
          estimatedEarnings: 15000,
          cargoType: 'Electronics',
          weight: 500,
          customerPhone: '+91 9876543210',
          specialInstructions: 'Handle with care - fragile items'
        },
        {
          id: '2',
          bookingNumber: 'BK002',
          customerName: 'Priya Sharma',
          pickupLocation: 'Pune IT Park',
          dropLocation: 'Bangalore Electronic City',
          pickupDate: new Date('2024-01-16T14:00:00'),
          status: 'pending',
          vehicleType: 'Large Truck',
          distance: 850,
          estimatedEarnings: 12000,
          cargoType: 'Furniture',
          weight: 800,
          customerPhone: '+91 9876543211'
        },
        {
          id: '3',
          bookingNumber: 'BK003',
          customerName: 'Rajesh Kumar',
          pickupLocation: 'Chennai Port',
          dropLocation: 'Coimbatore Industrial Area',
          pickupDate: new Date('2024-01-14T08:00:00'),
          status: 'in-transit',
          vehicleType: 'Medium Truck',
          distance: 500,
          estimatedEarnings: 8000,
          cargoType: 'Raw Materials',
          weight: 600,
          customerPhone: '+91 9876543212',
          specialInstructions: 'Delivery before 6 PM'
        },
        {
          id: '4',
          bookingNumber: 'BK004',
          customerName: 'Meera Patel',
          pickupLocation: 'Ahmedabad Market',
          dropLocation: 'Surat Diamond Market',
          pickupDate: new Date('2024-01-12T11:00:00'),
          status: 'delivered',
          vehicleType: 'Small Truck',
          distance: 280,
          estimatedEarnings: 4500,
          cargoType: 'Textiles',
          weight: 300,
          customerPhone: '+91 9876543213'
        },
        {
          id: '5',
          bookingNumber: 'BK005',
          customerName: 'Amit Singh',
          pickupLocation: 'Kolkata Salt Lake',
          dropLocation: 'Bhubaneswar Station',
          pickupDate: new Date('2024-01-11T16:00:00'),
          status: 'cancelled',
          vehicleType: 'Medium Truck',
          distance: 450,
          estimatedEarnings: 7000,
          cargoType: 'Medical Supplies',
          weight: 400,
          customerPhone: '+91 9876543214'
        }
      ];
      
      this.filteredBookings = [...this.bookings];
      this.isLoading = false;
    }, 1000);
  }

  /**
   * Apply filters to bookings list
   */
  applyFilters(): void {
    this.filteredBookings = this.bookings.filter(booking => {
      // Status filter
      if (this.filter.status !== 'all' && booking.status !== this.filter.status) {
        return false;
      }

      // Date range filter
      if (this.filter.dateRange !== 'all') {
        const bookingDate = new Date(booking.pickupDate);
        const now = new Date();
        
        switch (this.filter.dateRange) {
          case 'today':
            if (bookingDate.toDateString() !== now.toDateString()) {
              return false;
            }
            break;
          case 'week':
            const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            if (bookingDate < weekAgo) {
              return false;
            }
            break;
          case 'month':
            const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
            if (bookingDate < monthAgo) {
              return false;
            }
            break;
        }
      }

      // Search term filter
      if (this.filter.searchTerm) {
        const searchLower = this.filter.searchTerm.toLowerCase();
        const searchableText = `${booking.bookingNumber} ${booking.customerName} ${booking.pickupLocation} ${booking.dropLocation} ${booking.cargoType}`.toLowerCase();
        if (!searchableText.includes(searchLower)) {
          return false;
        }
      }

      return true;
    });
  }

  /**
   * Clear all filters
   */
  clearFilters(): void {
    this.filter = {
      status: 'all',
      dateRange: 'all',
      searchTerm: ''
    };
    this.applyFilters();
  }

  /**
   * Accept a pending booking
   */
  acceptBooking(booking: DriverBooking): void {
    if (booking.status === 'pending') {
      booking.status = 'accepted';
      // Call API to accept booking
      console.log('Accepting booking:', booking.bookingNumber);
    }
  }

  /**
   * Start trip for accepted booking
   */
  startTrip(booking: DriverBooking): void {
    if (booking.status === 'accepted') {
      booking.status = 'in-transit';
      // Call API to start trip
      console.log('Starting trip:', booking.bookingNumber);
    }
  }

  /**
   * Complete delivery
   */
  completeDelivery(booking: DriverBooking): void {
    if (booking.status === 'in-transit') {
      booking.status = 'delivered';
      // Call API to complete delivery
      console.log('Completing delivery:', booking.bookingNumber);
    }
  }

  /**
   * Cancel booking
   */
  cancelBooking(booking: DriverBooking): void {
    if (booking.status === 'pending' || booking.status === 'accepted') {
      booking.status = 'cancelled';
      // Call API to cancel booking
      console.log('Cancelling booking:', booking.bookingNumber);
    }
  }

  /**
   * Call customer
   */
  callCustomer(booking: DriverBooking): void {
    // Open phone app with customer number
    window.open(`tel:${booking.customerPhone}`, '_self');
  }

  /**
   * Get navigation directions
   */
  getDirections(booking: DriverBooking): void {
    // Open maps with directions
    const destination = encodeURIComponent(booking.dropLocation);
    const origin = encodeURIComponent(booking.pickupLocation);
    window.open(`https://www.google.com/maps/dir/${origin}/${destination}`, '_blank');
  }

  /**
   * View booking details
   */
  viewDetails(booking: DriverBooking): void {
    console.log('Viewing details for booking:', booking.bookingNumber);
    // Navigate to booking details page or open modal
  }

  /**
   * Get status color class
   */
  getStatusColor(status: string): string {
    switch (status) {
      case 'pending': return 'status-pending';
      case 'accepted': return 'status-accepted';
      case 'in-transit': return 'status-in-transit';
      case 'delivered': return 'status-delivered';
      case 'cancelled': return 'status-cancelled';
      default: return '';
    }
  }

  /**
   * Get status display text
   */
  getStatusText(status: string): string {
    switch (status) {
      case 'pending': return 'Pending';
      case 'accepted': return 'Accepted';
      case 'in-transit': return 'In Transit';
      case 'delivered': return 'Delivered';
      case 'cancelled': return 'Cancelled';
      default: return status;
    }
  }

  /**
   * Check if action is available for booking status
   */
  canAccept(booking: DriverBooking): boolean {
    return booking.status === 'pending';
  }

  canStartTrip(booking: DriverBooking): boolean {
    return booking.status === 'accepted';
  }

  canCompleteDelivery(booking: DriverBooking): boolean {
    return booking.status === 'in-transit';
  }

  canCancel(booking: DriverBooking): boolean {
    return booking.status === 'pending' || booking.status === 'accepted';
  }

  /**
   * Calculate total earnings from filtered bookings
   */
  getTotalEarnings(): number {
    return this.filteredBookings.reduce((sum, booking) => sum + booking.estimatedEarnings, 0);
  }
}