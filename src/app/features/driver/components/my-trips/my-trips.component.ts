import { Component, OnInit } from '@angular/core';

export interface DriverTrip {
  id: string;
  tripNumber: string;
  bookingNumber: string;
  customerName: string;
  pickupLocation: string;
  dropLocation: string;
  startDate: Date;
  endDate?: Date;
  status: 'assigned' | 'started' | 'in-transit' | 'delivered' | 'completed';
  vehicleNumber: string;
  distance: number;
  estimatedDuration: number;
  actualDuration?: number;
  earnings: number;
  cargoDetails: string;
  weight: number;
  customerPhone: string;
  specialInstructions?: string;
  currentLocation?: string;
  progress: number; // percentage
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
  trips: DriverTrip[] = [];
  filteredTrips: DriverTrip[] = [];
  isLoading = false;

  filter: TripFilter = {
    status: 'all',
    dateRange: 'all',
    searchTerm: ''
  };

  statusOptions = [
    { value: 'all', label: 'All Status' },
    { value: 'assigned', label: 'Assigned' },
    { value: 'started', label: 'Started' },
    { value: 'in-transit', label: 'In Transit' },
    { value: 'delivered', label: 'Delivered' },
    { value: 'completed', label: 'Completed' }
  ];

  dateRangeOptions = [
    { value: 'all', label: 'All Time' },
    { value: 'today', label: 'Today' },
    { value: 'week', label: 'This Week' },
    { value: 'month', label: 'This Month' }
  ];

  constructor() { }

  ngOnInit(): void {
    this.loadTrips();
  }

  loadTrips(): void {
    this.isLoading = true;
    
    // Mock data - replace with actual service call
    setTimeout(() => {
      this.trips = [
        {
          id: '1',
          tripNumber: 'TR001',
          bookingNumber: 'BK001',
          customerName: 'John Smith',
          pickupLocation: 'Mumbai Central Station',
          dropLocation: 'Delhi Red Fort',
          startDate: new Date('2024-01-15T10:00:00'),
          status: 'in-transit',
          vehicleNumber: 'MH-12-AB-1234',
          distance: 1400,
          estimatedDuration: 24,
          actualDuration: 18,
          earnings: 15000,
          cargoDetails: 'Electronics Equipment',
          weight: 500,
          customerPhone: '+91 9876543210',
          specialInstructions: 'Handle with care - fragile items',
          currentLocation: 'Nashik Highway',
          progress: 65
        },
        {
          id: '2',
          tripNumber: 'TR002',
          bookingNumber: 'BK002',
          customerName: 'Priya Sharma',
          pickupLocation: 'Pune IT Park',
          dropLocation: 'Bangalore Electronic City',
          startDate: new Date('2024-01-16T14:00:00'),
          status: 'assigned',
          vehicleNumber: 'MH-14-CD-5678',
          distance: 850,
          estimatedDuration: 14,
          earnings: 12000,
          cargoDetails: 'Office Furniture',
          weight: 800,
          customerPhone: '+91 9876543211',
          progress: 0
        },
        {
          id: '3',
          tripNumber: 'TR003',
          bookingNumber: 'BK003',
          customerName: 'Rajesh Kumar',
          pickupLocation: 'Chennai Port',
          dropLocation: 'Coimbatore Industrial Area',
          startDate: new Date('2024-01-14T08:00:00'),
          endDate: new Date('2024-01-14T20:00:00'),
          status: 'completed',
          vehicleNumber: 'TN-09-EF-9012',
          distance: 500,
          estimatedDuration: 8,
          actualDuration: 7,
          earnings: 8000,
          cargoDetails: 'Raw Materials',
          weight: 600,
          customerPhone: '+91 9876543212',
          specialInstructions: 'Delivery before 6 PM',
          progress: 100
        }
      ];
      
      this.filteredTrips = [...this.trips];
      this.isLoading = false;
    }, 1000);
  }

  applyFilters(): void {
    this.filteredTrips = this.trips.filter(trip => {
      // Status filter
      if (this.filter.status !== 'all' && trip.status !== this.filter.status) {
        return false;
      }

      // Date range filter
      if (this.filter.dateRange !== 'all') {
        const tripDate = new Date(trip.startDate);
        const now = new Date();
        
        switch (this.filter.dateRange) {
          case 'today':
            if (tripDate.toDateString() !== now.toDateString()) {
              return false;
            }
            break;
          case 'week':
            const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            if (tripDate < weekAgo) {
              return false;
            }
            break;
          case 'month':
            const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
            if (tripDate < monthAgo) {
              return false;
            }
            break;
        }
      }

      // Search term filter
      if (this.filter.searchTerm) {
        const searchLower = this.filter.searchTerm.toLowerCase();
        const searchableText = `${trip.tripNumber} ${trip.bookingNumber} ${trip.customerName} ${trip.pickupLocation} ${trip.dropLocation}`.toLowerCase();
        if (!searchableText.includes(searchLower)) {
          return false;
        }
      }

      return true;
    });
  }

  clearFilters(): void {
    this.filter = {
      status: 'all',
      dateRange: 'all',
      searchTerm: ''
    };
    this.applyFilters();
  }

  startTrip(trip: DriverTrip): void {
    if (trip.status === 'assigned') {
      trip.status = 'started';
      trip.progress = 5;
      console.log('Starting trip:', trip.tripNumber);
    }
  }

  updateLocation(trip: DriverTrip): void {
    console.log('Updating location for trip:', trip.tripNumber);
    // Open location update modal or navigate to GPS tracking
  }

  completeTrip(trip: DriverTrip): void {
    if (trip.status === 'in-transit') {
      trip.status = 'delivered';
      trip.progress = 100;
      trip.endDate = new Date();
      console.log('Completing trip:', trip.tripNumber);
    }
  }

  callCustomer(trip: DriverTrip): void {
    window.open(`tel:${trip.customerPhone}`, '_self');
  }

  getDirections(trip: DriverTrip): void {
    const destination = encodeURIComponent(trip.dropLocation);
    const origin = encodeURIComponent(trip.currentLocation || trip.pickupLocation);
    window.open(`https://www.google.com/maps/dir/${origin}/${destination}`, '_blank');
  }

  viewTripDetails(trip: DriverTrip): void {
    console.log('Viewing trip details:', trip.tripNumber);
    // Navigate to trip details page or open modal
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'assigned': return 'status-assigned';
      case 'started': return 'status-started';
      case 'in-transit': return 'status-in-transit';
      case 'delivered': return 'status-delivered';
      case 'completed': return 'status-completed';
      default: return '';
    }
  }

  getStatusText(status: string): string {
    switch (status) {
      case 'assigned': return 'Assigned';
      case 'started': return 'Started';
      case 'in-transit': return 'In Transit';
      case 'delivered': return 'Delivered';
      case 'completed': return 'Completed';
      default: return status;
    }
  }

  getTotalEarnings(): number {
    return this.filteredTrips.reduce((sum, trip) => sum + trip.earnings, 0);
  }
}