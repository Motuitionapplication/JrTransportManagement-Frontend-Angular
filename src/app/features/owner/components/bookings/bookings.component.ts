import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-bookings',
  templateUrl: './bookings.component.html',
  styleUrls: ['./bookings.component.scss']
})
export class BookingsComponent implements OnInit {

  activeTab = 'all';
  
  bookings = [
    {
      id: 'BK001',
      customerName: 'John Smith',
      customerPhone: '+91 9876543210',
      pickupLocation: 'Mumbai Central',
      dropoffLocation: 'Pune Station',
      bookingDate: new Date('2024-09-28'),
      pickupTime: '10:00 AM',
      vehicleId: 'V001',
      vehiclePlate: 'MH-12-AB-1234',
      driverName: 'Rajesh Kumar',
      status: 'confirmed',
      amount: 2500,
      paymentStatus: 'paid',
      distance: '148 km',
      estimatedDuration: '3h 30m',
      notes: 'Handle with care - fragile items'
    },
    {
      id: 'BK002', 
      customerName: 'Maria Garcia',
      customerPhone: '+91 8765432109',
      pickupLocation: 'Bandra West',
      dropoffLocation: 'Thane East',
      bookingDate: new Date('2024-09-29'),
      pickupTime: '2:30 PM',
      vehicleId: 'V002',
      vehiclePlate: 'MH-12-CD-5678',
      driverName: 'Suresh Patil',
      status: 'in-progress',
      amount: 1200,
      paymentStatus: 'pending',
      distance: '32 km',
      estimatedDuration: '1h 15m',
      notes: 'Customer will be waiting at gate 2'
    },
    {
      id: 'BK003',
      customerName: 'David Wilson',
      customerPhone: '+91 7654321098',
      pickupLocation: 'Andheri Airport',
      dropoffLocation: 'Colaba',
      bookingDate: new Date('2024-09-30'),
      pickupTime: '8:00 AM',
      vehicleId: 'V003',
      vehiclePlate: 'MH-12-EF-9012',
      driverName: 'Amit Sharma',
      status: 'pending',
      amount: 800,
      paymentStatus: 'pending',
      distance: '28 km',
      estimatedDuration: '55 min',
      notes: 'Flight arrival - may be delayed'
    },
    {
      id: 'BK004',
      customerName: 'Sarah Johnson',
      customerPhone: '+91 6543210987',
      pickupLocation: 'Worli Sea Face',
      dropoffLocation: 'Navi Mumbai',
      bookingDate: new Date('2024-09-25'),
      pickupTime: '6:30 PM',
      vehicleId: 'V001',
      vehiclePlate: 'MH-12-AB-1234',
      driverName: 'Rajesh Kumar',
      status: 'completed',
      amount: 1800,
      paymentStatus: 'paid',
      distance: '45 km',
      estimatedDuration: '1h 45m',
      notes: 'Regular customer - VIP treatment'
    }
  ];

  constructor() { }

  ngOnInit(): void {
    console.log('Bookings component initialized');
  }

  get filteredBookings() {
    if (this.activeTab === 'all') {
      return this.bookings;
    }
    return this.bookings.filter(booking => booking.status === this.activeTab);
  }

  get bookingStats() {
    return {
      total: this.bookings.length,
      pending: this.bookings.filter(b => b.status === 'pending').length,
      confirmed: this.bookings.filter(b => b.status === 'confirmed').length,
      inProgress: this.bookings.filter(b => b.status === 'in-progress').length,
      completed: this.bookings.filter(b => b.status === 'completed').length,
      cancelled: this.bookings.filter(b => b.status === 'cancelled').length,
      totalRevenue: this.bookings
        .filter(b => b.paymentStatus === 'paid')
        .reduce((sum, b) => sum + b.amount, 0),
      pendingPayments: this.bookings
        .filter(b => b.paymentStatus === 'pending')
        .reduce((sum, b) => sum + b.amount, 0)
    };
  }

  setActiveTab(tab: string): void {
    this.activeTab = tab;
  }

  viewBookingDetails(bookingId: string): void {
    console.log('Viewing booking details:', bookingId);
  }

  updateBookingStatus(bookingId: string, status: string): void {
    const booking = this.bookings.find(b => b.id === bookingId);
    if (booking) {
      booking.status = status;
      console.log('Updated booking status:', bookingId, status);
    }
  }

  assignVehicle(bookingId: string): void {
    console.log('Assigning vehicle to booking:', bookingId);
  }

  contactCustomer(phone: string): void {
    console.log('Contacting customer:', phone);
  }

  trackBooking(bookingId: string): void {
    console.log('Tracking booking:', bookingId);
  }

  generateInvoice(bookingId: string): void {
    console.log('Generating invoice for booking:', bookingId);
  }

  cancelBooking(bookingId: string): void {
    if (confirm('Are you sure you want to cancel this booking?')) {
      this.updateBookingStatus(bookingId, 'cancelled');
    }
  }

  getStatusColor(status: string): string {
    const colors = {
      'pending': '#f59e0b',
      'confirmed': '#3b82f6',
      'in-progress': '#10b981',
      'completed': '#059669',
      'cancelled': '#ef4444'
    };
    return colors[status as keyof typeof colors] || '#6b7280';
  }

  getPaymentStatusColor(status: string): string {
    return status === 'paid' ? '#10b981' : '#f59e0b';
  }

}