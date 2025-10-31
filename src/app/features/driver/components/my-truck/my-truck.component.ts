import { Component, OnInit } from '@angular/core';

interface Truck {
  id: string;
  plateNumber: string;
  model: string;
  year: number;
  capacity: string;
  status: 'active' | 'maintenance' | 'inactive';
  mileage: number;
  fuelType: string;
  lastServiceDate: Date;
  nextServiceDue: Date;
  documents: TruckDocument[];
  location: {
    latitude: number;
    longitude: number;
    address: string;
    lastUpdated: Date;
  };
  earnings: {
    daily: number;
    weekly: number;
    monthly: number;
  };
  maintenance: MaintenanceRecord[];
}

interface TruckDocument {
  id: string;
  type: 'registration' | 'insurance' | 'permit' | 'inspection';
  number: string;
  issueDate: Date;
  expiryDate: Date;
  status: 'valid' | 'expired' | 'expiring';
  fileUrl?: string;
}

interface MaintenanceRecord {
  id: string;
  date: Date;
  type: 'routine' | 'repair' | 'emergency';
  description: string;
  cost: number;
  serviceProvider: string;
  nextServiceDate?: Date;
}

interface ServiceAlert {
  id: string;
  type: 'maintenance' | 'document' | 'inspection';
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  dueDate: Date;
  daysRemaining: number;
}

@Component({
  selector: 'app-my-truck',
  templateUrl: './my-truck.component.html',
  styleUrls: ['./my-truck.component.scss']
})
export class MyTruckComponent implements OnInit {

  // Main truck data
  trucks: Truck[] = [];
  selectedTruck: Truck | null = null;
  
  // UI state
  activeTab: string = 'overview';
  showAddTruckModal: boolean = false;
  showMaintenanceModal: boolean = false;
  showDocumentModal: boolean = false;
  
  // Service alerts
  serviceAlerts: ServiceAlert[] = [];
  
  // Filters and search
  statusFilter: string = 'all';
  searchTerm: string = '';
  
  // Chart data
  chartData: any = {};

  ngOnInit(): void {
    this.loadTrucks();
    this.loadServiceAlerts();
    this.setupChartData();
  }

  // Data loading methods
  loadTrucks(): void {
    // Sample truck data - replace with actual API call
    this.trucks = [
      {
        id: 'TRK001',
        plateNumber: 'JR-2024-001',
        model: 'Volvo FH16',
        year: 2022,
        capacity: '40 tons',
        status: 'active',
        mileage: 45230,
        fuelType: 'Diesel',
        lastServiceDate: new Date('2024-09-15'),
        nextServiceDue: new Date('2024-12-15'),
        documents: [
          {
            id: 'DOC001',
            type: 'registration',
            number: 'REG-2024-001',
            issueDate: new Date('2024-01-01'),
            expiryDate: new Date('2025-01-01'),
            status: 'valid'
          },
          {
            id: 'DOC002',
            type: 'insurance',
            number: 'INS-2024-001',
            issueDate: new Date('2024-01-01'),
            expiryDate: new Date('2024-11-15'),
            status: 'expiring'
          }
        ],
        location: {
          latitude: 28.7041,
          longitude: 77.1025,
          address: 'Connaught Place, New Delhi',
          lastUpdated: new Date()
        },
        earnings: {
          daily: 12500,
          weekly: 87500,
          monthly: 375000
        },
        maintenance: [
          {
            id: 'MAINT001',
            date: new Date('2024-09-15'),
            type: 'routine',
            description: 'Engine oil change and filter replacement',
            cost: 8500,
            serviceProvider: 'JR Service Center'
          }
        ]
      },
      {
        id: 'TRK002',
        plateNumber: 'JR-2024-002',
        model: 'Tata Prima 4940.S',
        year: 2021,
        capacity: '35 tons',
        status: 'maintenance',
        mileage: 67890,
        fuelType: 'Diesel',
        lastServiceDate: new Date('2024-08-20'),
        nextServiceDue: new Date('2024-11-20'),
        documents: [
          {
            id: 'DOC003',
            type: 'registration',
            number: 'REG-2024-002',
            issueDate: new Date('2024-01-01'),
            expiryDate: new Date('2025-01-01'),
            status: 'valid'
          }
        ],
        location: {
          latitude: 19.0760,
          longitude: 72.8777,
          address: 'Mumbai Central, Mumbai',
          lastUpdated: new Date()
        },
        earnings: {
          daily: 0,
          weekly: 45000,
          monthly: 280000
        },
        maintenance: []
      }
    ];
    
    if (this.trucks.length > 0) {
      this.selectedTruck = this.trucks[0];
    }
  }

  loadServiceAlerts(): void {
    this.serviceAlerts = [
      {
        id: 'ALERT001',
        type: 'document',
        title: 'Insurance Expiring Soon',
        description: 'Truck JR-2024-001 insurance expires in 15 days',
        priority: 'high',
        dueDate: new Date('2024-11-15'),
        daysRemaining: 15
      },
      {
        id: 'ALERT002',
        type: 'maintenance',
        title: 'Scheduled Service Due',
        description: 'Truck JR-2024-002 service is overdue',
        priority: 'medium',
        dueDate: new Date('2024-11-20'),
        daysRemaining: 20
      }
    ];
  }

  setupChartData(): void {
    // Sample chart data for earnings and performance
    this.chartData = {
      earnings: {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
        data: [280000, 320000, 375000, 290000, 410000, 380000]
      },
      performance: {
        fuelEfficiency: 12.5,
        uptime: 92,
        maintenanceCost: 45000
      }
    };
  }

  // Tab management
  switchTab(tab: string): void {
    this.activeTab = tab;
  }

  // Truck selection
  selectTruck(truck: Truck): void {
    this.selectedTruck = truck;
  }

  // Filtering and search
  getFilteredTrucks(): Truck[] {
    return this.trucks.filter(truck => {
      const matchesStatus = this.statusFilter === 'all' || truck.status === this.statusFilter;
      const matchesSearch = truck.plateNumber.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
                           truck.model.toLowerCase().includes(this.searchTerm.toLowerCase());
      return matchesStatus && matchesSearch;
    });
  }

  // Status helpers
  getStatusClass(status: string): string {
    switch (status) {
      case 'active': return 'status-active';
      case 'maintenance': return 'status-maintenance';
      case 'inactive': return 'status-inactive';
      default: return '';
    }
  }

  getDocumentStatusClass(status: string): string {
    switch (status) {
      case 'valid': return 'doc-valid';
      case 'expired': return 'doc-expired';
      case 'expiring': return 'doc-expiring';
      default: return '';
    }
  }

  getPriorityClass(priority: string): string {
    switch (priority) {
      case 'high': return 'priority-high';
      case 'medium': return 'priority-medium';
      case 'low': return 'priority-low';
      default: return '';
    }
  }

  // Modal management
  openAddTruckModal(): void {
    this.showAddTruckModal = true;
  }

  closeAddTruckModal(): void {
    this.showAddTruckModal = false;
  }

  openMaintenanceModal(): void {
    this.showMaintenanceModal = true;
  }

  closeMaintenanceModal(): void {
    this.showMaintenanceModal = false;
  }

  openDocumentModal(): void {
    this.showDocumentModal = true;
  }

  closeDocumentModal(): void {
    this.showDocumentModal = false;
  }

  // Actions
  scheduleService(truck: Truck): void {
    console.log('Scheduling service for truck:', truck.plateNumber);
    // TODO: Implement service scheduling
  }

  renewDocument(document: TruckDocument): void {
    console.log('Renewing document:', document.type);
    // TODO: Implement document renewal
  }

  trackLocation(truck: Truck): void {
    console.log('Tracking location for truck:', truck.plateNumber);
    // TODO: Implement real-time tracking
  }

  viewMaintenanceHistory(truck: Truck): void {
    console.log('Viewing maintenance history for:', truck.plateNumber);
    // TODO: Show detailed maintenance history
  }

  downloadReport(): void {
    console.log('Downloading truck report...');
    // TODO: Generate and download PDF report
  }

  // Utility methods
  formatDate(date: Date): string {
    return date.toLocaleDateString('en-IN');
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  }

  getDaysUntil(date: Date): number {
    const today = new Date();
    const diffTime = date.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }
}