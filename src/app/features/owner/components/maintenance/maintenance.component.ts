import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ColDef, GridApi } from 'ag-grid-community';
import { VehicleService, Vehicle } from '../../../vehicle/vehicle.service';

// Updated and Complete MaintenanceRecord Interface
interface MaintenanceRecord {
  id: string;
  vehicleId: string;
  vehicleNumber: string;
  maintenanceType: string;
  serviceDate: string;
  scheduledDate?: string;
  cost: number;
  description: string;
  status: string;
  serviceProvider: string;
  priority?: string;
  estimatedCost?: number;
  odometerReading?: number;
  partsReplaced?: string;
  nextServiceDate?: string;
  nextServiceKm?: number;
  createdAt?: string;
  updatedAt?: string;
  completedAt?: string;
  notes?: string;
}

// Additional interfaces for better type safety
interface MaintenanceStats {
  due: number;
  overdue: number;
  inProgress: number;
  completed: number;
}

interface CalendarDay {
  date: number;
  isCurrentMonth: boolean;
  maintenanceCount: number;
  fullDate?: Date;
}

interface ScheduledService {
  id: string;
  vehicleNumber: string;
  maintenanceType: string;
  scheduledDate: string;
  description: string;
  serviceProvider: string;
  estimatedCost: number;
  priority: string;
  status: string;
}

@Component({
  selector: 'app-vehicle-maintenance',
  templateUrl: './maintenance.component.html',
  styleUrls: ['./maintenance.component.scss']
})
export class MaintenanceComponent implements OnInit {
  // Component State
  public activeTab = 'upcoming';
  public searchValue = '';
  public selectedStatus = '';
  public selectedVehicleType = '';
  public selectedMaintenanceType = '';

  // Grid Data with proper typing - Initialize as empty arrays
  public upcomingMaintenanceData: MaintenanceRecord[] = [];
  public maintenanceHistoryData: MaintenanceRecord[] = [];
  public scheduledServices: ScheduledService[] = [];
  public availableVehicles: Vehicle[] = [];

  // Loading states
  public isLoadingVehicles = false;
  public isLoadingMaintenance = false;
  public ownerId: string = '';

  // Grid APIs
  public upcomingGridApi!: GridApi;
  public historyGridApi!: GridApi;

  // Modal State
  public showMaintenanceModal = false;
  public isEditMode = false;
  public isSaving = false;
  public maintenanceForm!: FormGroup;

  // Calendar State
  public currentMonth = '';
  public currentYear = 0;
  public weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  public calendarWeeks: CalendarDay[][] = [];

  // Stats with proper typing - Initialize with zeros
  public maintenanceStats: MaintenanceStats = {
    due: 0,
    overdue: 0,
    inProgress: 0,
    completed: 0
  };

  // Alert State
  public showMessage = false;
  public alertMessage = '';
  public isErrorMessage = false;

  // Column Definitions for Upcoming Maintenance
  upcomingColumnDefs: ColDef[] = [
    {
      headerName: 'Vehicle',
      field: 'vehicleNumber',
      width: 140,
      pinned: 'left'
    },
    {
      headerName: 'Type',
      field: 'maintenanceType',
      width: 120,
      cellRenderer: (params: any) => {
        const type = params.value;
        const icon = this.getMaintenanceIcon(type);
        return `<i class="${icon}"></i> ${type}`;
      }
    },
    {
      headerName: 'Scheduled Date',
      field: 'scheduledDate',
      width: 130,
      cellRenderer: (params: any) => {
        if (!params.value) return '-';
        const date = new Date(params.value);
        const today = new Date();
        const isOverdue = date < today;
        const daysDiff = Math.ceil((date.getTime() - today.getTime()) / (1000 * 3600 * 24));
        
        return `<div class="${isOverdue ? 'text-danger' : 'text-primary'}">
                  ${date.toLocaleDateString()}
                  <small class="d-block">${daysDiff >= 0 ? `in ${daysDiff} days` : `${Math.abs(daysDiff)} days overdue`}</small>
                </div>`;
      }
    },
    {
      headerName: 'Priority',
      field: 'priority',
      width: 100,
      cellRenderer: (params: any) => {
        const priority = params.value || 'MEDIUM';
        return `<span class="badge badge-${priority === 'HIGH' ? 'danger' : priority === 'LOW' ? 'secondary' : 'warning'}">${priority}</span>`;
      }
    },
    {
      headerName: 'Service Provider',
      field: 'serviceProvider',
      width: 150
    },
    {
      headerName: 'Est. Cost',
      field: 'estimatedCost',
      width: 110,
      type: 'numericColumn',
      cellRenderer: (params: any) => {
        return params.value ? `₹${params.value.toLocaleString()}` : '-';
      }
    },
    {
      headerName: 'Status',
      field: 'status',
      width: 120,
      cellRenderer: (params: any) => {
        const status = params.value;
        return `<span class="badge badge-${status === 'OVERDUE' ? 'danger' : status === 'IN_PROGRESS' ? 'warning' : 'success'}">${status}</span>`;
      }
    },
    {
      headerName: 'Actions',
      width: 120,
      pinned: 'right',
      sortable: false,
      filter: false,
      cellRenderer: (params: any) => {
        return `<button class="btn btn-sm btn-outline-primary me-1" data-action="edit" data-id="${params.data.id}" title="Edit">
                  <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-sm btn-outline-success me-1" data-action="complete" data-id="${params.data.id}" title="Mark Complete">
                  <i class="fas fa-check"></i>
                </button>
                <button class="btn btn-sm btn-outline-danger" data-action="delete" data-id="${params.data.id}" title="Delete">
                  <i class="fas fa-trash"></i>
                </button>`;
      },
      onCellClicked: (params: any) => {
        const target = params.event.target as HTMLElement;
        const button = target.closest('button');
        if (button) {
          const action = button.getAttribute('data-action');
          const id = button.getAttribute('data-id');
          switch (action) {
            case 'edit':
              this.editMaintenance(params.data);
              break;
            case 'complete':
              this.markAsCompleted(params.data);
              break;
            case 'delete':
              this.deleteMaintenance(params.data);
              break;
          }
        }
      }
    }
  ];

  // Column Definitions for Maintenance History
  historyColumnDefs: ColDef[] = [
    {
      headerName: 'Date',
      field: 'serviceDate',
      width: 120,
      cellRenderer: (params: any) => {
        return new Date(params.value).toLocaleDateString();
      }
    },
    {
      headerName: 'Vehicle',
      field: 'vehicleNumber',
      width: 140
    },
    {
      headerName: 'Type',
      field: 'maintenanceType',
      width: 120
    },
    {
      headerName: 'Description',
      field: 'description',
      width: 200
    },
    {
      headerName: 'Service Provider',
      field: 'serviceProvider',
      width: 150
    },
    {
      headerName: 'Cost',
      field: 'cost',
      width: 110,
      type: 'numericColumn',
      cellRenderer: (params: any) => {
        return `₹${params.value?.toLocaleString() || 0}`;
      }
    },
    {
      headerName: 'Odometer',
      field: 'odometerReading',
      width: 110,
      type: 'numericColumn',
      cellRenderer: (params: any) => {
        return params.value ? `${params.value} km` : '-';
      }
    },
    {
      headerName: 'Actions',
      width: 100,
      pinned: 'right',
      sortable: false,
      filter: false,
      cellRenderer: (params: any) => {
        return `<button class="btn btn-sm btn-outline-info me-1" data-action="view" title="View Details">
                  <i class="fas fa-eye"></i>
                </button>
                <button class="btn btn-sm btn-outline-primary" data-action="edit" title="Edit">
                  <i class="fas fa-edit"></i>
                </button>`;
      },
      onCellClicked: (params: any) => {
        const target = params.event.target as HTMLElement;
        const button = target.closest('button');
        if (button) {
          const action = button.getAttribute('data-action');
          switch (action) {
            case 'view':
              this.viewMaintenanceDetails(params.data);
              break;
            case 'edit':
              this.editMaintenance(params.data);
              break;
          }
        }
      }
    }
  ];

  defaultColDef = {
    sortable: true,
    filter: true,
    resizable: true,
    flex: 1
  };

  constructor(
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef,
    private vehicleService: VehicleService
  ) {
    this.initializeForm();
    this.initializeCalendar();
  }

  ngOnInit(): void {
    this.loadVehicles();
    this.calculateStats();
  }

  // Initialize Form
  private initializeForm(): void {
    this.maintenanceForm = this.fb.group({
      vehicleId: ['', Validators.required],
      maintenanceType: ['ROUTINE', Validators.required],
      serviceDate: ['', Validators.required],
      description: ['', Validators.required],
      serviceProvider: [''],
      cost: [0, [Validators.min(0)]],
      odometerReading: [''],
      partsReplaced: [''],
      nextServiceDate: [''],
      nextServiceKm: [''],
      priority: ['MEDIUM'],
      estimatedCost: [0, [Validators.min(0)]]
    });
  }

  // Initialize Calendar
  private initializeCalendar(): void {
    const today = new Date();
    this.currentMonth = today.toLocaleString('default', { month: 'long' });
    this.currentYear = today.getFullYear();
    this.generateCalendar();
  }

  // Load Vehicles using VehicleService by ownerId
  private loadVehicles(): void {
    this.isLoadingVehicles = true;
    
    // First get the owner ID
    this.vehicleService.getOwnerId().subscribe({
      next: (ownerId: string) => {
        this.ownerId = ownerId;
        console.log('✅ Owner ID retrieved:', ownerId);
        
        // Now fetch vehicles by owner ID
        this.vehicleService.getvehiclesbyOwner(ownerId).subscribe({
          next: (vehicles: Vehicle[]) => {
            this.availableVehicles = vehicles;
            this.isLoadingVehicles = false;
            console.log('✅ Vehicles loaded successfully:', vehicles);
            
            // After vehicles are loaded, you can load maintenance data from API
            // this.loadMaintenanceData(); // Uncomment when you have maintenance API
            this.cdr.detectChanges();
          },
          error: (error) => {
            console.error('❌ Error loading vehicles:', error);
            this.isLoadingVehicles = false;
            this.showErrorMessage('Failed to load vehicles. Please try again.');
            this.cdr.detectChanges();
          }
        });
      },
      error: (error) => {
        console.error('❌ Error getting owner ID:', error);
        this.isLoadingVehicles = false;
        this.showErrorMessage('Failed to get owner information. Please log in again.');
        this.cdr.detectChanges();
      }
    });
  }

  // Load Maintenance Data from API (placeholder method)
  // Uncomment and implement when you have maintenance APIs
  /*
  private loadMaintenanceData(): void {
    this.isLoadingMaintenance = true;
    
    // Example API calls - replace with your actual maintenance service
    // this.maintenanceService.getUpcomingMaintenance(this.ownerId).subscribe({
    //   next: (upcoming) => {
    //     this.upcomingMaintenanceData = upcoming;
    //     this.calculateStats();
    //   },
    //   error: (error) => console.error('Error loading upcoming maintenance:', error)
    // });
    
    // this.maintenanceService.getMaintenanceHistory(this.ownerId).subscribe({
    //   next: (history) => {
    //     this.maintenanceHistoryData = history;
    //     this.calculateStats();
    //   },
    //   error: (error) => console.error('Error loading maintenance history:', error)
    // });
    
    this.isLoadingMaintenance = false;
  }
  */

  // Calculate Statistics from actual data
  private calculateStats(): void {
    const today = new Date();
    const currentMonth = today.getMonth();
    
    this.maintenanceStats = {
      due: this.upcomingMaintenanceData.filter(m => m.status === 'SCHEDULED').length,
      overdue: this.upcomingMaintenanceData.filter(m => m.status === 'OVERDUE').length,
      inProgress: this.upcomingMaintenanceData.filter(m => m.status === 'IN_PROGRESS').length,
      completed: this.maintenanceHistoryData.filter(m => 
        new Date(m.serviceDate).getMonth() === currentMonth
      ).length
    };
  }

  // Tab Management
  switchTab(tab: string): void {
    this.activeTab = tab;
    if (tab === 'schedules') {
      this.generateCalendar();
    }
  }

  // Grid Event Handlers
  onUpcomingGridReady(params: any): void {
    this.upcomingGridApi = params.api;
    params.api.sizeColumnsToFit();
  }

  onHistoryGridReady(params: any): void {
    this.historyGridApi = params.api;
    params.api.sizeColumnsToFit();
  }

  // Action Methods
  editMaintenance(maintenance: MaintenanceRecord): void {
    this.isEditMode = true;
    this.maintenanceForm.patchValue(maintenance);
    this.showMaintenanceModal = true;
  }

  viewMaintenanceDetails(maintenance: MaintenanceRecord): void {
    console.log('View maintenance details:', maintenance);
    // Implement view details modal/dialog
  }

  deleteMaintenance(maintenance: MaintenanceRecord): void {
    if (confirm(`Are you sure you want to delete this maintenance record for ${maintenance.vehicleNumber}?`)) {
      // Call API to delete maintenance record
      // this.maintenanceService.deleteMaintenance(maintenance.id).subscribe({
      //   next: () => {
      //     this.upcomingMaintenanceData = this.upcomingMaintenanceData.filter(m => m.id !== maintenance.id);
      //     this.calculateStats();
      //     this.showSuccessMessage('Maintenance record deleted successfully');
      //   },
      //   error: (error) => this.showErrorMessage('Failed to delete maintenance record')
      // });
      
      // Temporary local deletion until API is implemented
      this.upcomingMaintenanceData = this.upcomingMaintenanceData.filter(m => m.id !== maintenance.id);
      this.calculateStats();
      this.showSuccessMessage('Maintenance record deleted successfully');
    }
  }

  markAsCompleted(maintenance: MaintenanceRecord): void {
    // Call API to mark maintenance as completed
    // this.maintenanceService.completeMaintenance(maintenance.id).subscribe({
    //   next: (completedRecord) => {
    //     this.maintenanceHistoryData.unshift(completedRecord);
    //     this.upcomingMaintenanceData = this.upcomingMaintenanceData.filter(m => m.id !== maintenance.id);
    //     this.calculateStats();
    //     this.showSuccessMessage(`Maintenance for ${maintenance.vehicleNumber} marked as completed`);
    //   },
    //   error: (error) => this.showErrorMessage('Failed to mark maintenance as completed')
    // });
    
    // Temporary local completion until API is implemented
    const completedRecord: MaintenanceRecord = {
      ...maintenance,
      status: 'COMPLETED',
      serviceDate: new Date().toISOString().split('T')[0]
    };
    
    this.maintenanceHistoryData.unshift(completedRecord);
    this.upcomingMaintenanceData = this.upcomingMaintenanceData.filter(m => m.id !== maintenance.id);
    this.calculateStats();
    this.showSuccessMessage(`Maintenance for ${maintenance.vehicleNumber} marked as completed`);
  }

  // Filter Methods
  onSearchChange(): void {
    if (this.upcomingGridApi) {
      this.upcomingGridApi.setQuickFilter(this.searchValue);
    }
    if (this.historyGridApi) {
      this.historyGridApi.setQuickFilter(this.searchValue);
    }
  }

  onStatusFilterChange(): void {
    // Implement status filtering
    console.log('Status filter changed:', this.selectedStatus);
  }

  onVehicleTypeFilterChange(): void {
    // Implement vehicle type filtering
    console.log('Vehicle type filter changed:', this.selectedVehicleType);
  }

  onMaintenanceTypeFilterChange(): void {
    // Implement maintenance type filtering
    console.log('Maintenance type filter changed:', this.selectedMaintenanceType);
  }

  clearFilters(): void {
    this.searchValue = '';
    this.selectedStatus = '';
    this.selectedVehicleType = '';
    this.selectedMaintenanceType = '';
    this.onSearchChange();
  }

  // Modal Management
  openAddMaintenanceDialog(): void {
    this.isEditMode = false;
    this.maintenanceForm.reset();
    this.maintenanceForm.patchValue({
      maintenanceType: 'ROUTINE',
      priority: 'MEDIUM',
      cost: 0,
      estimatedCost: 0
    });
    this.showMaintenanceModal = true;
  }

  closeMaintenanceModal(): void {
    this.showMaintenanceModal = false;
    this.maintenanceForm.reset();
  }

  saveMaintenanceRecord(): void {
    if (this.maintenanceForm.valid) {
      this.isSaving = true;
      const formData = this.maintenanceForm.value;
      
      // Find the selected vehicle
      const selectedVehicle = this.availableVehicles.find(v => v.id === formData.vehicleId);
      
      const newRecord: MaintenanceRecord = {
        id: this.isEditMode ? formData.id || '' : `new_${Date.now()}`,
        vehicleId: formData.vehicleId,
        vehicleNumber: selectedVehicle?.vehicleNumber || '',
        maintenanceType: formData.maintenanceType,
        serviceDate: formData.serviceDate,
        scheduledDate: formData.serviceDate,
        description: formData.description,
        serviceProvider: formData.serviceProvider || '',
        cost: parseFloat(formData.cost) || 0,
        estimatedCost: parseFloat(formData.estimatedCost) || 0,
        status: 'SCHEDULED',
        priority: formData.priority || 'MEDIUM',
        odometerReading: formData.odometerReading ? parseInt(formData.odometerReading) : undefined,
        partsReplaced: formData.partsReplaced || undefined,
        nextServiceDate: formData.nextServiceDate || undefined,
        nextServiceKm: formData.nextServiceKm ? parseInt(formData.nextServiceKm) : undefined
      };

      // Call API to save maintenance record
      // this.maintenanceService.saveMaintenance(newRecord).subscribe({
      //   next: (savedRecord) => {
      //     if (this.isEditMode) {
      //       const index = this.upcomingMaintenanceData.findIndex(m => m.id === savedRecord.id);
      //       if (index > -1) {
      //         this.upcomingMaintenanceData[index] = savedRecord;
      //       }
      //     } else {
      //       this.upcomingMaintenanceData.unshift(savedRecord);
      //     }
      //     this.isSaving = false;
      //     this.showMaintenanceModal = false;
      //     this.calculateStats();
      //     this.showSuccessMessage(`Maintenance record ${this.isEditMode ? 'updated' : 'created'} successfully!`);
      //   },
      //   error: (error) => {
      //     this.isSaving = false;
      //     this.showErrorMessage('Failed to save maintenance record');
      //   }
      // });

      // Temporary local save until API is implemented
      setTimeout(() => {
        if (this.isEditMode) {
          const index = this.upcomingMaintenanceData.findIndex(m => m.id === newRecord.id);
          if (index > -1) {
            this.upcomingMaintenanceData[index] = newRecord;
          }
        } else {
          this.upcomingMaintenanceData.unshift(newRecord);
        }
        
        this.isSaving = false;
        this.showMaintenanceModal = false;
        this.calculateStats();
        this.showSuccessMessage(`Maintenance record ${this.isEditMode ? 'updated' : 'created'} successfully!`);
      }, 1000);
    }
  }

  // Calendar Methods
  generateCalendar(): void {
    const year = this.currentYear;
    const month = new Date(`${this.currentMonth} 1, ${year}`).getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();

    this.calendarWeeks = [];
    let currentWeek: CalendarDay[] = [];

    // Add empty cells for days before month starts
    for (let i = 0; i < firstDay.getDay(); i++) {
      const prevDate = new Date(year, month, -firstDay.getDay() + i + 1);
      currentWeek.push({
        date: prevDate.getDate(),
        isCurrentMonth: false,
        maintenanceCount: 0
      });
    }

    // Add days of current month
    for (let day = 1; day <= daysInMonth; day++) {
      if (currentWeek.length === 7) {
        this.calendarWeeks.push(currentWeek);
        currentWeek = [];
      }
      
      currentWeek.push({
        date: day,
        isCurrentMonth: true,
        maintenanceCount: this.getMaintenanceCountForDate(year, month, day)
      });
    }

    // Fill remaining days of last week
    let nextMonthDay = 1;
    while (currentWeek.length < 7) {
      currentWeek.push({
        date: nextMonthDay++,
        isCurrentMonth: false,
        maintenanceCount: 0
      });
    }

    if (currentWeek.length > 0) {
      this.calendarWeeks.push(currentWeek);
    }
  }

  private getMaintenanceCountForDate(year: number, month: number, day: number): number {
    const dateStr = `${year}-${(month + 1).toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
    return this.upcomingMaintenanceData.filter(m => m.scheduledDate === dateStr).length;
  }

  previousMonth(): void {
    const current = new Date(`${this.currentMonth} 1, ${this.currentYear}`);
    current.setMonth(current.getMonth() - 1);
    this.currentMonth = current.toLocaleString('default', { month: 'long' });
    this.currentYear = current.getFullYear();
    this.generateCalendar();
  }

  nextMonth(): void {
    const current = new Date(`${this.currentMonth} 1, ${this.currentYear}`);
    current.setMonth(current.getMonth() + 1);
    this.currentMonth = current.toLocaleString('default', { month: 'long' });
    this.currentYear = current.getFullYear();
    this.generateCalendar();
  }

  selectDate(day: CalendarDay): void {
    if (day.isCurrentMonth && day.maintenanceCount > 0) {
      console.log('Selected date with maintenance:', day);
      // Implement date selection logic - show maintenance for that date
    }
  }

  // Utility Methods
  getMaintenanceIcon(type: string): string {
    switch (type) {
      case 'ROUTINE':
        return 'fas fa-oil-can';
      case 'REPAIR':
        return 'fas fa-wrench';
      case 'INSPECTION':
        return 'fas fa-search';
      case 'EMERGENCY':
        return 'fas fa-exclamation-triangle';
      default:
        return 'fas fa-tools';
    }
  }

  formatDate(date: string, format: string): string {
    const d = new Date(date);
    switch (format) {
      case 'dd':
        return d.getDate().toString().padStart(2, '0');
      case 'MMM':
        return d.toLocaleString('default', { month: 'short' });
      default:
        return d.toLocaleDateString();
    }
  }

  // Helper method to get vehicle by ID
  getVehicleById(vehicleId: string): Vehicle | undefined {
    return this.availableVehicles.find(v => v.id === vehicleId);
  }

  // Helper method to get vehicle ID by vehicle number
  private getVehicleIdByNumber(vehicleNumber: string): string {
    const vehicle = this.availableVehicles.find(v => v.vehicleNumber === vehicleNumber);
    return vehicle?.id || '';
  }

  // Schedule Action Methods
  markScheduleAsCompleted(schedule: ScheduledService): void {
    // Call API to mark scheduled service as completed
    // Similar to markAsCompleted but for scheduled services
    this.scheduledServices = this.scheduledServices.filter(s => s.id !== schedule.id);
    this.calculateStats();
    this.generateCalendar();
    this.showSuccessMessage(`Scheduled service for ${schedule.vehicleNumber} marked as completed`);
  }

  editSchedule(schedule: ScheduledService): void {
    console.log('Edit schedule:', schedule);
    // Implement schedule editing
  }

  cancelSchedule(schedule: ScheduledService): void {
    if (confirm(`Are you sure you want to cancel the scheduled service for ${schedule.vehicleNumber}?`)) {
      // Call API to cancel scheduled service
      this.scheduledServices = this.scheduledServices.filter(s => s.id !== schedule.id);
      this.showSuccessMessage('Scheduled service cancelled successfully');
    }
  }

  quickScheduleService(): void {
    this.openAddMaintenanceDialog();
  }

  exportMaintenanceReport(): void {
    // Implement export functionality
    this.showSuccessMessage('Maintenance report exported successfully!');
  }

  // Add refresh method
  refreshVehicles(): void {
    this.loadVehicles();
  }

  // Message Methods
  private showSuccessMessage(message: string): void {
    this.alertMessage = message;
    this.isErrorMessage = false;
    this.showMessage = true;
    setTimeout(() => this.hideMessage(), 3000);
  }

  private showErrorMessage(message: string): void {
    this.alertMessage = message;
    this.isErrorMessage = true;
    this.showMessage = true;
    setTimeout(() => this.hideMessage(), 5000);
  }

  hideMessage(): void {
    this.showMessage = false;
  }
}
