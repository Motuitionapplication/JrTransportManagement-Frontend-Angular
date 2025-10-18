import { Component, OnInit } from '@angular/core';

interface Driver {
  id: string;
  name: string;
  phone: string;
  email: string;
  licenseNumber: string;
  vehicleType: string;
  status: 'active' | 'inactive' | 'busy';
  rating: number;
  totalTrips: number;
  joinDate: Date;
}

@Component({
  selector: 'app-admin-drivers',
  template: `
    <div class="drivers-management">
      <!-- Header -->
      <div class="page-header">
        <h1 class="page-title">Drivers Management</h1>
        <div class="page-actions">
          <button class="btn btn-primary" (click)="addNewDriver()">
            <i class="fas fa-plus"></i>
            Add Driver
          </button>
        </div>
      </div>

      <!-- Statistics Cards -->
      <div class="stats-row">
        <div class="stat-card active">
          <div class="stat-icon">
            <i class="fas fa-user-check"></i>
          </div>
          <div class="stat-content">
            <h3>{{ getActiveDrivers() }}</h3>
            <p>Active Drivers</p>
          </div>
        </div>

        <div class="stat-card busy">
          <div class="stat-icon">
            <i class="fas fa-user-clock"></i>
          </div>
          <div class="stat-content">
            <h3>{{ getBusyDrivers() }}</h3>
            <p>Busy Drivers</p>
          </div>
        </div>

        <div class="stat-card inactive">
          <div class="stat-icon">
            <i class="fas fa-user-times"></i>
          </div>
          <div class="stat-content">
            <h3>{{ getInactiveDrivers() }}</h3>
            <p>Inactive Drivers</p>
          </div>
        </div>

        <div class="stat-card rating">
          <div class="stat-icon">
            <i class="fas fa-star"></i>
          </div>
          <div class="stat-content">
            <h3>{{ getAverageRating() }}</h3>
            <p>Average Rating</p>
          </div>
        </div>
      </div>

      <!-- Filter Section -->
      <div class="filters-section">
        <div class="search-box">
          <input 
            type="text" 
            placeholder="Search drivers..." 
            [(ngModel)]="searchTerm" 
            (input)="filterDrivers()"
            class="search-input">
          <i class="fas fa-search search-icon"></i>
        </div>

        <select [(ngModel)]="selectedStatus" (change)="filterDrivers()" class="status-filter">
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="busy">Busy</option>
          <option value="inactive">Inactive</option>
        </select>

        <select [(ngModel)]="selectedVehicleType" (change)="filterDrivers()" class="vehicle-filter">
          <option value="">All Vehicles</option>
          <option value="truck">Truck</option>
          <option value="mini-truck">Mini Truck</option>
          <option value="tempo">Tempo</option>
          <option value="van">Van</option>
        </select>
      </div>

      <!-- Drivers Grid -->
      <div class="drivers-grid">
        <div class="driver-card" *ngFor="let driver of filteredDrivers">
          <div class="driver-header">
            <div class="driver-avatar">
              {{ getDriverInitials(driver.name) }}
            </div>
            <div class="driver-info">
              <h3 class="driver-name">{{ driver.name }}</h3>
              <p class="driver-id">ID: {{ driver.id }}</p>
              <div class="driver-status">
                <span class="status-badge" [ngClass]="driver.status">
                  {{ driver.status | titlecase }}
                </span>
              </div>
            </div>
            <div class="driver-actions">
              <button class="action-btn" (click)="viewDriver(driver)" title="View Details">
                <i class="fas fa-eye"></i>
              </button>
              <button class="action-btn" (click)="editDriver(driver)" title="Edit">
                <i class="fas fa-edit"></i>
              </button>
              <button class="action-btn danger" (click)="removeDriver(driver)" title="Remove">
                <i class="fas fa-trash"></i>
              </button>
            </div>
          </div>

          <div class="driver-details">
            <div class="detail-item">
              <i class="fas fa-phone"></i>
              <span>{{ driver.phone }}</span>
            </div>
            <div class="detail-item">
              <i class="fas fa-envelope"></i>
              <span>{{ driver.email }}</span>
            </div>
            <div class="detail-item">
              <i class="fas fa-id-card"></i>
              <span>License: {{ driver.licenseNumber }}</span>
            </div>
            <div class="detail-item">
              <i class="fas fa-truck"></i>
              <span>{{ driver.vehicleType | titlecase }}</span>
            </div>
          </div>

          <div class="driver-stats">
            <div class="stat-item">
              <div class="stat-value">{{ driver.totalTrips }}</div>
              <div class="stat-label">Total Trips</div>
            </div>
            <div class="stat-item">
              <div class="stat-value">
                {{ driver.rating }}
                <i class="fas fa-star"></i>
              </div>
              <div class="stat-label">Rating</div>
            </div>
            <div class="stat-item">
              <div class="stat-value">{{ getJoinedDays(driver.joinDate) }}</div>
              <div class="stat-label">Days Joined</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div class="empty-state" *ngIf="filteredDrivers.length === 0">
        <i class="fas fa-users"></i>
        <h3>No drivers found</h3>
        <p>Try adjusting your search criteria or add a new driver</p>
      </div>
    </div>
  `,
  styles: [`
    .drivers-management {
      padding: 1rem;
      background: #f5f5f5;
      min-height: 100vh;
    }

    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2rem;
    }

    .page-title {
      font-size: 2rem;
      font-weight: 600;
      color: #333;
      margin: 0;
    }

    .btn {
      padding: 0.75rem 1.5rem;
      border-radius: 8px;
      border: none;
      cursor: pointer;
      font-weight: 500;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      transition: all 0.3s ease;
    }

    .btn-primary {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
    }

    .btn-primary:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
    }

    .stats-row {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1rem;
      margin-bottom: 2rem;
    }

    .stat-card {
      background: white;
      padding: 1.5rem;
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .stat-icon {
      width: 50px;
      height: 50px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.2rem;
      color: white;
    }

    .stat-card.active .stat-icon { background: #4caf50; }
    .stat-card.busy .stat-icon { background: #ff9800; }
    .stat-card.inactive .stat-icon { background: #f44336; }
    .stat-card.rating .stat-icon { background: #2196f3; }

    .stat-content h3 {
      font-size: 1.5rem;
      font-weight: 700;
      margin: 0;
      color: #333;
    }

    .stat-content p {
      font-size: 0.9rem;
      color: #666;
      margin: 0.25rem 0 0 0;
    }

    .filters-section {
      display: flex;
      gap: 1rem;
      margin-bottom: 2rem;
      padding: 1rem;
      background: white;
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }

    .search-box {
      position: relative;
      flex: 2;
    }

    .search-input {
      width: 100%;
      padding: 0.75rem 1rem 0.75rem 2.5rem;
      border: 1px solid #ddd;
      border-radius: 8px;
      font-size: 0.9rem;
    }

    .search-icon {
      position: absolute;
      left: 0.75rem;
      top: 50%;
      transform: translateY(-50%);
      color: #666;
    }

    .status-filter, .vehicle-filter {
      padding: 0.75rem;
      border: 1px solid #ddd;
      border-radius: 8px;
      font-size: 0.9rem;
      flex: 1;
    }

    .drivers-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
      gap: 1.5rem;
    }

    .driver-card {
      background: white;
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      overflow: hidden;
      transition: transform 0.3s ease;
    }

    .driver-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
    }

    .driver-header {
      padding: 1.5rem;
      display: flex;
      align-items: flex-start;
      gap: 1rem;
    }

    .driver-avatar {
      width: 50px;
      height: 50px;
      border-radius: 50%;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 600;
      font-size: 1.1rem;
    }

    .driver-info {
      flex: 1;
    }

    .driver-name {
      font-size: 1.1rem;
      font-weight: 600;
      margin: 0 0 0.25rem 0;
      color: #333;
    }

    .driver-id {
      font-size: 0.8rem;
      color: #666;
      margin: 0 0 0.5rem 0;
    }

    .status-badge {
      padding: 0.25rem 0.75rem;
      border-radius: 20px;
      font-size: 0.75rem;
      font-weight: 500;
      text-transform: uppercase;
    }

    .status-badge.active {
      background: rgba(76, 175, 80, 0.1);
      color: #4caf50;
    }

    .status-badge.busy {
      background: rgba(255, 152, 0, 0.1);
      color: #ff9800;
    }

    .status-badge.inactive {
      background: rgba(244, 67, 54, 0.1);
      color: #f44336;
    }

    .driver-actions {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .action-btn {
      width: 35px;
      height: 35px;
      border: none;
      border-radius: 8px;
      background: #f0f0f0;
      color: #666;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.3s ease;
    }

    .action-btn:hover {
      background: #e0e0e0;
      color: #333;
    }

    .action-btn.danger:hover {
      background: #f44336;
      color: white;
    }

    .driver-details {
      padding: 0 1.5rem;
      border-top: 1px solid #f0f0f0;
    }

    .detail-item {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.75rem 0;
      border-bottom: 1px solid #f8f8f8;
      font-size: 0.9rem;
    }

    .detail-item:last-child {
      border-bottom: none;
    }

    .detail-item i {
      width: 16px;
      color: #666;
    }

    .driver-stats {
      display: flex;
      padding: 1rem 1.5rem;
      background: #f8f9fa;
    }

    .stat-item {
      flex: 1;
      text-align: center;
    }

    .stat-value {
      font-size: 1.1rem;
      font-weight: 600;
      color: #333;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.25rem;
    }

    .stat-value i {
      color: #ffc107;
      font-size: 0.9rem;
    }

    .stat-label {
      font-size: 0.75rem;
      color: #666;
      margin-top: 0.25rem;
    }

    .empty-state {
      text-align: center;
      padding: 4rem 2rem;
      color: #666;
    }

    .empty-state i {
      font-size: 4rem;
      margin-bottom: 1rem;
      color: #ddd;
    }

    .empty-state h3 {
      font-size: 1.5rem;
      margin: 0 0 0.5rem 0;
    }

    .empty-state p {
      font-size: 1rem;
      margin: 0;
    }

    /* Responsive Design */
    @media (max-width: 768px) {
      .drivers-grid {
        grid-template-columns: 1fr;
      }
      
      .filters-section {
        flex-direction: column;
      }
      
      .stats-row {
        grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
      }
      
      .page-header {
        flex-direction: column;
        gap: 1rem;
        align-items: stretch;
      }
    }
  `]
})
export class AdminDriversComponent implements OnInit {
  
  searchTerm: string = '';
  selectedStatus: string = '';
  selectedVehicleType: string = '';

  drivers: Driver[] = [
    {
      id: 'D001',
      name: 'Raj Kumar Singh',
      phone: '+91 9876543210',
      email: 'raj.kumar@example.com',
      licenseNumber: 'DL123456789',
      vehicleType: 'truck',
      status: 'active',
      rating: 4.5,
      totalTrips: 156,
      joinDate: new Date('2023-01-15')
    },
    {
      id: 'D002',
      name: 'Suresh Patel',
      phone: '+91 9876543211',
      email: 'suresh.patel@example.com',
      licenseNumber: 'DL987654321',
      vehicleType: 'mini-truck',
      status: 'busy',
      rating: 4.2,
      totalTrips: 98,
      joinDate: new Date('2023-03-20')
    },
    {
      id: 'D003',
      name: 'Arun Singh',
      phone: '+91 9876543212',
      email: 'arun.singh@example.com',
      licenseNumber: 'DL456789123',
      vehicleType: 'truck',
      status: 'active',
      rating: 4.8,
      totalTrips: 203,
      joinDate: new Date('2022-11-10')
    },
    {
      id: 'D004',
      name: 'Vikash Yadav',
      phone: '+91 9876543213',
      email: 'vikash.yadav@example.com',
      licenseNumber: 'DL789123456',
      vehicleType: 'tempo',
      status: 'inactive',
      rating: 3.9,
      totalTrips: 67,
      joinDate: new Date('2023-06-05')
    },
    {
      id: 'D005',
      name: 'Raman Sharma',
      phone: '+91 9876543214',
      email: 'raman.sharma@example.com',
      licenseNumber: 'DL321654987',
      vehicleType: 'van',
      status: 'active',
      rating: 4.6,
      totalTrips: 124,
      joinDate: new Date('2023-02-28')
    }
  ];

  filteredDrivers: Driver[] = [];

  constructor() { }

  ngOnInit(): void {
    this.filteredDrivers = [...this.drivers];
  }

  filterDrivers(): void {
    this.filteredDrivers = this.drivers.filter(driver => {
      const matchesSearch = !this.searchTerm || 
        driver.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        driver.id.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        driver.phone.includes(this.searchTerm);
      
      const matchesStatus = !this.selectedStatus || driver.status === this.selectedStatus;
      const matchesVehicle = !this.selectedVehicleType || driver.vehicleType === this.selectedVehicleType;
      
      return matchesSearch && matchesStatus && matchesVehicle;
    });
  }

  getDriverInitials(name: string): string {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  }

  getJoinedDays(joinDate: Date): number {
    const today = new Date();
    const diffTime = Math.abs(today.getTime() - joinDate.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  getActiveDrivers(): number {
    return this.drivers.filter(d => d.status === 'active').length;
  }

  getBusyDrivers(): number {
    return this.drivers.filter(d => d.status === 'busy').length;
  }

  getInactiveDrivers(): number {
    return this.drivers.filter(d => d.status === 'inactive').length;
  }

  getAverageRating(): string {
    const sum = this.drivers.reduce((acc, driver) => acc + driver.rating, 0);
    return (sum / this.drivers.length).toFixed(1);
  }

  addNewDriver(): void {
    console.log('Add new driver clicked');
    // Implement add driver functionality
  }

  viewDriver(driver: Driver): void {
    console.log('View driver:', driver);
    // Implement view driver functionality
  }

  editDriver(driver: Driver): void {
    console.log('Edit driver:', driver);
    // Implement edit driver functionality
  }

  removeDriver(driver: Driver): void {
    console.log('Remove driver:', driver);
    // Implement remove driver functionality
  }
}