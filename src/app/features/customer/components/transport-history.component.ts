import { Component, OnInit } from '@angular/core';

// Transport History Interfaces
interface TransportHistoryTrip {
  id: string;
  bookingNumber: string;
  tripNumber: string;
  pickupLocation: string;
  pickupAddress: string;
  dropLocation: string;
  dropAddress: string;
  bookingDate: Date;
  travelDate: Date;
  completionDate: Date;
  status: 'completed' | 'cancelled' | 'refunded';
  totalAmount: number;
  distance: number;
  duration: number;
  paymentStatus: 'paid' | 'pending' | 'refunded';
  paymentMethod: string;
  driver: {
    id: string;
    name: string;
    phone: string;
    profileImage?: string;
    rating: number;
  };
  vehicle: {
    id: string;
    registrationNumber: string;
    make: string;
    model: string;
    type: string;
  };
  ratings?: {
    driverRating: number;
    serviceRating: number;
    comment?: string;
  };
  feedback?: string;
  invoice?: {
    id: string;
    downloadUrl: string;
    generatedDate: Date;
  };
}

interface TransportHistoryFilter {
  searchTerm: string;
  status: string;
  dateRange: string;
  paymentStatus: string;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
}

interface TransportHistoryStats {
  totalTrips: number;
  totalDistance: number;
  totalAmountSpent: number;
  averageRating: number;
  completedTrips: number;
  cancelledTrips: number;
}

@Component({
  selector: 'app-transport-history',
  templateUrl: './transport-history.component.html',
  styleUrls: ['./transport-history.component.scss']
})
export class TransportHistoryComponent implements OnInit {
  // Component Properties
  historyTrips: TransportHistoryTrip[] = [];
  filteredTrips: TransportHistoryTrip[] = [];
  stats: TransportHistoryStats = {
    totalTrips: 0,
    totalDistance: 0,
    totalAmountSpent: 0,
    averageRating: 0,
    completedTrips: 0,
    cancelledTrips: 0
  };
  
  // UI State
  isLoading = true;
  showTripModal = false;
  showInvoiceModal = false;
  selectedTrip: TransportHistoryTrip | null = null;
  
  // Filters
  filter: TransportHistoryFilter = {
    searchTerm: '',
    status: 'all',
    dateRange: 'all',
    paymentStatus: 'all',
    sortBy: 'completionDate',
    sortOrder: 'desc'
  };
  
  // Filter Options
  statusOptions = [
    { value: 'all', label: 'All Status' },
    { value: 'completed', label: 'Completed' },
    { value: 'cancelled', label: 'Cancelled' },
    { value: 'refunded', label: 'Refunded' }
  ];
  
  dateRangeOptions = [
    { value: 'all', label: 'All Time' },
    { value: 'last-month', label: 'Last Month' },
    { value: 'last-3-months', label: 'Last 3 Months' },
    { value: 'last-6-months', label: 'Last 6 Months' },
    { value: 'this-year', label: 'This Year' },
    { value: 'custom', label: 'Custom Range' }
  ];
  
  paymentStatusOptions = [
    { value: 'all', label: 'All Payments' },
    { value: 'paid', label: 'Paid' },
    { value: 'pending', label: 'Pending' },
    { value: 'refunded', label: 'Refunded' }
  ];
  
  sortOptions = [
    { value: 'completionDate', label: 'Completion Date' },
    { value: 'bookingDate', label: 'Booking Date' },
    { value: 'totalAmount', label: 'Amount' },
    { value: 'distance', label: 'Distance' },
    { value: 'ratings.serviceRating', label: 'Rating' }
  ];

  constructor() { }

  ngOnInit(): void {
    this.loadTransportHistory();
  }

  // Data Loading
  loadTransportHistory(): void {
    this.isLoading = true;
    
    // Simulate API call with mock data
    setTimeout(() => {
      this.historyTrips = this.getMockHistoryData();
      this.calculateStats();
      this.applyFilters();
      this.isLoading = false;
    }, 1500);
  }

  private getMockHistoryData(): TransportHistoryTrip[] {
    const now = new Date();
    return [
      {
        id: 'trip-001',
        bookingNumber: 'JR-2024-001',
        tripNumber: 'TRP-001',
        pickupLocation: 'Mumbai Central Railway Station',
        pickupAddress: 'Dr Dadabhai Naoroji Rd, Mumbai Central, Mumbai, Maharashtra 400008',
        dropLocation: 'Chhatrapati Shivaji Terminus',
        dropAddress: 'Fort, Mumbai, Maharashtra 400001',
        bookingDate: new Date(now.getTime() - 15 * 24 * 60 * 60 * 1000),
        travelDate: new Date(now.getTime() - 12 * 24 * 60 * 60 * 1000),
        completionDate: new Date(now.getTime() - 12 * 24 * 60 * 60 * 1000 + 45 * 60 * 1000),
        status: 'completed',
        totalAmount: 450,
        distance: 12.5,
        duration: 45,
        paymentStatus: 'paid',
        paymentMethod: 'Credit Card',
        driver: {
          id: 'driver-001',
          name: 'Rajesh Kumar',
          phone: '+91 98765 43210',
          profileImage: 'https://via.placeholder.com/150x150/4CAF50/ffffff?text=RK',
          rating: 4.8
        },
        vehicle: {
          id: 'vehicle-001',
          registrationNumber: 'MH-01-AB-1234',
          make: 'Tata',
          model: 'Ace',
          type: 'Mini Truck'
        },
        ratings: {
          driverRating: 5,
          serviceRating: 4,
          comment: 'Great service, very professional driver!'
        },
        invoice: {
          id: 'inv-001',
          downloadUrl: '/api/invoices/inv-001.pdf',
          generatedDate: new Date(now.getTime() - 12 * 24 * 60 * 60 * 1000)
        }
      },
      {
        id: 'trip-002',
        bookingNumber: 'JR-2024-002',
        tripNumber: 'TRP-002',
        pickupLocation: 'Andheri East Metro Station',
        pickupAddress: 'Western Express Hwy, Andheri East, Mumbai, Maharashtra 400069',
        dropLocation: 'Bandra Kurla Complex',
        dropAddress: 'Bandra Kurla Complex, Bandra East, Mumbai, Maharashtra 400051',
        bookingDate: new Date(now.getTime() - 25 * 24 * 60 * 60 * 1000),
        travelDate: new Date(now.getTime() - 22 * 24 * 60 * 60 * 1000),
        completionDate: new Date(now.getTime() - 22 * 24 * 60 * 60 * 1000 + 35 * 60 * 1000),
        status: 'completed',
        totalAmount: 650,
        distance: 18.2,
        duration: 35,
        paymentStatus: 'paid',
        paymentMethod: 'UPI',
        driver: {
          id: 'driver-002',
          name: 'Suresh Patil',
          phone: '+91 87654 32109',
          profileImage: 'https://via.placeholder.com/150x150/2196F3/ffffff?text=SP',
          rating: 4.6
        },
        vehicle: {
          id: 'vehicle-002',
          registrationNumber: 'MH-02-CD-5678',
          make: 'Mahindra',
          model: 'Bolero Pickup',
          type: 'Pickup Truck'
        },
        ratings: {
          driverRating: 4,
          serviceRating: 5,
          comment: 'Excellent service and on-time delivery.'
        },
        invoice: {
          id: 'inv-002',
          downloadUrl: '/api/invoices/inv-002.pdf',
          generatedDate: new Date(now.getTime() - 22 * 24 * 60 * 60 * 1000)
        }
      },
      {
        id: 'trip-003',
        bookingNumber: 'JR-2024-003',
        tripNumber: 'TRP-003',
        pickupLocation: 'Thane Railway Station',
        pickupAddress: 'Station Rd, Naupada, Thane West, Thane, Maharashtra 400602',
        dropLocation: 'Navi Mumbai Airport',
        dropAddress: 'Navi Mumbai International Airport, Ulwe, Navi Mumbai, Maharashtra 410206',
        bookingDate: new Date(now.getTime() - 40 * 24 * 60 * 60 * 1000),
        travelDate: new Date(now.getTime() - 35 * 24 * 60 * 60 * 1000),
        completionDate: new Date(now.getTime() - 35 * 24 * 60 * 60 * 1000),
        status: 'cancelled',
        totalAmount: 850,
        distance: 0,
        duration: 0,
        paymentStatus: 'refunded',
        paymentMethod: 'Debit Card',
        driver: {
          id: 'driver-003',
          name: 'Amit Sharma',
          phone: '+91 76543 21098',
          rating: 4.2
        },
        vehicle: {
          id: 'vehicle-003',
          registrationNumber: 'MH-03-EF-9012',
          make: 'Tata',
          model: '407',
          type: 'Mini Truck'
        },
        feedback: 'Trip was cancelled due to vehicle breakdown. Full refund processed.'
      },
      {
        id: 'trip-004',
        bookingNumber: 'JR-2024-004',
        tripNumber: 'TRP-004',
        pickupLocation: 'Pune Railway Station',
        pickupAddress: 'Station Rd, Pune Railway Station Area, Pune, Maharashtra 411001',
        dropLocation: 'Mumbai International Airport',
        dropAddress: 'Chhatrapati Shivaji International Airport, Mumbai, Maharashtra 400099',
        bookingDate: new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000),
        travelDate: new Date(now.getTime() - 55 * 24 * 60 * 60 * 1000),
        completionDate: new Date(now.getTime() - 55 * 24 * 60 * 60 * 1000 + 180 * 60 * 1000),
        status: 'completed',
        totalAmount: 2500,
        distance: 148.5,
        duration: 180,
        paymentStatus: 'paid',
        paymentMethod: 'Cash',
        driver: {
          id: 'driver-004',
          name: 'Ganesh Jadhav',
          phone: '+91 65432 10987',
          profileImage: 'https://via.placeholder.com/150x150/FF9800/ffffff?text=GJ',
          rating: 4.9
        },
        vehicle: {
          id: 'vehicle-004',
          registrationNumber: 'MH-12-GH-3456',
          make: 'Ashok Leyland',
          model: 'Dost',
          type: 'Light Commercial Vehicle'
        },
        ratings: {
          driverRating: 5,
          serviceRating: 5,
          comment: 'Outstanding service! Safe and comfortable journey.'
        },
        invoice: {
          id: 'inv-004',
          downloadUrl: '/api/invoices/inv-004.pdf',
          generatedDate: new Date(now.getTime() - 55 * 24 * 60 * 60 * 1000)
        }
      },
      {
        id: 'trip-005',
        bookingNumber: 'JR-2024-005',
        tripNumber: 'TRP-005',
        pickupLocation: 'Ghatkopar Metro Station',
        pickupAddress: 'Ghatkopar Station Rd, Ghatkopar East, Mumbai, Maharashtra 400077',
        dropLocation: 'Worli Sea Link',
        dropAddress: 'Rajiv Gandhi Sea Link, Worli, Mumbai, Maharashtra 400018',
        bookingDate: new Date(now.getTime() - 80 * 24 * 60 * 60 * 1000),
        travelDate: new Date(now.getTime() - 75 * 24 * 60 * 60 * 1000),
        completionDate: new Date(now.getTime() - 75 * 24 * 60 * 60 * 1000 + 50 * 60 * 1000),
        status: 'completed',
        totalAmount: 520,
        distance: 22.8,
        duration: 50,
        paymentStatus: 'paid',
        paymentMethod: 'Wallet',
        driver: {
          id: 'driver-005',
          name: 'Pradeep Singh',
          phone: '+91 54321 09876',
          profileImage: 'https://via.placeholder.com/150x150/9C27B0/ffffff?text=PS',
          rating: 4.3
        },
        vehicle: {
          id: 'vehicle-005',
          registrationNumber: 'MH-04-IJ-7890',
          make: 'Mahindra',
          model: 'Jeeto',
          type: 'Mini Truck'
        },
        ratings: {
          driverRating: 4,
          serviceRating: 4,
          comment: 'Good service, prompt delivery.'
        },
        invoice: {
          id: 'inv-005',
          downloadUrl: '/api/invoices/inv-005.pdf',
          generatedDate: new Date(now.getTime() - 75 * 24 * 60 * 60 * 1000)
        }
      }
    ];
  }

  // Statistics Calculation
  calculateStats(): void {
    const completedTrips = this.historyTrips.filter(trip => trip.status === 'completed');
    const cancelledTrips = this.historyTrips.filter(trip => trip.status === 'cancelled');
    
    this.stats = {
      totalTrips: this.historyTrips.length,
      completedTrips: completedTrips.length,
      cancelledTrips: cancelledTrips.length,
      totalDistance: completedTrips.reduce((sum, trip) => sum + trip.distance, 0),
      totalAmountSpent: completedTrips.reduce((sum, trip) => sum + trip.totalAmount, 0),
      averageRating: this.calculateAverageRating(completedTrips)
    };
  }

  private calculateAverageRating(trips: TransportHistoryTrip[]): number {
    const ratedTrips = trips.filter(trip => trip.ratings?.serviceRating);
    if (ratedTrips.length === 0) return 0;
    
    const totalRating = ratedTrips.reduce((sum, trip) => sum + (trip.ratings?.serviceRating || 0), 0);
    return Math.round((totalRating / ratedTrips.length) * 10) / 10;
  }

  // Filtering and Sorting
  applyFilters(): void {
    let filtered = [...this.historyTrips];

    // Search filter
    if (this.filter.searchTerm) {
      const searchTerm = this.filter.searchTerm.toLowerCase();
      filtered = filtered.filter(trip =>
        trip.bookingNumber.toLowerCase().includes(searchTerm) ||
        trip.pickupLocation.toLowerCase().includes(searchTerm) ||
        trip.dropLocation.toLowerCase().includes(searchTerm) ||
        trip.driver.name.toLowerCase().includes(searchTerm) ||
        trip.vehicle.registrationNumber.toLowerCase().includes(searchTerm)
      );
    }

    // Status filter
    if (this.filter.status !== 'all') {
      filtered = filtered.filter(trip => trip.status === this.filter.status);
    }

    // Payment status filter
    if (this.filter.paymentStatus !== 'all') {
      filtered = filtered.filter(trip => trip.paymentStatus === this.filter.paymentStatus);
    }

    // Date range filter
    if (this.filter.dateRange !== 'all') {
      filtered = filtered.filter(trip => this.isInDateRange(trip.completionDate, this.filter.dateRange));
    }

    // Sort results
    filtered = this.sortTrips(filtered);

    this.filteredTrips = filtered;
  }

  private isInDateRange(date: Date, range: string): boolean {
    const now = new Date();
    const tripDate = new Date(date);

    switch (range) {
      case 'last-month':
        const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        return tripDate >= lastMonth;
      case 'last-3-months':
        const threeMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 3, 1);
        return tripDate >= threeMonthsAgo;
      case 'last-6-months':
        const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 6, 1);
        return tripDate >= sixMonthsAgo;
      case 'this-year':
        const thisYear = new Date(now.getFullYear(), 0, 1);
        return tripDate >= thisYear;
      default:
        return true;
    }
  }

  private sortTrips(trips: TransportHistoryTrip[]): TransportHistoryTrip[] {
    return trips.sort((a, b) => {
      let aValue: any, bValue: any;

      switch (this.filter.sortBy) {
        case 'completionDate':
          aValue = new Date(a.completionDate).getTime();
          bValue = new Date(b.completionDate).getTime();
          break;
        case 'bookingDate':
          aValue = new Date(a.bookingDate).getTime();
          bValue = new Date(b.bookingDate).getTime();
          break;
        case 'totalAmount':
          aValue = a.totalAmount;
          bValue = b.totalAmount;
          break;
        case 'distance':
          aValue = a.distance;
          bValue = b.distance;
          break;
        case 'ratings.serviceRating':
          aValue = a.ratings?.serviceRating || 0;
          bValue = b.ratings?.serviceRating || 0;
          break;
        default:
          return 0;
      }

      if (this.filter.sortOrder === 'asc') {
        return aValue > bValue ? 1 : aValue < bValue ? -1 : 0;
      } else {
        return aValue < bValue ? 1 : aValue > bValue ? -1 : 0;
      }
    });
  }

  clearFilters(): void {
    this.filter = {
      searchTerm: '',
      status: 'all',
      dateRange: 'all',
      paymentStatus: 'all',
      sortBy: 'completionDate',
      sortOrder: 'desc'
    };
    this.applyFilters();
  }

  // Modal Management
  openTripDetails(trip: TransportHistoryTrip): void {
    this.selectedTrip = trip;
    this.showTripModal = true;
  }

  closeTripModal(): void {
    this.showTripModal = false;
    this.selectedTrip = null;
  }

  openInvoiceModal(trip: TransportHistoryTrip): void {
    this.selectedTrip = trip;
    this.showInvoiceModal = true;
  }

  closeInvoiceModal(): void {
    this.showInvoiceModal = false;
    this.selectedTrip = null;
  }

  // Helper Functions
  getStatusClass(status: string): string {
    return `status-${status}`;
  }

  getStatusIcon(status: string): string {
    switch (status) {
      case 'completed': return 'fas fa-check-circle';
      case 'cancelled': return 'fas fa-times-circle';
      case 'refunded': return 'fas fa-undo';
      default: return 'fas fa-question-circle';
    }
  }

  getStatusText(status: string): string {
    switch (status) {
      case 'completed': return 'Completed';
      case 'cancelled': return 'Cancelled';
      case 'refunded': return 'Refunded';
      default: return 'Unknown';
    }
  }

  getPaymentStatusClass(status: string): string {
    return `payment-${status}`;
  }

  getPaymentStatusIcon(status: string): string {
    switch (status) {
      case 'paid': return 'fas fa-check-circle';
      case 'pending': return 'fas fa-clock';
      case 'refunded': return 'fas fa-undo';
      default: return 'fas fa-question-circle';
    }
  }

  formatDate(date: Date): string {
    return new Intl.DateTimeFormat('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    }).format(new Date(date));
  }

  formatDateTime(date: Date): string {
    return new Intl.DateTimeFormat('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(date));
  }

  formatDistance(distance: number): string {
    return `${distance.toFixed(1)} km`;
  }

  formatDuration(minutes: number): string {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins} minutes`;
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  }

  generateStars(rating: number): string[] {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    
    for (let i = 0; i < fullStars; i++) {
      stars.push('fas fa-star');
    }
    
    if (hasHalfStar) {
      stars.push('fas fa-star-half-alt');
    }
    
    while (stars.length < 5) {
      stars.push('far fa-star');
    }
    
    return stars;
  }

  // Action Methods
  downloadInvoice(trip: TransportHistoryTrip): void {
    if (trip.invoice) {
      // Simulate invoice download
      console.log('Downloading invoice:', trip.invoice.id);
      // window.open(trip.invoice.downloadUrl, '_blank');
    }
  }

  bookSimilarTrip(trip: TransportHistoryTrip): void {
    // Navigate to booking page with pre-filled data
    console.log('Booking similar trip for:', trip.bookingNumber);
  }

  contactDriver(trip: TransportHistoryTrip): void {
    // Open phone dialer
    window.open(`tel:${trip.driver.phone}`, '_self');
  }

  rateTrip(trip: TransportHistoryTrip): void {
    // Open rating modal or navigate to rating page
    console.log('Rating trip:', trip.bookingNumber);
  }

  reportIssue(trip: TransportHistoryTrip): void {
    // Open support modal or navigate to support page
    console.log('Reporting issue for trip:', trip.bookingNumber);
  }

  shareTrip(trip: TransportHistoryTrip): void {
    // Open sharing options
    if (navigator.share) {
      navigator.share({
        title: `Trip ${trip.bookingNumber}`,
        text: `I traveled from ${trip.pickupLocation} to ${trip.dropLocation} via JR Transport`,
        url: window.location.href
      });
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(`Trip ${trip.bookingNumber}: ${trip.pickupLocation} to ${trip.dropLocation}`);
    }
  }
}