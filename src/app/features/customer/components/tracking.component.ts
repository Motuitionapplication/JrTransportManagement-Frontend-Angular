import { Component, OnInit } from '@angular/core';

export interface TrackingShipment {
  id: string;
  bookingNumber: string;
  tripNumber: string;
  customerName: string;
  pickupLocation: string;
  dropLocation: string;
  pickupAddress: string;
  dropAddress: string;
  currentStatus: 'booked' | 'confirmed' | 'pickup-in-progress' | 'in-transit' | 'out-for-delivery' | 'delivered';
  estimatedDelivery: Date;
  actualDelivery?: Date;
  driver: {
    name: string;
    phone: string;
    profileImage?: string;
    rating: number;
  };
  vehicle: {
    registrationNumber: string;
    type: string;
    make: string;
    model: string;
  };
  currentLocation: {
    latitude: number;
    longitude: number;
    address: string;
    timestamp: Date;
  };
  route: {
    distance: number;
    estimatedDuration: number;
    progress: number; // percentage 0-100
  };
  statusHistory: Array<{
    status: string;
    timestamp: Date;
    location?: string;
    description: string;
    icon?: string;
  }>;
  specialInstructions?: string;
  trackingUrl?: string;
}

export interface TrackingFilter {
  status: string;
  searchTerm: string;
  dateRange: 'today' | 'week' | 'month' | 'all';
}

@Component({
  selector: 'app-tracking',
  templateUrl: './tracking.component.html',
  styleUrls: ['./tracking.component.scss']
})
export class TrackingComponent implements OnInit {
  // Component state
  activeShipments: TrackingShipment[] = [];
  filteredShipments: TrackingShipment[] = [];
  selectedShipment: TrackingShipment | null = null;
  
  // Modal controls
  showTrackingModal: boolean = false;
  showMapModal: boolean = false;
  
  // Filters and search
  filter: TrackingFilter = {
    status: 'all',
    searchTerm: '',
    dateRange: 'all'
  };
  
  // Filter options
  statusOptions = [
    { value: 'all', label: 'All Status' },
    { value: 'booked', label: 'Booked' },
    { value: 'confirmed', label: 'Confirmed' },
    { value: 'pickup-in-progress', label: 'Pickup in Progress' },
    { value: 'in-transit', label: 'In Transit' },
    { value: 'out-for-delivery', label: 'Out for Delivery' },
    { value: 'delivered', label: 'Delivered' }
  ];

  dateRangeOptions = [
    { value: 'all', label: 'All Time' },
    { value: 'today', label: 'Today' },
    { value: 'week', label: 'This Week' },
    { value: 'month', label: 'This Month' }
  ];
  
  // Loading states
  isLoading: boolean = false;
  
  // Auto-refresh interval
  refreshInterval: any;
  lastRefreshTime: Date = new Date();

  constructor() {}

  ngOnInit(): void {
    this.loadActiveShipments();
    this.startAutoRefresh();
  }

  ngOnDestroy(): void {
    this.stopAutoRefresh();
  }

  // Load active shipments
  loadActiveShipments(): void {
    this.isLoading = true;
    
    // Mock data - replace with actual service call
    setTimeout(() => {
      this.activeShipments = [
        {
          id: 'TRACK-001',
          bookingNumber: 'BK-2024-001',
          tripNumber: 'TR-2024-001',
          customerName: 'John Smith',
          pickupLocation: 'Mumbai Central',
          dropLocation: 'Delhi Red Fort',
          pickupAddress: 'Platform 1, Mumbai Central Station, Mumbai, Maharashtra',
          dropAddress: 'Red Fort Road, Chandni Chowk, Delhi',
          currentStatus: 'in-transit',
          estimatedDelivery: new Date('2024-10-07T14:00:00'),
          driver: {
            name: 'Rajesh Sharma',
            phone: '+91 9876543210',
            profileImage: 'https://via.placeholder.com/50x50/4299e1/ffffff?text=RS',
            rating: 4.8
          },
          vehicle: {
            registrationNumber: 'MH-12-AB-1234',
            type: 'Medium Truck',
            make: 'Tata',
            model: 'LPT 1613'
          },
          currentLocation: {
            latitude: 22.9734,
            longitude: 78.6569,
            address: 'Madhya Pradesh Highway, Near Bhopal - 65% complete',
            timestamp: new Date('2024-10-06T16:30:00')
          },
          route: {
            distance: 1400,
            estimatedDuration: 22,
            progress: 65
          },
          statusHistory: [
            {
              status: 'Booked',
              timestamp: new Date('2024-10-05T10:00:00'),
              location: 'Mumbai',
              description: 'Booking confirmed and payment received',
              icon: 'fas fa-check-circle'
            },
            {
              status: 'Confirmed',
              timestamp: new Date('2024-10-06T08:00:00'),
              location: 'Mumbai',
              description: 'Driver assigned and vehicle allocated',
              icon: 'fas fa-user-check'
            },
            {
              status: 'Pickup Started',
              timestamp: new Date('2024-10-06T10:00:00'),
              location: 'Mumbai Central Station',
              description: 'Driver reached pickup location',
              icon: 'fas fa-map-marker-alt'
            },
            {
              status: 'In Transit',
              timestamp: new Date('2024-10-06T12:00:00'),
              location: 'Mumbai Central Station',
              description: 'Goods loaded and journey started',
              icon: 'fas fa-shipping-fast'
            },
            {
              status: 'Current Location',
              timestamp: new Date('2024-10-06T16:30:00'),
              location: 'Madhya Pradesh Highway',
              description: 'Vehicle is on highway, 65% journey completed',
              icon: 'fas fa-truck'
            }
          ],
          specialInstructions: 'Handle electronics with care. Contact before delivery.',
          trackingUrl: 'https://track.jrtransport.com/TRACK-001'
        },
        {
          id: 'TRACK-002',
          bookingNumber: 'BK-2024-002',
          tripNumber: 'TR-2024-002',
          customerName: 'Priya Sharma',
          pickupLocation: 'Pune IT Park',
          dropLocation: 'Bangalore Electronic City',
          pickupAddress: 'Phase 2, Rajiv Gandhi IT Park, Hinjewadi, Pune',
          dropAddress: 'Electronic City Phase 1, Bangalore, Karnataka',
          currentStatus: 'out-for-delivery',
          estimatedDelivery: new Date('2024-10-06T20:00:00'),
          driver: {
            name: 'Amit Patel',
            phone: '+91 9876543211',
            profileImage: 'https://via.placeholder.com/50x50/48bb78/ffffff?text=AP',
            rating: 4.6
          },
          vehicle: {
            registrationNumber: 'MH-14-CD-5678',
            type: 'Large Van',
            make: 'Mahindra',
            model: 'Bolero Pickup'
          },
          currentLocation: {
            latitude: 12.8456,
            longitude: 77.6603,
            address: 'Electronic City Main Road, Bangalore - Reaching destination',
            timestamp: new Date('2024-10-06T18:45:00')
          },
          route: {
            distance: 850,
            estimatedDuration: 14,
            progress: 95
          },
          statusHistory: [
            {
              status: 'Booked',
              timestamp: new Date('2024-10-05T14:00:00'),
              location: 'Pune',
              description: 'Online booking completed',
              icon: 'fas fa-check-circle'
            },
            {
              status: 'Confirmed',
              timestamp: new Date('2024-10-06T09:00:00'),
              location: 'Pune',
              description: 'Vehicle and driver confirmed',
              icon: 'fas fa-user-check'
            },
            {
              status: 'Pickup Completed',
              timestamp: new Date('2024-10-06T11:00:00'),
              location: 'Pune IT Park',
              description: 'Goods collected from pickup point',
              icon: 'fas fa-box'
            },
            {
              status: 'In Transit',
              timestamp: new Date('2024-10-06T11:30:00'),
              location: 'Pune IT Park',
              description: 'Journey started towards destination',
              icon: 'fas fa-shipping-fast'
            },
            {
              status: 'Out for Delivery',
              timestamp: new Date('2024-10-06T18:00:00'),
              location: 'Bangalore Electronic City',
              description: 'Vehicle reached destination city, delivery in progress',
              icon: 'fas fa-truck-loading'
            }
          ],
          specialInstructions: 'Delivery before 8 PM. Contact security at gate.',
          trackingUrl: 'https://track.jrtransport.com/TRACK-002'
        },
        {
          id: 'TRACK-003',
          bookingNumber: 'BK-2024-003',
          tripNumber: 'TR-2024-003',
          customerName: 'Ankit Kumar',
          pickupLocation: 'Kolkata Salt Lake',
          dropLocation: 'Bhubaneswar Railway Station',
          pickupAddress: 'Salt Lake Stadium Area, Kolkata, West Bengal',
          dropAddress: 'Bhubaneswar Railway Station, Odisha',
          currentStatus: 'pickup-in-progress',
          estimatedDelivery: new Date('2024-10-07T16:00:00'),
          driver: {
            name: 'Subrata Das',
            phone: '+91 9876543212',
            profileImage: 'https://via.placeholder.com/50x50/ed8936/ffffff?text=SD',
            rating: 4.9
          },
          vehicle: {
            registrationNumber: 'WB-06-EF-9012',
            type: 'Small Truck',
            make: 'Ashok Leyland',
            model: 'Dost'
          },
          currentLocation: {
            latitude: 22.5726,
            longitude: 88.3639,
            address: 'Salt Lake Stadium, Kolkata - At pickup location',
            timestamp: new Date('2024-10-06T15:20:00')
          },
          route: {
            distance: 450,
            estimatedDuration: 8,
            progress: 5
          },
          statusHistory: [
            {
              status: 'Booked',
              timestamp: new Date('2024-10-06T09:00:00'),
              location: 'Kolkata',
              description: 'Trip booked for tomorrow pickup',
              icon: 'fas fa-check-circle'
            },
            {
              status: 'Confirmed',
              timestamp: new Date('2024-10-06T14:00:00'),
              location: 'Kolkata',
              description: 'Driver assigned and en route to pickup',
              icon: 'fas fa-user-check'
            },
            {
              status: 'Pickup in Progress',
              timestamp: new Date('2024-10-06T15:20:00'),
              location: 'Salt Lake Stadium',
              description: 'Driver reached pickup location, loading in progress',
              icon: 'fas fa-dolly'
            }
          ],
          specialInstructions: 'Fragile items - handle with care'
        }
      ];
      
      this.applyFilters();
      this.lastRefreshTime = new Date();
      this.isLoading = false;
    }, 1000);
  }

  // Apply filters
  applyFilters(): void {
    this.filteredShipments = this.activeShipments.filter(shipment => {
      const matchesSearch = !this.filter.searchTerm ||
        shipment.bookingNumber.toLowerCase().includes(this.filter.searchTerm.toLowerCase()) ||
        shipment.tripNumber.toLowerCase().includes(this.filter.searchTerm.toLowerCase()) ||
        shipment.pickupLocation.toLowerCase().includes(this.filter.searchTerm.toLowerCase()) ||
        shipment.dropLocation.toLowerCase().includes(this.filter.searchTerm.toLowerCase());

      const matchesStatus = this.filter.status === 'all' || shipment.currentStatus === this.filter.status;

      const matchesDate = this.filter.dateRange === 'all' || this.checkDateFilter(shipment.estimatedDelivery);

      return matchesSearch && matchesStatus && matchesDate;
    });

    // Sort by estimated delivery (soonest first)
    this.filteredShipments.sort((a, b) => a.estimatedDelivery.getTime() - b.estimatedDelivery.getTime());
  }

  // Check date filter
  private checkDateFilter(deliveryDate: Date): boolean {
    const now = new Date();
    const diffTime = Math.abs(deliveryDate.getTime() - now.getTime());
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
      searchTerm: '',
      dateRange: 'all'
    };
    this.applyFilters();
  }

  // Auto-refresh functionality
  startAutoRefresh(): void {
    this.refreshInterval = setInterval(() => {
      this.refreshTracking();
    }, 30000); // Refresh every 30 seconds
  }

  stopAutoRefresh(): void {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
    }
  }

  refreshTracking(): void {
    // In real implementation, this would fetch updated location data
    console.log('Refreshing tracking data...');
    this.lastRefreshTime = new Date();
    
    // Simulate location updates
    this.activeShipments.forEach(shipment => {
      if (shipment.currentStatus === 'in-transit' || shipment.currentStatus === 'out-for-delivery') {
        // Simulate progress increase
        if (shipment.route.progress < 100) {
          shipment.route.progress += Math.random() * 2; // Random progress increase
          if (shipment.route.progress > 100) shipment.route.progress = 100;
        }
        
        // Update timestamp
        shipment.currentLocation.timestamp = new Date();
      }
    });
  }

  // Shipment operations
  openTrackingDetails(shipment: TrackingShipment): void {
    this.selectedShipment = shipment;
    this.showTrackingModal = true;
  }

  openMapView(shipment: TrackingShipment): void {
    this.selectedShipment = shipment;
    this.showMapModal = true;
  }

  callDriver(shipment: TrackingShipment): void {
    window.open(`tel:${shipment.driver.phone}`, '_self');
  }

  shareTracking(shipment: TrackingShipment): void {
    if (navigator.share && shipment.trackingUrl) {
      navigator.share({
        title: `Track Shipment ${shipment.bookingNumber}`,
        text: `Track your shipment from ${shipment.pickupLocation} to ${shipment.dropLocation}`,
        url: shipment.trackingUrl
      });
    } else {
      // Fallback: copy to clipboard
      if (shipment.trackingUrl) {
        navigator.clipboard.writeText(shipment.trackingUrl);
        console.log('Tracking URL copied to clipboard');
      }
    }
  }

  getDirections(shipment: TrackingShipment): void {
    const destination = encodeURIComponent(shipment.dropAddress);
    const origin = encodeURIComponent(shipment.currentLocation.address);
    window.open(`https://www.google.com/maps/dir/${origin}/${destination}`, '_blank');
  }

  // Modal controls
  closeTrackingModal(): void {
    this.showTrackingModal = false;
    this.selectedShipment = null;
  }

  closeMapModal(): void {
    this.showMapModal = false;
    this.selectedShipment = null;
  }

  // Utility methods
  getStatusClass(status: string): string {
    const statusClasses = {
      'booked': 'status-booked',
      'confirmed': 'status-confirmed',
      'pickup-in-progress': 'status-pickup',
      'in-transit': 'status-in-transit',
      'out-for-delivery': 'status-delivery',
      'delivered': 'status-delivered'
    };
    return statusClasses[status as keyof typeof statusClasses] || 'status-pending';
  }

  getStatusText(status: string): string {
    const statusTexts = {
      'booked': 'Booked',
      'confirmed': 'Confirmed',
      'pickup-in-progress': 'Pickup in Progress',
      'in-transit': 'In Transit',
      'out-for-delivery': 'Out for Delivery',
      'delivered': 'Delivered'
    };
    return statusTexts[status as keyof typeof statusTexts] || status;
  }

  getStatusIcon(status: string): string {
    const statusIcons = {
      'booked': 'fas fa-clipboard-check',
      'confirmed': 'fas fa-check-circle',
      'pickup-in-progress': 'fas fa-dolly',
      'in-transit': 'fas fa-shipping-fast',
      'out-for-delivery': 'fas fa-truck-loading',
      'delivered': 'fas fa-check-double'
    };
    return statusIcons[status as keyof typeof statusIcons] || 'fas fa-circle';
  }

  // Formatting utilities
  formatDateTime(date: Date): string {
    return new Intl.DateTimeFormat('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  }

  formatTime(date: Date): string {
    return new Intl.DateTimeFormat('en-IN', {
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  }

  formatDistance(distance: number): string {
    return `${distance.toFixed(0)} km`;
  }

  formatDuration(hours: number): string {
    const h = Math.floor(hours);
    const m = Math.round((hours - h) * 60);
    return `${h}h ${m}m`;
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

  isDeliveryToday(date: Date): boolean {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  }

  isDeliveryOverdue(date: Date): boolean {
    const now = new Date();
    return date < now;
  }

  getDeliveryTimeStatus(shipment: TrackingShipment): { text: string, class: string } {
    const now = new Date();
    const delivery = shipment.estimatedDelivery;
    
    if (shipment.currentStatus === 'delivered') {
      return { text: 'Delivered', class: 'text-success' };
    } else if (delivery < now) {
      return { text: 'Overdue', class: 'text-danger' };
    } else if (this.isDeliveryToday(delivery)) {
      return { text: 'Today', class: 'text-warning' };
    } else {
      return { text: 'On Time', class: 'text-success' };
    }
  }

  closeAllModals(): void {
    this.closeTrackingModal();
    this.closeMapModal();
  }

  exportTrackingData(): void {
    console.log('Exporting tracking data...');
    // Implementation for exporting tracking data
  }

  manualRefresh(): void {
    this.loadActiveShipments();
  }

  getInTransitCount(): number {
    return this.activeShipments.filter(s => s.currentStatus === 'in-transit').length;
  }

  getDeliveryTodayCount(): number {
    return this.activeShipments.filter(s => this.isDeliveryToday(s.estimatedDelivery)).length;
  }

  getOverdueCount(): number {
    return this.activeShipments.filter(s => 
      this.isDeliveryOverdue(s.estimatedDelivery) && s.currentStatus !== 'delivered'
    ).length;
  }
}