import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Subject, combineLatest, of } from 'rxjs';
import { takeUntil, debounceTime, distinctUntilChanged, switchMap, catchError } from 'rxjs/operators';
import { BookingService } from '../../../../services/booking.service';
import { AuthService } from '../../../../core/auth.service';

export interface TransportHistory {
  id: string;
  bookingId: string;
  route: {
    from: string;
    to: string;
  };
  date: Date;
  departureTime: string;
  arrivalTime: string;
  driver: {
    name: string;
    phone: string;
    rating: number;
    avatar?: string;
  };
  vehicle: {
    number: string;
    type: string;
    model: string;
    make?: string;
    year?: number;
  };
  fare: number;
  status: 'completed' | 'cancelled' | 'in-progress' | 'scheduled';
  paymentStatus: 'paid' | 'pending' | 'failed' | 'refunded';
  passengers: number;
  distance: number;
  duration: string;
  rating?: number;
  feedback?: string;
  pickupAddress?: string;
  dropoffAddress?: string;
  createdAt?: Date;
  updatedAt?: Date;
  vehicleType?: string;
  specialInstructions?: string;
  cancellationReason?: string;
}

@Component({
  selector: 'app-transport-history',
  templateUrl: './transport-history.component.html',
  styleUrls: ['./transport-history.component.scss']
})
export class TransportHistoryComponent implements OnInit, OnDestroy {
  // Core data and state management
  private destroy$ = new Subject<void>();
  private transportHistorySubject = new BehaviorSubject<TransportHistory[]>([]);
  transportHistory$ = this.transportHistorySubject.asObservable();

  // UI state
  transportHistory: TransportHistory[] = [];
  filteredHistory: TransportHistory[] = [];
  selectedTrip: TransportHistory | null = null;
  isLoading: boolean = false;
  isRefreshing: boolean = false;
  error: string | null = null;

  // Filter states
  searchTerm: string = '';
  statusFilter: string = 'all';
  dateFilter: string = 'all';
  sortBy: string = 'date-desc';

  // Pagination
  currentPage: number = 1;
  itemsPerPage: number = 10;
  totalItems: number = 0;
  totalPages: number = 0;

  // User context
  private customerId: string = '';

  // Summary statistics
  historySummary: {
    total: number;
    completed: number;
    cancelled: number;
    inProgress: number;
    scheduled: number;
    totalAmount: number;
    averageRating: number;
  } | null = null;

  constructor(
    private router: Router,
    private bookingService: BookingService,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    console.log('🔧 TransportHistoryComponent: Initializing component');
    this.initializeComponent();
    this.loadTransportHistory();
  }

  ngOnDestroy(): void {
    console.log('🔧 TransportHistoryComponent: Destroying component');
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Initialize component with user data and reactive filters
   */
  private initializeComponent(): void {
    // Get current user ID - using a mock for now
    this.customerId = 'customer-1'; // In a real app, get from auth service
    console.log('👤 Current customer ID:', this.customerId);

    // Setup reactive filter system
    this.setupReactiveFilters();
  }

  /**
   * Setup reactive filter system with debounced search
   */
  private setupReactiveFilters(): void {
    const searchTerm$ = new BehaviorSubject(this.searchTerm);
    const statusFilter$ = new BehaviorSubject(this.statusFilter);
    const dateFilter$ = new BehaviorSubject(this.dateFilter);
    const sortBy$ = new BehaviorSubject(this.sortBy);

    // Combine all filters and apply with debounce
    combineLatest([
      this.transportHistory$,
      searchTerm$.pipe(debounceTime(300), distinctUntilChanged()),
      statusFilter$,
      dateFilter$,
      sortBy$
    ]).pipe(
      takeUntil(this.destroy$)
    ).subscribe(([history, search, status, date, sort]) => {
      this.applyFiltersReactive(history, search, status, date, sort);
    });

    // Update subjects when filter values change
    this.transportHistory$.pipe(takeUntil(this.destroy$)).subscribe(history => {
      this.transportHistory = history;
    });
  }

  /**
   * Load transport history data with service integration
   */
  loadTransportHistory(): void {
    console.log('📥 Loading transport history data...');
    this.isLoading = true;
    this.error = null;

    // Try to load from service first, fallback to mock data
    this.bookingService.getBookingsByCustomer(this.customerId).pipe(
      switchMap(bookings => {
        console.log('📊 Received bookings from service:', bookings.length);
        if (bookings && bookings.length > 0) {
          // Map service bookings to transport history format
          const mappedHistory = this.mapBookingsToHistory(bookings);
          return of(mappedHistory);
        } else {
          console.log('📝 No service data, generating mock history');
          return of(this.generateMockHistory());
        }
      }),
      catchError(error => {
        console.error('❌ Error loading history from service:', error);
        console.log('📝 Falling back to mock data');
        return of(this.generateMockHistory());
      }),
      takeUntil(this.destroy$)
    ).subscribe({
      next: (history) => {
        console.log('✅ Transport history loaded successfully:', history.length, 'items');
        this.transportHistorySubject.next(history);
        this.calculateSummary();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('❌ Error loading transport history:', error);
        this.error = 'Failed to load transport history. Please try again.';
        this.isLoading = false;
      }
    });
  }

  /**
   * Map service bookings to transport history format
   */
  private mapBookingsToHistory(bookings: any[]): TransportHistory[] {
    return bookings.map(booking => ({
      id: booking.id,
      bookingId: booking.bookingNumber || booking.id,
      route: {
        from: booking.pickupAddress || booking.pickupLocation || 'Unknown',
        to: booking.dropoffAddress || booking.dropoffLocation || 'Unknown'
      },
      date: new Date(booking.pickupDateTime || booking.createdAt),
      departureTime: booking.pickupDateTime ? 
        new Date(booking.pickupDateTime).toLocaleTimeString('en-US', { 
          hour: '2-digit', minute: '2-digit', hour12: true 
        }) : 'TBD',
      arrivalTime: booking.dropoffDateTime ? 
        new Date(booking.dropoffDateTime).toLocaleTimeString('en-US', { 
          hour: '2-digit', minute: '2-digit', hour12: true 
        }) : 'TBD',
      driver: {
        name: booking.driverInfo?.name || booking.driver?.name || 'Assigned Driver',
        phone: booking.driverInfo?.phone || booking.driver?.phone || '+91-XXXXXXXXXX',
        rating: booking.driverInfo?.rating || booking.driver?.rating || 4.5,
        avatar: booking.driverInfo?.profileImage || booking.driver?.profileImage
      },
      vehicle: {
        number: booking.vehicleInfo?.plateNumber || booking.vehicle?.plateNumber || 'TBD',
        type: booking.vehicleType || booking.vehicle?.type || 'Vehicle',
        model: booking.vehicleInfo?.model || booking.vehicle?.model || 'TBD',
        make: booking.vehicleInfo?.make || booking.vehicle?.make,
        year: booking.vehicleInfo?.year || booking.vehicle?.year
      },
      fare: booking.totalAmount || booking.actualCost || booking.estimatedCost || 0,
      status: this.mapBookingStatus(booking.status),
      paymentStatus: booking.paymentStatus || 'pending',
      passengers: booking.passengers || 1,
      distance: booking.distance || 0,
      duration: this.calculateDuration(booking.pickupDateTime, booking.dropoffDateTime),
      rating: booking.customerRating?.rating,
      feedback: booking.customerRating?.feedback,
      pickupAddress: booking.pickupAddress,
      dropoffAddress: booking.dropoffAddress,
      createdAt: new Date(booking.createdAt),
      updatedAt: new Date(booking.updatedAt),
      vehicleType: booking.vehicleType,
      specialInstructions: booking.specialInstructions,
      cancellationReason: booking.cancellation?.reason
    }));
  }

  /**
   * Map booking status to transport history status
   */
  private mapBookingStatus(status: string): 'completed' | 'cancelled' | 'in-progress' | 'scheduled' {
    switch (status) {
      case 'completed': return 'completed';
      case 'cancelled': return 'cancelled';
      case 'in-transit': return 'in-progress';
      case 'confirmed': return 'scheduled';
      case 'pending': return 'scheduled';
      default: return 'scheduled';
    }
  }

  /**
   * Calculate duration between pickup and dropoff
   */
  private calculateDuration(pickup: string | Date, dropoff: string | Date): string {
    if (!pickup || !dropoff) return 'TBD';
    
    const pickupTime = new Date(pickup);
    const dropoffTime = new Date(dropoff);
    const diffMs = dropoffTime.getTime() - pickupTime.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    
    if (diffHours > 0) {
      return `${diffHours}h ${diffMinutes}m`;
    } else {
      return `${diffMinutes}m`;
    }
  }

  /**
   * Generate comprehensive mock transport history
   */
  private generateMockHistory(): TransportHistory[] {
    const cities = ['Central Station', 'Airport Terminal', 'Business District', 'Shopping Mall', 'Railway Station', 'Hospital', 'University', 'Tech Park', 'Hotel Grand', 'Conference Center'];
    const vehicleTypes = ['Sedan', 'SUV', 'Hatchback', 'Van', 'Truck'];
    const vehicleMakes = ['Toyota', 'Honda', 'Maruti', 'Hyundai', 'Mahindra', 'Tata'];
    const vehicleModels = ['Camry', 'CR-V', 'Swift', 'Verna', 'XUV500', 'Nexon'];
    const driverNames = ['John Doe', 'Mike Smith', 'Sarah Johnson', 'David Wilson', 'Alex Brown', 'Priya Sharma', 'Raj Patel', 'Nina Singh'];
    const statuses: ('completed' | 'cancelled' | 'in-progress' | 'scheduled')[] = ['completed', 'cancelled', 'in-progress', 'scheduled'];
    const paymentStatuses: ('paid' | 'pending' | 'failed' | 'refunded')[] = ['paid', 'pending', 'failed', 'refunded'];

    const mockHistory: TransportHistory[] = [];

    // Generate 20-30 history items
    const itemCount = Math.floor(Math.random() * 11) + 20;

    for (let i = 0; i < itemCount; i++) {
      const createdDate = new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000); // Last 90 days
      const status = statuses[Math.floor(Math.random() * statuses.length)];
      const paymentStatus = paymentStatuses[Math.floor(Math.random() * paymentStatuses.length)];
      const vehicleType = vehicleTypes[Math.floor(Math.random() * vehicleTypes.length)];
      const make = vehicleMakes[Math.floor(Math.random() * vehicleMakes.length)];
      const model = vehicleModels[Math.floor(Math.random() * vehicleModels.length)];
      const from = cities[Math.floor(Math.random() * cities.length)];
      let to = cities[Math.floor(Math.random() * cities.length)];
      while (to === from) {
        to = cities[Math.floor(Math.random() * cities.length)];
      }

      const distance = Math.floor(Math.random() * 50) + 5;
      const duration = `${Math.floor(distance / 30 * 60)}m`;
      const fare = Math.floor((distance * (Math.random() * 10 + 8)) / 10) * 10;
      const rating = status === 'completed' ? Math.floor(Math.random() * 2) + 4 : undefined;

      const departureHour = Math.floor(Math.random() * 24);
      const departureMinute = Math.floor(Math.random() * 60);
      const departureTime = `${departureHour.toString().padStart(2, '0')}:${departureMinute.toString().padStart(2, '0')}`;
      
      let arrivalTime = 'TBD';
      if (status === 'completed' || status === 'cancelled') {
        const arrivalDate = new Date(createdDate.getTime() + Math.random() * 180 * 60 * 1000); // Up to 3 hours later
        arrivalTime = status === 'cancelled' ? 'Cancelled' : 
          `${arrivalDate.getHours().toString().padStart(2, '0')}:${arrivalDate.getMinutes().toString().padStart(2, '0')}`;
      } else if (status === 'in-progress') {
        arrivalTime = 'In Transit';
      }

      mockHistory.push({
        id: `TH-${Date.now()}-${i}`,
        bookingId: `BK-${Date.now().toString().slice(-6)}-${i}`,
        route: { from, to },
        date: createdDate,
        departureTime,
        arrivalTime,
        driver: {
          name: driverNames[Math.floor(Math.random() * driverNames.length)],
          phone: `+91-${Math.floor(Math.random() * 9000000000) + 1000000000}`,
          rating: Math.round((Math.random() * 1.5 + 3.5) * 10) / 10,
          avatar: `https://via.placeholder.com/50x50/${Math.floor(Math.random() * 16777215).toString(16)}/ffffff?text=${driverNames[i % driverNames.length].charAt(0)}`
        },
        vehicle: {
          number: `KA${Math.floor(Math.random() * 99) + 1}${String.fromCharCode(65 + Math.floor(Math.random() * 26))}${String.fromCharCode(65 + Math.floor(Math.random() * 26))}${Math.floor(Math.random() * 9000) + 1000}`,
          type: vehicleType,
          model: `${make} ${model}`,
          make,
          year: 2018 + Math.floor(Math.random() * 7)
        },
        fare,
        status,
        paymentStatus,
        passengers: Math.floor(Math.random() * 4) + 1,
        distance,
        duration,
        rating,
        feedback: rating && rating >= 4 ? ['Great service!', 'Excellent driver', 'Clean vehicle', 'On time', 'Professional service'][Math.floor(Math.random() * 5)] : undefined,
        pickupAddress: `${from} Hub, Main Street`,
        dropoffAddress: `${to} Center, Central Avenue`,
        createdAt: createdDate,
        updatedAt: new Date(createdDate.getTime() + Math.random() * 24 * 60 * 60 * 1000),
        vehicleType: vehicleType.toLowerCase(),
        specialInstructions: Math.random() > 0.7 ? 'Please call on arrival' : undefined,
        cancellationReason: status === 'cancelled' ? 'Change of plans' : undefined
      });
    }

    return mockHistory.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  /**
   * Apply filters reactively with sorting and pagination
   */
  private applyFiltersReactive(
    history: TransportHistory[], 
    search: string, 
    status: string, 
    date: string, 
    sort: string
  ): void {
    let filtered = history.filter(trip => {
      const matchesSearch = !search || 
        trip.route.from.toLowerCase().includes(search.toLowerCase()) ||
        trip.route.to.toLowerCase().includes(search.toLowerCase()) ||
        trip.bookingId.toLowerCase().includes(search.toLowerCase()) ||
        trip.driver.name.toLowerCase().includes(search.toLowerCase()) ||
        trip.vehicle.number.toLowerCase().includes(search.toLowerCase());

      const matchesStatus = status === 'all' || trip.status === status;

      let matchesDate = true;
      if (date !== 'all') {
        const now = new Date();
        const tripDate = new Date(trip.date);
        
        switch (date) {
          case 'today':
            matchesDate = tripDate.toDateString() === now.toDateString();
            break;
          case 'week':
            const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            matchesDate = tripDate >= weekAgo;
            break;
          case 'month':
            const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
            matchesDate = tripDate >= monthAgo;
            break;
        }
      }

      return matchesSearch && matchesStatus && matchesDate;
    });

    // Apply sorting
    filtered = this.sortHistory(filtered, sort);
    
    this.filteredHistory = filtered;
    this.totalItems = filtered.length;
    this.totalPages = Math.ceil(this.totalItems / this.itemsPerPage);
    
    // Reset to page 1 if current page is beyond total pages
    if (this.currentPage > this.totalPages && this.totalPages > 0) {
      this.currentPage = 1;
    }
  }

  /**
   * Sort history based on criteria
   */
  private sortHistory(history: TransportHistory[], sortBy: string): TransportHistory[] {
    return [...history].sort((a, b) => {
      switch (sortBy) {
        case 'date-desc':
          return new Date(b.date).getTime() - new Date(a.date).getTime();
        case 'date-asc':
          return new Date(a.date).getTime() - new Date(b.date).getTime();
        case 'fare-desc':
          return b.fare - a.fare;
        case 'fare-asc':
          return a.fare - b.fare;
        case 'rating-desc':
          return (b.rating || 0) - (a.rating || 0);
        case 'status':
          return a.status.localeCompare(b.status);
        default:
          return 0;
      }
    });
  }

  /**
   * Calculate summary statistics
   */
  private calculateSummary(): void {
    const history = this.transportHistorySubject.value;
    
    const summary = history.reduce((acc, trip) => {
      acc.total++;
      acc.totalAmount += trip.fare;
      
      if (trip.rating) {
        acc.ratingSum += trip.rating;
        acc.ratingCount++;
      }
      
      switch (trip.status) {
        case 'completed': acc.completed++; break;
        case 'cancelled': acc.cancelled++; break;
        case 'in-progress': acc.inProgress++; break;
        case 'scheduled': acc.scheduled++; break;
      }
      
      return acc;
    }, {
      total: 0,
      completed: 0,
      cancelled: 0,
      inProgress: 0,
      scheduled: 0,
      totalAmount: 0,
      ratingSum: 0,
      ratingCount: 0
    });

    this.historySummary = {
      total: summary.total,
      completed: summary.completed,
      cancelled: summary.cancelled,
      inProgress: summary.inProgress,
      scheduled: summary.scheduled,
      totalAmount: summary.totalAmount,
      averageRating: summary.ratingCount > 0 ? summary.ratingSum / summary.ratingCount : 0
    };

    console.log('📊 History summary calculated:', this.historySummary);
  }

  applyFilters(): void {
    // Legacy method - now handled by reactive filters
    this.applyFiltersReactive(this.transportHistory, this.searchTerm, this.statusFilter, this.dateFilter, this.sortBy);
  }

  selectTrip(trip: TransportHistory): void {
    this.selectedTrip = trip;
  }

  closeDetails(): void {
    this.selectedTrip = null;
  }

  /**
   * Export transport history to CSV
   */
  exportHistory(): void {
    console.log('📤 Exporting transport history to CSV');
    
    const headers = [
      'Booking ID', 'Date', 'From', 'To', 'Driver', 'Vehicle', 'Fare', 
      'Status', 'Payment Status', 'Rating', 'Distance', 'Duration'
    ];
    
    const csvData = this.filteredHistory.map(trip => [
      trip.bookingId,
      this.formatDate(trip.date),
      trip.route.from,
      trip.route.to,
      trip.driver.name,
      `${trip.vehicle.model} (${trip.vehicle.number})`,
      `₹${trip.fare}`,
      trip.status,
      trip.paymentStatus,
      trip.rating || 'Not Rated',
      `${trip.distance} km`,
      trip.duration
    ]);
    
    const csvContent = [headers, ...csvData]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');
    
    this.downloadCSV(csvContent, `transport-history-${new Date().toISOString().split('T')[0]}.csv`);
    console.log('✅ Export completed');
  }

  /**
   * Download CSV file
   */
  private downloadCSV(csvContent: string, filename: string): void {
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  downloadReceipt(trip: TransportHistory): void {
    console.log('📄 Downloading receipt for trip:', trip.id);
    
    if (trip.status === 'cancelled') {
      alert('Cannot download receipt for cancelled trips');
      return;
    }

    // Generate a simple receipt (in a real app, this would be a PDF)
    const receiptData = {
      bookingId: trip.bookingId,
      date: this.formatDate(trip.date),
      route: `${trip.route.from} → ${trip.route.to}`,
      driver: trip.driver.name,
      vehicle: `${trip.vehicle.model} (${trip.vehicle.number})`,
      fare: trip.fare,
      status: trip.status,
      paymentStatus: trip.paymentStatus
    };

    const receiptContent = `
TRANSPORT RECEIPT
================
Booking ID: ${receiptData.bookingId}
Date: ${receiptData.date}
Route: ${receiptData.route}
Driver: ${receiptData.driver}
Vehicle: ${receiptData.vehicle}
Fare: ₹${receiptData.fare}
Status: ${receiptData.status}
Payment: ${receiptData.paymentStatus}
================
Thank you for using our service!
    `.trim();

    this.downloadCSV(receiptContent, `receipt-${trip.bookingId}.txt`);
  }

  rebookTrip(trip: TransportHistory): void {
    console.log('🔄 Rebooking trip:', trip.id);
    this.router.navigate(['/customer/book-transport'], {
      queryParams: {
        from: trip.route.from,
        to: trip.route.to,
        passengers: trip.passengers,
        vehicleType: trip.vehicleType || trip.vehicle.type.toLowerCase()
      }
    });
  }

  rateTrip(trip: TransportHistory): void {
    console.log('⭐ Rating trip:', trip.id);
    
    if (trip.rating) {
      alert(`You have already rated this trip: ${trip.rating}/5`);
      return;
    }

    const rating = prompt('Please rate this trip (1-5 stars):');
    if (rating && !isNaN(Number(rating))) {
      const numRating = Math.max(1, Math.min(5, Number(rating)));
      const feedback = prompt('Any feedback? (Optional)');
      
      // Update the trip rating locally (in a real app, this would call the service)
      trip.rating = numRating;
      if (feedback) {
        trip.feedback = feedback;
      }
      
      console.log(`✅ Trip rated: ${numRating}/5`, feedback ? `Feedback: ${feedback}` : '');
      alert('Thank you for your rating!');
      
      // Recalculate summary
      this.calculateSummary();
    }
  }

  reportIssue(trip: TransportHistory): void {
    console.log('🚨 Reporting issue for trip:', trip.id);
    
    const issue = prompt(`Report an issue for trip ${trip.bookingId}:`);
    if (issue && issue.trim()) {
      console.log(`📝 Issue reported for ${trip.bookingId}: ${issue}`);
      alert('Your issue has been reported. Our support team will contact you soon.');
      
      // In a real app, this would call a support service
      // this.supportService.reportIssue(trip.id, issue);
    }
  }

  refreshHistory(): void {
    console.log('🔄 Refreshing transport history');
    this.isRefreshing = true;
    this.loadTransportHistory();
    
    // Show refreshing indicator for a short time
    setTimeout(() => {
      this.isRefreshing = false;
    }, 1000);
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'completed': return 'badge bg-success';
      case 'cancelled': return 'badge bg-danger';
      case 'in-progress': return 'badge bg-primary';
      case 'scheduled': return 'badge bg-warning';
      default: return 'badge bg-secondary';
    }
  }

  getStatusIcon(status: string): string {
    switch (status) {
      case 'completed': return 'fas fa-check-circle';
      case 'cancelled': return 'fas fa-times-circle';
      case 'in-progress': return 'fas fa-clock';
      case 'scheduled': return 'fas fa-calendar-check';
      default: return 'fas fa-question-circle';
    }
  }

  getPaymentStatusClass(paymentStatus: string): string {
    switch (paymentStatus) {
      case 'paid': return 'text-success';
      case 'pending': return 'text-warning';
      case 'failed': return 'text-danger';
      default: return 'text-secondary';
    }
  }

  getPaginatedHistory(): TransportHistory[] {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    return this.filteredHistory.slice(startIndex, startIndex + this.itemsPerPage);
  }

  getTotalPages(): number {
    return Math.ceil(this.totalItems / this.itemsPerPage);
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.getTotalPages()) {
      this.currentPage = page;
    }
  }

  generateStars(rating: number): number[] {
    return Array(5).fill(0).map((_, i) => i < rating ? 1 : 0);
  }

  // Enhanced utility methods
  formatDate(date: Date | string): string {
    if (!date) return '';
    const dateObj = new Date(date);
    return dateObj.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: '2-digit'
    });
  }

  formatDateTime(date: Date | string): string {
    if (!date) return '';
    const dateObj = new Date(date);
    return dateObj.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  }

  // Filter change handlers that trigger reactive updates
  onSearchChange(): void {
    // The reactive filter system will handle this automatically
    console.log('🔍 Search changed:', this.searchTerm);
  }

  onStatusFilterChange(): void {
    // The reactive filter system will handle this automatically
    console.log('📊 Status filter changed:', this.statusFilter);
  }

  onDateFilterChange(): void {
    // The reactive filter system will handle this automatically
    console.log('📅 Date filter changed:', this.dateFilter);
  }

  onSortChange(): void {
    this.applyFiltersReactive(this.transportHistory, this.searchTerm, this.statusFilter, this.dateFilter, this.sortBy);
  }

  // Navigation and selection methods
  clearSelection(): void {
    this.selectedTrip = null;
  }

  // Utility methods for template
  getStatusDisplay(status: string): string {
    switch (status) {
      case 'completed': return 'Completed';
      case 'cancelled': return 'Cancelled';
      case 'in-progress': return 'In Progress';
      case 'scheduled': return 'Scheduled';
      default: return status;
    }
  }

  getPaymentStatusDisplay(paymentStatus: string): string {
    switch (paymentStatus) {
      case 'paid': return 'Paid';
      case 'pending': return 'Pending';
      case 'failed': return 'Failed';
      case 'refunded': return 'Refunded';
      default: return paymentStatus;
    }
  }

  canDownloadReceipt(trip: TransportHistory): boolean {
    return trip.status !== 'cancelled' && trip.paymentStatus === 'paid';
  }

  canRateTrip(trip: TransportHistory): boolean {
    return trip.status === 'completed' && !trip.rating;
  }

  getTimeAgo(date: Date | string): string {
    if (!date) return '';
    
    const now = new Date();
    const tripDate = new Date(date);
    const diffMs = now.getTime() - tripDate.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
    return `${Math.floor(diffDays / 365)} years ago`;
  }

  // TrackBy function for performance optimization
  trackByTripId(index: number, trip: TransportHistory): string {
    return trip.id;
  }

  // Enhanced pagination methods
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

  onPageSizeChange(): void {
    this.currentPage = 1;
    this.totalPages = Math.ceil(this.totalItems / this.itemsPerPage);
  }

  // Make Math available in template
  Math = Math;
}