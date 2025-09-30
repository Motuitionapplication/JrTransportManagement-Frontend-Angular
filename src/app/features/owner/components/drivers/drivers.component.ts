import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-drivers',
  templateUrl: './drivers.component.html',
  styleUrls: ['./drivers.component.scss']
})
export class DriversComponent implements OnInit {

  searchTerm = '';
  statusFilter = 'all';
  activeTab = 'active';

  drivers = [
    {
      id: 'DR001',
      name: 'Rajesh Kumar',
      email: 'rajesh@email.com',
      phone: '+91 9876543210',
      licenseNumber: 'MH123456789',
      licenseExpiry: new Date('2025-08-15'),
      aadharNumber: '****-****-1234',
      profileImage: null,
      status: 'active',
      rating: 4.8,
      totalTrips: 245,
      completedTrips: 238,
      cancelledTrips: 7,
      totalEarnings: 185600,
      currentVehicle: 'MH-12-AB-1234',
      joiningDate: new Date('2023-01-15'),
      address: 'Bandra West, Mumbai',
      emergencyContact: '+91 8765432109',
      bankAccount: 'SBI ****1234',
      documents: {
        license: { status: 'verified', expiry: new Date('2025-08-15') },
        aadhar: { status: 'verified', expiry: null },
        pan: { status: 'pending', expiry: null },
        medical: { status: 'verified', expiry: new Date('2024-12-31') },
        backgroundCheck: { status: 'verified', expiry: null }
      },
      performance: {
        onTimePercentage: 92,
        customerRating: 4.8,
        fuelEfficiency: 85,
        safetyScore: 95
      },
      isOnline: true,
      currentLocation: { lat: 19.0596, lng: 72.8295 },
      lastActive: new Date()
    },
    {
      id: 'DR002',
      name: 'Suresh Patil',
      email: 'suresh@email.com',
      phone: '+91 8765432109',
      licenseNumber: 'MH987654321',
      licenseExpiry: new Date('2024-11-30'),
      aadharNumber: '****-****-5678',
      profileImage: null,
      status: 'active',
      rating: 4.6,
      totalTrips: 189,
      completedTrips: 182,
      cancelledTrips: 7,
      totalEarnings: 142800,
      currentVehicle: 'MH-12-CD-5678',
      joiningDate: new Date('2023-03-20'),
      address: 'Andheri East, Mumbai',
      emergencyContact: '+91 7654321098',
      bankAccount: 'HDFC ****5678',
      documents: {
        license: { status: 'expired', expiry: new Date('2024-11-30') },
        aadhar: { status: 'verified', expiry: null },
        pan: { status: 'verified', expiry: null },
        medical: { status: 'pending', expiry: new Date('2024-10-15') },
        backgroundCheck: { status: 'verified', expiry: null }
      },
      performance: {
        onTimePercentage: 88,
        customerRating: 4.6,
        fuelEfficiency: 80,
        safetyScore: 87
      },
      isOnline: false,
      currentLocation: { lat: 19.1136, lng: 72.8697 },
      lastActive: new Date('2024-09-28T08:30:00')
    },
    {
      id: 'DR003',
      name: 'Amit Sharma',
      email: 'amit@email.com',
      phone: '+91 7654321098',
      licenseNumber: 'MH456789123',
      licenseExpiry: new Date('2026-05-20'),
      aadharNumber: '****-****-9012',
      profileImage: null,
      status: 'suspended',
      rating: 4.2,
      totalTrips: 98,
      completedTrips: 89,
      cancelledTrips: 9,
      totalEarnings: 78900,
      currentVehicle: null,
      joiningDate: new Date('2024-02-10'),
      address: 'Thane West, Mumbai',
      emergencyContact: '+91 6543210987',
      bankAccount: 'ICICI ****9012',
      documents: {
        license: { status: 'verified', expiry: new Date('2026-05-20') },
        aadhar: { status: 'verified', expiry: null },
        pan: { status: 'verified', expiry: null },
        medical: { status: 'expired', expiry: new Date('2024-08-30') },
        backgroundCheck: { status: 'failed', expiry: null }
      },
      performance: {
        onTimePercentage: 75,
        customerRating: 4.2,
        fuelEfficiency: 72,
        safetyScore: 68
      },
      isOnline: false,
      currentLocation: null,
      lastActive: new Date('2024-09-20T15:45:00'),
      suspensionReason: 'Multiple customer complaints'
    }
  ];

  constructor() { }

  ngOnInit(): void {
    console.log('Drivers component initialized');
  }

  get filteredDrivers() {
    let filtered = this.drivers;

    // Filter by status
    if (this.statusFilter !== 'all') {
      filtered = filtered.filter(driver => driver.status === this.statusFilter);
    }

    // Filter by search term
    if (this.searchTerm.trim()) {
      const term = this.searchTerm.toLowerCase().trim();
      filtered = filtered.filter(driver => 
        driver.name.toLowerCase().includes(term) ||
        driver.phone.includes(term) ||
        driver.licenseNumber.toLowerCase().includes(term) ||
        driver.currentVehicle?.toLowerCase().includes(term)
      );
    }

    return filtered;
  }

  get driverStats() {
    return {
      total: this.drivers.length,
      active: this.drivers.filter(d => d.status === 'active').length,
      inactive: this.drivers.filter(d => d.status === 'inactive').length,
      suspended: this.drivers.filter(d => d.status === 'suspended').length,
      online: this.drivers.filter(d => d.isOnline).length,
      documentsExpiring: this.drivers.filter(d => this.hasExpiringDocuments(d)).length
    };
  }

  hasExpiringDocuments(driver: any): boolean {
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

    return Object.values(driver.documents).some((doc: any) => 
      doc.expiry && new Date(doc.expiry) <= thirtyDaysFromNow
    );
  }

  getDocumentStatus(documents: any): string {
    const statuses = Object.values(documents).map((doc: any) => doc.status);
    if (statuses.includes('expired')) return 'expired';
    if (statuses.includes('failed')) return 'failed';
    if (statuses.includes('pending')) return 'pending';
    return 'complete';
  }

  viewDriverProfile(driverId: string): void {
    console.log('Viewing driver profile:', driverId);
  }

  editDriver(driverId: string): void {
    console.log('Editing driver:', driverId);
  }

  assignVehicle(driverId: string): void {
    console.log('Assigning vehicle to driver:', driverId);
  }

  suspendDriver(driverId: string): void {
    if (confirm('Are you sure you want to suspend this driver?')) {
      const driver = this.drivers.find(d => d.id === driverId);
      if (driver) {
        driver.status = 'suspended';
        driver.isOnline = false;
        console.log('Driver suspended:', driverId);
      }
    }
  }

  activateDriver(driverId: string): void {
    const driver = this.drivers.find(d => d.id === driverId);
    if (driver) {
      driver.status = 'active';
      console.log('Driver activated:', driverId);
    }
  }

  contactDriver(phone: string): void {
    console.log('Contacting driver:', phone);
  }

  viewDocuments(driverId: string): void {
    console.log('Viewing driver documents:', driverId);
  }

  trackDriver(driverId: string): void {
    console.log('Tracking driver location:', driverId);
  }

  addNewDriver(): void {
    console.log('Adding new driver');
  }

  exportDriverList(): void {
    console.log('Exporting driver list');
  }

  getStatusColor(status: string): string {
    const colors = {
      'active': '#10b981',
      'inactive': '#f59e0b',
      'suspended': '#ef4444'
    };
    return colors[status as keyof typeof colors] || '#6b7280';
  }

  getDocumentStatusColor(status: string): string {
    const colors = {
      'complete': '#10b981',
      'pending': '#f59e0b',
      'expired': '#ef4444',
      'failed': '#ef4444'
    };
    return colors[status as keyof typeof colors] || '#6b7280';
  }

  getPerformanceColor(score: number): string {
    if (score >= 90) return '#10b981';
    if (score >= 75) return '#f59e0b';
    return '#ef4444';
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0
    }).format(amount);
  }

}