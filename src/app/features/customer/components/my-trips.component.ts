import { Component, OnInit } from '@angular/core';

export interface CustomerTrip {
  id: string;
  tripNumber: string;
  bookingNumber: string;
  pickupLocation: string;
  dropLocation: string;
  pickupAddress: string;
  dropAddress: string;
  pickupDateTime: Date;
  dropDateTime?: Date;
  status: 'booked' | 'confirmed' | 'in-transit' | 'completed' | 'cancelled';
  vehicleType: 'truck' | 'van' | 'pickup' | 'heavy-truck';
  driver?: {
    id: string;
    name: string;
    phone: string;
    rating: number;
    profileImage?: string;
  };
  vehicle?: {
    id: string;
    registrationNumber: string;
    make: string;
    model: string;
    type: string;
  };
  estimatedCost: number;
  actualCost?: number;
  distance: number;
  estimatedDuration: number; // in hours
  actualDuration?: number;
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  specialInstructions?: string;
  createdAt: Date;
  updatedAt: Date;
  trackingInfo?: {
    currentLocation?: string;
    estimatedArrival?: Date;
    progress: number; // percentage
    lastUpdate: Date;
  };
}

export interface TripSummary {
  total: number;
  active: number;
  completed: number;
  cancelled: number;
}

export interface TripFilter {
  status: string;
  dateRange: 'today' | 'week' | 'month' | 'all';
  searchTerm: string;
}

@Component({
  selector: 'app-my-trips',
  templateUrl: './my-trips.component.html',
  styleUrls: ['./my-trips.component.scss']
})
export class MyTripsComponent implements OnInit {
  // Component state
  trips: CustomerTrip[] = [];
  filteredTrips: CustomerTrip[] = [];
  selectedTrip: CustomerTrip | null = null;
  tripSummary: TripSummary = {
    total: 0,
    active: 0,
    completed: 0,
    cancelled: 0
  };
  
  // Modal controls
  showTripModal: boolean = false;
  showTrackingModal: boolean = false;
  
  // Filters and search
  filter: TripFilter = {
    status: 'all',
    dateRange: 'all',
    searchTerm: ''
  };
  
  // Filter options
  statusOptions = [
    { value: 'all', label: 'All Status' },
    { value: 'booked', label: 'Booked' },
    { value: 'confirmed', label: 'Confirmed' },
    { value: 'in-transit', label: 'In Transit' },
    { value: 'completed', label: 'Completed' },
    { value: 'cancelled', label: 'Cancelled' }
  ];

  dateRangeOptions = [
    { value: 'all', label: 'All Time' },
    { value: 'today', label: 'Today' },
    { value: 'week', label: 'This Week' },
    { value: 'month', label: 'This Month' }
  ];
  
  // Loading states
  isLoading: boolean = false;

  constructor() {}

  ngOnInit(): void {
    this.loadTrips();
  }

  // Load trips data
  loadTrips(): void {
    this.isLoading = true;
    
    // Mock data - replace with actual service call
    setTimeout(() => {
      this.trips = [
        {
          id: 'CT-001',
          tripNumber: 'TR-2024-001',
          bookingNumber: 'BK-2024-001',
          pickupLocation: 'Mumbai Central',
          dropLocation: 'Delhi Red Fort',
          pickupAddress: 'Platform 1, Mumbai Central Station, Mumbai',
          dropAddress: 'Red Fort Area, Delhi',
          pickupDateTime: new Date('2024-01-20T10:00:00'),
          dropDateTime: new Date('2024-01-21T08:00:00'),
          status: 'completed',
          vehicleType: 'truck',
          driver: {
            id: 'DRV-001',
            name: 'Rajesh Sharma',
            phone: '+91 9876543210',
            rating: 4.8,
            profileImage: 'https://via.placeholder.com/50x50/4299e1/ffffff?text=RS'
          },
          vehicle: {
            id: 'VEH-001',
            registrationNumber: 'MH-12-AB-1234',
            make: 'Tata',
            model: 'LPT 1613',
            type: 'Medium Truck'
          },
          estimatedCost: 15000,
          actualCost: 14500,
          distance: 1400,
          estimatedDuration: 22,
          actualDuration: 20,
          paymentStatus: 'paid',
          specialInstructions: 'Handle electronics with care',
          createdAt: new Date('2024-01-19T15:30:00'),
          updatedAt: new Date('2024-01-21T08:30:00'),
          trackingInfo: {
            currentLocation: 'Delivered at Delhi Red Fort',
            progress: 100,
            lastUpdate: new Date('2024-01-21T08:30:00')
          }
        },
        {
          id: 'CT-002',
          tripNumber: 'TR-2024-002',
          bookingNumber: 'BK-2024-002',
          pickupLocation: 'Pune IT Park',
          dropLocation: 'Bangalore Electronic City',
          pickupAddress: 'Phase 2, Rajiv Gandhi IT Park, Pune',
          dropAddress: 'Electronic City, Bangalore',
          pickupDateTime: new Date('2024-01-22T14:00:00'),
          status: 'in-transit',
          vehicleType: 'van',
          driver: {
            id: 'DRV-002',
            name: 'Amit Patel',
            phone: '+91 9876543211',
            rating: 4.6,
            profileImage: 'https://via.placeholder.com/50x50/48bb78/ffffff?text=AP'
          },
          vehicle: {
            id: 'VEH-002',
            registrationNumber: 'MH-14-CD-5678',
            make: 'Mahindra',
            model: 'Bolero Pickup',
            type: 'Pickup Truck'
          },
          estimatedCost: 8500,
          distance: 850,
          estimatedDuration: 14,
          paymentStatus: 'pending',
          specialInstructions: 'Delivery before 6 PM',
          createdAt: new Date('2024-01-21T11:15:00'),
          updatedAt: new Date('2024-01-22T14:15:00'),
          trackingInfo: {
            currentLocation: 'Near Solapur - 65% complete',
            estimatedArrival: new Date('2024-01-23T02:00:00'),
            progress: 65,
            lastUpdate: new Date('2024-01-22T16:30:00')
          }
        },
        {
          id: 'CT-003',
          tripNumber: 'TR-2024-003',
          bookingNumber: 'BK-2024-003',
          pickupLocation: 'Chennai Port',
          dropLocation: 'Coimbatore Industrial Area',
          pickupAddress: 'Chennai Port Trust, Chennai',
          dropAddress: 'Coimbatore Industrial Estate',
          pickupDateTime: new Date('2024-01-25T08:00:00'),
          status: 'confirmed',
          vehicleType: 'heavy-truck',
          estimatedCost: 12000,
          distance: 500,
          estimatedDuration: 10,
          paymentStatus: 'pending',
          specialInstructions: 'Heavy machinery - handle with care',
          createdAt: new Date('2024-01-24T10:20:00'),
          updatedAt: new Date('2024-01-24T10:20:00')
        },
        {
          id: 'CT-004',
          tripNumber: 'TR-2024-004',
          bookingNumber: 'BK-2024-004',
          pickupLocation: 'Kolkata Salt Lake',
          dropLocation: 'Bhubaneswar Railway Station',
          pickupAddress: 'Salt Lake City, Kolkata',
          dropAddress: 'Bhubaneswar Railway Station, Bhubaneswar',
          pickupDateTime: new Date('2024-01-18T12:00:00'),
          dropDateTime: new Date('2024-01-18T20:00:00'),
          status: 'completed',
          vehicleType: 'van',
          driver: {
            id: 'DRV-003',
            name: 'Subrata Das',
            phone: '+91 9876543212',
            rating: 4.9,
            profileImage: 'https://via.placeholder.com/50x50/ed8936/ffffff?text=SD'
          },
          vehicle: {
            id: 'VEH-003',
            registrationNumber: 'WB-06-EF-9012',
            make: 'Ashok Leyland',
            model: 'Dost',
            type: 'Small Truck'
          },
          estimatedCost: 6500,
          actualCost: 6500,
          distance: 450,
          estimatedDuration: 8,
          actualDuration: 8,
          paymentStatus: 'paid',
          createdAt: new Date('2024-01-17T14:45:00'),
          updatedAt: new Date('2024-01-18T20:15:00'),
          trackingInfo: {
            currentLocation: 'Delivered at Bhubaneswar Railway Station',
            progress: 100,
            lastUpdate: new Date('2024-01-18T20:15:00')
          }
        }
      ];
      
      this.calculateSummary();
      this.applyFilters();
      this.isLoading = false;
    }, 1000);
  }

  // Calculate summary statistics
  calculateSummary(): void {
    this.tripSummary = {
      total: this.trips.length,
      active: this.trips.filter(t => t.status === 'in-transit' || t.status === 'confirmed').length,
      completed: this.trips.filter(t => t.status === 'completed').length,
      cancelled: this.trips.filter(t => t.status === 'cancelled').length
    };
  }

  // Apply filters
  applyFilters(): void {
    this.filteredTrips = this.trips.filter(trip => {
      const matchesSearch = !this.filter.searchTerm ||
        trip.tripNumber.toLowerCase().includes(this.filter.searchTerm.toLowerCase()) ||
        trip.bookingNumber.toLowerCase().includes(this.filter.searchTerm.toLowerCase()) ||
        trip.pickupLocation.toLowerCase().includes(this.filter.searchTerm.toLowerCase()) ||
        trip.dropLocation.toLowerCase().includes(this.filter.searchTerm.toLowerCase());

      const matchesStatus = this.filter.status === 'all' || trip.status === this.filter.status;

      const matchesDate = this.filter.dateRange === 'all' || this.checkDateFilter(trip.pickupDateTime);

      return matchesSearch && matchesStatus && matchesDate;
    });

    // Sort by pickup date (newest first)
    this.filteredTrips.sort((a, b) => b.pickupDateTime.getTime() - a.pickupDateTime.getTime());
  }

  // Check date filter
  private checkDateFilter(tripDate: Date): boolean {
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - tripDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    switch (this.filter.dateRange) {
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

  // Clear filters
  clearFilters(): void {
    this.filter = {
      status: 'all',
      dateRange: 'all',
      searchTerm: ''
    };
    this.applyFilters();
  }

  // Trip operations
  openTripDetails(trip: CustomerTrip): void {
    this.selectedTrip = trip;
    this.showTripModal = true;
  }

  trackTrip(trip: CustomerTrip): void {
    if (trip.status === 'in-transit' || trip.status === 'confirmed') {
      this.selectedTrip = trip;
      this.showTrackingModal = true;
    }
  }

  cancelTrip(trip: CustomerTrip): void {
    if (trip.status === 'booked' || trip.status === 'confirmed') {
      if (confirm(`Are you sure you want to cancel trip ${trip.tripNumber}?`)) {
        trip.status = 'cancelled';
        trip.updatedAt = new Date();
        this.calculateSummary();
        this.applyFilters();
      }
    }
  }

  rebookTrip(trip: CustomerTrip): void {
    // Navigate to booking form with pre-filled data
    console.log('Rebooking trip:', trip.tripNumber);
    // Implementation depends on routing structure
  }

  downloadInvoice(trip: CustomerTrip): void {
    if (trip.paymentStatus === 'paid') {
      console.log('Downloading invoice for trip:', trip.tripNumber);
      // Implementation for invoice download
    }
  }

  callDriver(trip: CustomerTrip): void {
    if (trip.driver?.phone) {
      window.open(`tel:${trip.driver.phone}`, '_self');
    }
  }

  getDirections(trip: CustomerTrip): void {
    const destination = encodeURIComponent(trip.dropAddress || trip.dropLocation);
    const origin = encodeURIComponent(trip.pickupAddress || trip.pickupLocation);
    window.open(`https://www.google.com/maps/dir/${origin}/${destination}`, '_blank');
  }

  shareTrip(trip: CustomerTrip): void {
    if (navigator.share) {
      navigator.share({
        title: `Trip ${trip.tripNumber}`,
        text: `${trip.pickupLocation} to ${trip.dropLocation}`,
        url: window.location.href
      });
    } else {
      // Fallback for browsers without Web Share API
      navigator.clipboard.writeText(`Trip ${trip.tripNumber}: ${trip.pickupLocation} to ${trip.dropLocation}`);
      console.log('Trip details copied to clipboard');
    }
  }

  // Modal controls
  closeTripModal(): void {
    this.showTripModal = false;
    this.selectedTrip = null;
  }

  closeTrackingModal(): void {
    this.showTrackingModal = false;
    this.selectedTrip = null;
  }

  // Utility methods
  getStatusClass(status: string): string {
    const statusClasses = {
      'booked': 'status-booked',
      'confirmed': 'status-confirmed',
      'in-transit': 'status-in-transit',
      'completed': 'status-completed',
      'cancelled': 'status-cancelled'
    };
    return statusClasses[status as keyof typeof statusClasses] || 'status-pending';
  }

  getStatusText(status: string): string {
    const statusTexts = {
      'booked': 'Booked',
      'confirmed': 'Confirmed',
      'in-transit': 'In Transit',
      'completed': 'Completed',
      'cancelled': 'Cancelled'
    };
    return statusTexts[status as keyof typeof statusTexts] || status;
  }

  getPaymentStatusClass(status: string): string {
    const statusClasses = {
      'pending': 'payment-pending',
      'paid': 'payment-paid',
      'failed': 'payment-failed',
      'refunded': 'payment-refunded'
    };
    return statusClasses[status as keyof typeof statusClasses] || 'payment-pending';
  }

  getVehicleTypeIcon(type: string): string {
    const typeIcons = {
      'truck': '🚛',
      'van': '🚐',
      'pickup': '🛻',
      'heavy-truck': '🚚'
    };
    return typeIcons[type as keyof typeof typeIcons] || '🚛';
  }

  canCancel(trip: CustomerTrip): boolean {
    return trip.status === 'booked' || trip.status === 'confirmed';
  }

  canTrack(trip: CustomerTrip): boolean {
    return trip.status === 'in-transit' || trip.status === 'confirmed';
  }

  canDownloadInvoice(trip: CustomerTrip): boolean {
    return trip.paymentStatus === 'paid';
  }

  canCallDriver(trip: CustomerTrip): boolean {
    return !!trip.driver?.phone && (trip.status === 'confirmed' || trip.status === 'in-transit');
  }

  // Formatting utilities
  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  }

  formatDistance(distance: number): string {
    return `${distance.toFixed(0)} km`;
  }

  formatDuration(hours: number): string {
    const h = Math.floor(hours);
    const m = Math.round((hours - h) * 60);
    return `${h}h ${m}m`;
  }

  formatDateTime(date: Date): string {
    return new Intl.DateTimeFormat('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  }

  formatDate(date: Date): string {
    return new Intl.DateTimeFormat('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(date);
  }

  formatTime(date: Date): string {
    return new Intl.DateTimeFormat('en-IN', {
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  }

  getTimeAgo(date: Date): string {
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
    const diffMinutes = Math.floor(diffTime / (1000 * 60));

    if (diffDays > 0) {
      return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    } else if (diffHours > 0) {
      return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    } else if (diffMinutes > 0) {
      return `${diffMinutes} minute${diffMinutes > 1 ? 's' : ''} ago`;
    } else {
      return 'Just now';
    }
  }

  getTotalEarnings(): number {
    return this.trips
      .filter(t => t.status === 'completed' && t.actualCost)
      .reduce((total, t) => total + (t.actualCost || 0), 0);
  }

  refreshTrips(): void {
    this.loadTrips();
  }

  exportTrips(): void {
    console.log('Exporting trips data...');
    // Implementation for exporting trips to PDF/Excel
  }
}
