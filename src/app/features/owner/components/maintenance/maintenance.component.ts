import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-maintenance',
  templateUrl: './maintenance.component.html',
  styleUrls: ['./maintenance.component.scss']
})
export class MaintenanceComponent implements OnInit {

  activeTab = 'scheduled';
  
  maintenanceRecords = [
    {
      id: 'MR001',
      vehicleId: 'V001',
      vehiclePlate: 'MH-12-AB-1234',
      type: 'routine',
      category: 'engine',
      title: 'Engine Oil Change',
      description: 'Regular engine oil and filter replacement',
      scheduledDate: new Date('2024-10-01'),
      completedDate: null,
      status: 'scheduled',
      priority: 'medium',
      estimatedCost: 2500,
      actualCost: null,
      serviceProvider: 'ABC Motors Service Center',
      serviceProviderContact: '+91 9876543210',
      nextServiceDue: new Date('2024-12-01'),
      mileageAtService: 45000,
      partsRequired: ['Engine Oil', 'Oil Filter', 'Air Filter'],
      laborHours: 2,
      warrantyPeriod: 30, // days
      notes: 'Use synthetic oil as recommended by manufacturer'
    },
    {
      id: 'MR002',
      vehicleId: 'V002',
      vehiclePlate: 'MH-12-CD-5678',
      type: 'emergency',
      category: 'brake',
      title: 'Brake Pad Replacement',
      description: 'Front brake pads worn out, immediate replacement required',
      scheduledDate: new Date('2024-09-30'),
      completedDate: new Date('2024-09-30T14:30:00'),
      status: 'completed',
      priority: 'high',
      estimatedCost: 4500,
      actualCost: 4200,
      serviceProvider: 'Quick Fix Auto Service',
      serviceProviderContact: '+91 8765432109',
      nextServiceDue: new Date('2025-03-30'),
      mileageAtService: 67000,
      partsRequired: ['Brake Pads', 'Brake Fluid'],
      laborHours: 3,
      warrantyPeriod: 90,
      notes: 'Customer reported squealing noise, pads were at 10% thickness'
    },
    {
      id: 'MR003',
      vehicleId: 'V003',
      vehiclePlate: 'MH-12-EF-9012',
      type: 'preventive',
      category: 'transmission',
      title: 'Transmission Service',
      description: 'Transmission fluid change and inspection',
      scheduledDate: new Date('2024-10-05'),
      completedDate: null,
      status: 'in-progress',
      priority: 'medium',
      estimatedCost: 8500,
      actualCost: null,
      serviceProvider: 'City Auto Care',
      serviceProviderContact: '+91 7654321098',
      nextServiceDue: new Date('2025-04-05'),
      mileageAtService: 89000,
      partsRequired: ['Transmission Fluid', 'Filter Kit'],
      laborHours: 4,
      warrantyPeriod: 60,
      notes: 'Regular maintenance as per service schedule'
    },
    {
      id: 'MR004',
      vehicleId: 'V001',
      vehiclePlate: 'MH-12-AB-1234',
      type: 'repair',
      category: 'electrical',
      title: 'AC System Repair',
      description: 'Air conditioning not cooling properly',
      scheduledDate: new Date('2024-09-25'),
      completedDate: new Date('2024-09-26T11:15:00'),
      status: 'completed',
      priority: 'low',
      estimatedCost: 6500,
      actualCost: 7200,
      serviceProvider: 'Cool Air Service',
      serviceProviderContact: '+91 6543210987',
      nextServiceDue: new Date('2025-09-25'),
      mileageAtService: 44500,
      partsRequired: ['Refrigerant', 'AC Filter', 'Compressor Belt'],
      laborHours: 5,
      warrantyPeriod: 180,
      notes: 'Refrigerant was low, filter was clogged, belt needed adjustment'
    }
  ];

  serviceProviders = [
    {
      id: 'SP001',
      name: 'ABC Motors Service Center',
      contact: '+91 9876543210',
      email: 'service@abcmotors.com',
      address: 'Bandra West, Mumbai',
      specialties: ['Engine', 'Transmission', 'General Maintenance'],
      rating: 4.5,
      isPreferred: true,
      contractedRates: true
    },
    {
      id: 'SP002',
      name: 'Quick Fix Auto Service',
      contact: '+91 8765432109',
      email: 'info@quickfix.com',
      address: 'Andheri East, Mumbai',
      specialties: ['Brake System', 'Emergency Repairs'],
      rating: 4.2,
      isPreferred: false,
      contractedRates: false
    },
    {
      id: 'SP003',
      name: 'City Auto Care',
      contact: '+91 7654321098',
      email: 'care@cityauto.com',
      address: 'Thane West, Mumbai',
      specialties: ['Electrical', 'AC Service', 'Diagnostics'],
      rating: 4.7,
      isPreferred: true,
      contractedRates: true
    }
  ];

  constructor() { }

  ngOnInit(): void {
    console.log('Maintenance component initialized');
  }

  get filteredMaintenanceRecords() {
    if (this.activeTab === 'all') {
      return this.maintenanceRecords;
    }
    return this.maintenanceRecords.filter(record => record.status === this.activeTab);
  }

  get maintenanceStats() {
    const now = new Date();
    const upcomingWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    
    return {
      total: this.maintenanceRecords.length,
      scheduled: this.maintenanceRecords.filter(r => r.status === 'scheduled').length,
      inProgress: this.maintenanceRecords.filter(r => r.status === 'in-progress').length,
      completed: this.maintenanceRecords.filter(r => r.status === 'completed').length,
      overdue: this.maintenanceRecords.filter(r => 
        r.status === 'scheduled' && new Date(r.scheduledDate) < now
      ).length,
      upcomingWeek: this.maintenanceRecords.filter(r => 
        r.status === 'scheduled' && 
        new Date(r.scheduledDate) >= now && 
        new Date(r.scheduledDate) <= upcomingWeek
      ).length,
      totalCostThisMonth: this.maintenanceRecords
        .filter(r => r.completedDate && new Date(r.completedDate).getMonth() === now.getMonth())
        .reduce((sum, r) => sum + (r.actualCost || 0), 0),
      averageCost: Math.round(
        this.maintenanceRecords
          .filter(r => r.actualCost)
          .reduce((sum, r, _, arr) => sum + (r.actualCost || 0) / arr.length, 0)
      )
    };
  }

  setActiveTab(tab: string): void {
    this.activeTab = tab;
  }

  scheduleMaintenanceservice(): void {
    console.log('Scheduling new maintenance service');
  }

  viewMaintenanceDetails(recordId: string): void {
    console.log('Viewing maintenance details:', recordId);
  }

  editMaintenance(recordId: string): void {
    console.log('Editing maintenance record:', recordId);
  }

  markAsCompleted(recordId: string): void {
    const record = this.maintenanceRecords.find(r => r.id === recordId);
    if (record) {
      record.status = 'completed';
      record.completedDate = new Date();
      console.log('Maintenance marked as completed:', recordId);
    }
  }

  cancelMaintenance(recordId: string): void {
    if (confirm('Are you sure you want to cancel this maintenance?')) {
      const index = this.maintenanceRecords.findIndex(r => r.id === recordId);
      if (index > -1) {
        this.maintenanceRecords[index].status = 'cancelled';
        console.log('Maintenance cancelled:', recordId);
      }
    }
  }

  contactServiceProvider(contact: string): void {
    console.log('Contacting service provider:', contact);
  }

  generateMaintenanceReport(): void {
    console.log('Generating maintenance report');
  }

  addServiceProvider(): void {
    console.log('Adding new service provider');
  }

  getPriorityColor(priority: string): string {
    const colors = {
      'high': '#ef4444',
      'medium': '#f59e0b',
      'low': '#10b981'
    };
    return colors[priority as keyof typeof colors] || '#6b7280';
  }

  getStatusColor(status: string): string {
    const colors = {
      'scheduled': '#3b82f6',
      'in-progress': '#f59e0b',
      'completed': '#10b981',
      'cancelled': '#ef4444',
      'overdue': '#dc2626'
    };
    return colors[status as keyof typeof colors] || '#6b7280';
  }

  getCategoryIcon(category: string): string {
    const icons = {
      'engine': 'fa-cog',
      'brake': 'fa-stop-circle',
      'transmission': 'fa-cogs',
      'electrical': 'fa-bolt',
      'suspension': 'fa-compress-arrows-alt',
      'tires': 'fa-circle',
      'general': 'fa-wrench'
    };
    return icons[category as keyof typeof icons] || 'fa-wrench';
  }

  isOverdue(scheduledDate: Date, status: string): boolean {
    return status === 'scheduled' && new Date(scheduledDate) < new Date();
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0
    }).format(amount);
  }

}