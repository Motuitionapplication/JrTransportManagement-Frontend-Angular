import { Component, OnInit, ViewChild } from '@angular/core';
import { BookingService } from 'src/app/services/booking.service';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { Booking } from 'src/app/models/booking.model';

interface BookingView {
  id: string;
  customerName: string;
  pickup: string;
  delivery: string;
  date: Date;
  status: string;
  amount: number;
  driverName?: string;
}

@Component({
  selector: 'app-admin-bookings',
  templateUrl: './admin-bookings.component.html',
  styleUrls: ['./admin-bookings.component.scss']
})
export class AdminBookingsComponent implements OnInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  displayedColumns: string[] = ['id', 'customer', 'route', 'date', 'status', 'driver', 'amount', 'actions'];

  searchTerm: string = '';
  selectedStatus: string = '';
  startDate: Date | null = null;
  endDate: Date | null = null;

  bookings: BookingView[] = [];
  filteredBookings: BookingView[] = [];

  // paging
  total = 0;
  pageSize = 25;
  pageIndex = 0;

  loading = false;
  error: string | null = null;

  constructor(private bookingService: BookingService) { }

  ngOnInit(): void {
    this.loadPage();
  }

  loadPage(pageIndex = 0, pageSize = 25) {
    this.loading = true;
    this.error = null;
    this.bookingService.fetchBookings({ page: pageIndex, size: pageSize, status: this.selectedStatus, q: this.searchTerm, startDate: this.startDate, endDate: this.endDate })
      .subscribe({ next: (res) => {
        // map to view model expected by template
        this.bookings = res.items.map(b => this.mapToView(b));
        this.filteredBookings = [...this.bookings];
        this.total = res.total;
        this.loading = false;
      }, error: (err) => {
        console.error('Failed to fetch bookings', err);
        this.error = 'Failed to load bookings';
        this.loading = false;
      }});
  }

  private mapToView(b: Booking): BookingView {
    const pickup = b.pickup?.address?.city || b.pickup?.address?.street || 'Unknown';
    const delivery = b.delivery?.address?.city || b.delivery?.address?.street || 'Unknown';
    const date = b.pickup?.scheduledDate ? new Date(b.pickup.scheduledDate) : (b.createdAt ? new Date(b.createdAt) : new Date());
    return {
      id: b.id,
      customerName: String(b.customerId || 'Customer'),
      pickup,
      delivery,
      date,
      status: b.status,
      amount: b.pricing?.finalAmount || b.pricing?.totalAmount || 0,
      driverName: b.driverId || undefined
    };
  }

  onPage(event: PageEvent) {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.loadPage(this.pageIndex, this.pageSize);
  }

  filterBookings(): void {
    // server-side filtering: reload first page with current filters
    this.pageIndex = 0;
    this.loadPage(0, this.pageSize);
  }

  addNewBooking(): void {
    console.log('Add new booking clicked');
    // Implement add booking functionality
  }

  viewBooking(booking: BookingView): void {
    console.log('View booking:', booking);
    // TODO: navigate to booking detail page
  }

  editBooking(booking: BookingView): void {
    console.log('Edit booking:', booking);
    // TODO: open edit dialog or navigate to edit page
  }

  assignDriver(booking: BookingView): void {
    console.log('Assign driver to booking:', booking);
    // Example: open a driver-pick dialog; for now assign first available vehicle/driver via service
    // This method will call remote assign and refresh the page on success
    const vehicleId = prompt('Enter vehicle id to assign:');
    if (!vehicleId) return;
    this.loading = true;
    this.bookingService.assignVehicleToBookingRemote(booking.id, vehicleId, 'OWNER_ID').subscribe({ next: (ok) => {
      this.loadPage(this.pageIndex, this.pageSize);
      this.loading = false;
    }, error: (err) => { console.error(err); this.loading = false; alert('Failed to assign vehicle'); } });
  }

  cancelBooking(booking: BookingView): void {
    console.log('Cancel booking:', booking);
    if (!confirm('Cancel this booking?')) return;
    this.loading = true;
    this.bookingService.cancelBooking(booking.id, 'Cancelled by admin', 'admin').subscribe({ next: (ok) => {
      if (ok) this.loadPage(this.pageIndex, this.pageSize);
      this.loading = false;
    }, error: (err) => { console.error(err); this.loading = false; alert('Failed to cancel booking'); } });
  }
}