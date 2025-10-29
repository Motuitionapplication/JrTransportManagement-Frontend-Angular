import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ColDef, GridApi, ICellRendererParams } from 'ag-grid-community';
import { VehicleService, Vehicle } from '../../../vehicle/vehicle.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';

// Service Center Maintenance Record Interface
interface ServiceCenterMaintenance {
  id?: string;
  vehicleId: string;
  vehicleNumber?: string;
  serviceCenterId: string;
  type: string;
  serviceDate: string;
  cost: number;
  description: string;
  receipt: string;
  createdAt?: string;
}

// Stats Interface
interface MaintenanceStats {
  totalRecords: number;
  totalCost: number;
  thisMonthRecords: number;
  thisMonthCost: number;
}

@Component({
  selector: 'app-service-maintenance',
  templateUrl: './maintenance.component.html',
  styleUrls: ['./maintenance.component.scss']
})
export class MaintenanceComponent implements OnInit {
  
  // API Configuration
  private apiUrl = 'http://localhost:8080/api';
  private ownerId: string = '';

  // Component State
  public activeTab = 'all';
  public searchValue = '';
  public selectedVehicle = '';
  public selectedType = '';
  public startDate = '';
  public endDate = '';

  // Grid Data
  public maintenanceRecords: ServiceCenterMaintenance[] = [];
  public availableVehicles: Vehicle[] = [];
  public serviceCenterOptions: string[] = [];
  public maintenanceTypes: string[] = [
    'ROUTINE_SERVICE',
    'REPAIR',
    'BREAKDOWN',
    'INSPECTION',
    'INSURANCE_CLAIM'
  ];

  // Loading States
  public isLoadingVehicles = false;
  public isLoadingMaintenance = false;
  public isSaving = false;

  // Grid API
  public gridApi!: GridApi;

  // Modal State
  public showMaintenanceModal = false;
  public isEditMode = false;
  public currentRecordId: string | null = null;
  public maintenanceForm!: FormGroup;

  // Stats
  public maintenanceStats: MaintenanceStats = {
    totalRecords: 0,
    totalCost: 0,
    thisMonthRecords: 0,
    thisMonthCost: 0
  };

  // Alert State
  public showMessage = false;
  public alertMessage = '';
  public isErrorMessage = false;

  // Delete Confirmation
  public showDeleteConfirm = false;
  private deleteRecordId: string | null = null;

  // Column Definitions with improved styling
  columnDefs: ColDef[] = [
    {
      headerName: 'Vehicle Number',
      field: 'vehicleNumber',
      width: 150,
      pinned: 'left',
      filter: 'agTextColumnFilter',
      cellStyle: { fontWeight: '600', color: '#1a73e8' },
      cellRenderer: (params: ICellRendererParams) => {
        if (!params.value || params.value === 'Unknown') {
          return `<span style="color: #999; font-style: italic;">Unknown</span>`;
        }
        return `<span style="font-weight: 600; color: #1a73e8;">
                  <i class="fas fa-truck" style="margin-right: 6px; font-size: 12px;"></i>
                  ${params.value}
                </span>`;
      }
    },
    {
      headerName: 'Service Type',
      field: 'type',
      width: 170,
      filter: 'agTextColumnFilter',
      cellRenderer: (params: ICellRendererParams) => {
        const typeConfig: {[key: string]: {icon: string, color: string, bg: string}} = {
          'ROUTINE_SERVICE': {icon: 'fa-oil-can', color: '#0d9488', bg: '#ccfbf1'},
          'REPAIR': {icon: 'fa-wrench', color: '#f59e0b', bg: '#fef3c7'},
          'BREAKDOWN': {icon: 'fa-exclamation-triangle', color: '#dc2626', bg: '#fee2e2'},
          'INSPECTION': {icon: 'fa-stethoscope', color: '#3b82f6', bg: '#dbeafe'},
          'INSURANCE_CLAIM': {icon: 'fa-shield-alt', color: '#8b5cf6', bg: '#ede9fe'}
        };
        
        const config = typeConfig[params.value] || {icon: 'fa-tools', color: '#6b7280', bg: '#f3f4f6'};
        
        return `
          <span style="display: inline-flex; align-items: center; padding: 4px 10px; 
                       background: ${config.bg}; border-radius: 6px; font-size: 13px; font-weight: 500;">
            <i class="fas ${config.icon}" style="color: ${config.color}; margin-right: 6px; font-size: 12px;"></i>
            <span style="color: ${config.color};">${params.value.replace(/_/g, ' ')}</span>
          </span>
        `;
      }
    },
    {
      headerName: 'Service Date',
      field: 'serviceDate',
      width: 140,
      filter: 'agDateColumnFilter',
      sort: 'desc',
      cellRenderer: (params: ICellRendererParams) => {
        if (!params.value) return '-';
        const date = new Date(params.value);
        const formatted = date.toLocaleDateString('en-IN', {
          day: '2-digit',
          month: 'short',
          year: 'numeric'
        });
        
        const today = new Date();
        const daysDiff = Math.floor((today.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
        const timeAgo = daysDiff === 0 ? 'Today' : 
                       daysDiff === 1 ? 'Yesterday' : 
                       daysDiff < 7 ? `${daysDiff} days ago` : 
                       formatted;
        
        return `
          <div style="display: flex; flex-direction: column; line-height: 1.4;">
            <span style="font-weight: 500; color: #111827;">${formatted}</span>
            <span style="font-size: 11px; color: #9ca3af;">${timeAgo}</span>
          </div>
        `;
      }
    },
    {
      headerName: 'Service Center',
      field: 'serviceCenterId',
      width: 200,
      filter: 'agTextColumnFilter',
      cellRenderer: (params: ICellRendererParams) => {
        return `
          <span style="display: inline-flex; align-items: center;">
            <i class="fas fa-map-marker-alt" style="color: #ef4444; margin-right: 6px; font-size: 11px;"></i>
            <span style="color: #374151;">${params.value || '-'}</span>
          </span>
        `;
      }
    },
    {
      headerName: 'Cost (₹)',
      field: 'cost',
      width: 130,
      filter: 'agNumberColumnFilter',
      cellStyle: (params) => {
        const cost = params.value;
        if (cost > 20000) return { fontWeight: '700', color: '#dc2626', fontSize: '14px' };
        if (cost > 10000) return { fontWeight: '600', color: '#f59e0b', fontSize: '14px' };
        return { fontWeight: '600', color: '#059669', fontSize: '14px' };
      },
      valueFormatter: (params: any) => {
        if (!params.value) return '₹0';
        return `₹${params.value.toLocaleString('en-IN', {minimumFractionDigits: 0, maximumFractionDigits: 0})}`;
      },
      aggFunc: 'sum'
    },
    {
      headerName: 'Description',
      field: 'description',
      width: 300,
      filter: 'agTextColumnFilter',
      tooltipField: 'description',
      cellRenderer: (params: ICellRendererParams) => {
        const text = params.value || '-';
        const truncated = text.length > 60 ? text.substring(0, 60) + '...' : text;
        return `
          <div style="color: #6b7280; font-size: 13px; line-height: 1.5; overflow: hidden; text-overflow: ellipsis;">
            ${truncated}
          </div>
        `;
      }
    },
    {
      headerName: 'Receipt',
      field: 'receipt',
      width: 120,
      cellRenderer: (params: ICellRendererParams) => {
        if (params.value) {
          return `
            <a href="${params.value}" target="_blank" 
               style="display: inline-flex; align-items: center; color: #2563eb; text-decoration: none; 
                      font-size: 13px; font-weight: 500; padding: 4px 8px; border-radius: 4px;
                      transition: all 0.2s;">
              <i class="fas fa-file-invoice" style="margin-right: 5px;"></i>
              <span>View</span>
            </a>
          `;
        }
        return '<span style="color: #d1d5db; font-size: 12px; font-style: italic;">No receipt</span>';
      }
    },
    {
      headerName: 'Created',
      field: 'createdAt',
      width: 120,
      filter: 'agDateColumnFilter',
      cellRenderer: (params: ICellRendererParams) => {
        if (!params.value) return '-';
        const date = new Date(params.value);
        return `
          <span style="color: #6b7280; font-size: 12px;">
            ${date.toLocaleDateString('en-IN', {day: '2-digit', month: 'short', year: '2-digit'})}
          </span>
        `;
      }
    },
    {
      headerName: 'Actions',
      width: 120,
      pinned: 'right',
      cellRenderer: (params: ICellRendererParams) => {
        return `
          <div class="action-buttons" style="display: flex; gap: 6px; justify-content: center;">
            <button class="btn-icon btn-edit" data-action="edit" 
                    style="width: 32px; height: 32px; border: none; border-radius: 6px; 
                           background: #eff6ff; color: #2563eb; cursor: pointer; 
                           display: flex; align-items: center; justify-content: center;
                           transition: all 0.2s;"
                    onmouseover="this.style.background='#dbeafe'; this.style.transform='scale(1.1)';"
                    onmouseout="this.style.background='#eff6ff'; this.style.transform='scale(1)';">
              <i class="fas fa-edit" style="font-size: 13px;"></i>
            </button>
            <button class="btn-icon btn-delete" data-action="delete"
                    style="width: 32px; height: 32px; border: none; border-radius: 6px; 
                           background: #fef2f2; color: #dc2626; cursor: pointer; 
                           display: flex; align-items: center; justify-content: center;
                           transition: all 0.2s;"
                    onmouseover="this.style.background='#fee2e2'; this.style.transform='scale(1.1)';"
                    onmouseout="this.style.background='#fef2f2'; this.style.transform='scale(1)';">
              <i class="fas fa-trash" style="font-size: 13px;"></i>
            </button>
          </div>
        `;
      },
      onCellClicked: (params: any) => {
        const target = params.event.target as HTMLElement;
        const button = target.closest('button');
        if (button) {
          const action = button.getAttribute('data-action');
          if (action === 'edit') {
            this.editMaintenanceRecord(params.data);
          } else if (action === 'delete') {
            this.deleteMaintenanceRecord(params.data.id);
          }
        }
      }
    }
  ];

  defaultColDef: ColDef = {
    sortable: true,
    resizable: true,
    filter: true,
    floatingFilter: true,
    filterParams: {
      buttons: ['reset', 'apply'],
      closeOnApply: true
    }
  };

  // Grid options
// Grid options with proper typing
public gridOptions = {
  rowHeight: 55,
  headerHeight: 48,
  animateRows: true,
  pagination: true,
  paginationPageSize: 20,
  suppressCellSelection: true,
  rowSelection: 'multiple' as const, // ✅ Use 'as const' to make it a literal type
  enableCellTextSelection: true,
  tooltipShowDelay: 500,
  suppressMenuHide: true
};


  constructor(
    private fb: FormBuilder,
    private vehicleService: VehicleService,
    private http: HttpClient,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.initializeForm();
    
    this.vehicleService.getOwnerId().subscribe({
      next: (id: string) => {
        this.ownerId = id;
        console.log('Owner ID:', this.ownerId);
        this.loadVehicles();
        this.loadMaintenanceRecords();
      },
      error: (error) => {
        console.error('Error getting owner ID:', error);
        this.ownerId = 'default-owner-123';
        this.loadVehicles();
        this.loadMaintenanceRecords();
      }
    });
    
    this.loadServiceCenters();
  }

  initializeForm(): void {
    this.maintenanceForm = this.fb.group({
      vehicleId: ['', Validators.required],
      serviceCenterId: ['', Validators.required],
      type: ['', Validators.required],
      serviceDate: ['', Validators.required],
      cost: ['', [Validators.required, Validators.min(0)]],
      description: ['', [Validators.required, Validators.maxLength(255)]],
      receipt: ['', Validators.maxLength(255)]
    });
  }

  loadVehicles(): void {
    this.isLoadingVehicles = true;
    this.vehicleService.getvehiclesbyOwner(this.ownerId).subscribe({
      next: (vehicles) => {
        this.availableVehicles = vehicles;
        this.isLoadingVehicles = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error loading vehicles:', error);
        this.showAlert('Failed to load vehicles', true);
        this.isLoadingVehicles = false;
      }
    });
  }

  loadServiceCenters(): void {
    this.serviceCenterOptions = [
      'Mumbai Service Center',
      'Delhi Service Center',
      'Bangalore Service Center',
      'Pune Service Center',
      'Hyderabad Service Center'
    ];
  }

  loadMaintenanceRecords(): void {
    this.isLoadingMaintenance = true;
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });

    this.http.get<ServiceCenterMaintenance[]>(
      `${this.apiUrl}/maintenance/owner/${this.ownerId}`,
      { headers }
    ).subscribe({
      next: (records) => {
        this.maintenanceRecords = records.map(record => ({
          ...record,
          vehicleNumber: this.getVehicleNumber(record.vehicleId)
        }));
        this.calculateStats();
        this.isLoadingMaintenance = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error loading maintenance records:', error);
        this.showAlert('Failed to load maintenance records', true);
        this.isLoadingMaintenance = false;
      }
    });
  }

  getVehicleNumber(vehicleId: string): string {
    const vehicle = this.availableVehicles.find(v => v.id === vehicleId);
    return vehicle?.vehicleNumber || 'Unknown';
  }

  calculateStats(): void {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    this.maintenanceStats = {
      totalRecords: this.maintenanceRecords.length,
      totalCost: this.maintenanceRecords.reduce((sum, r) => sum + r.cost, 0),
      thisMonthRecords: this.maintenanceRecords.filter(r => {
        const serviceDate = new Date(r.serviceDate);
        return serviceDate.getMonth() === currentMonth && 
               serviceDate.getFullYear() === currentYear;
      }).length,
      thisMonthCost: this.maintenanceRecords
        .filter(r => {
          const serviceDate = new Date(r.serviceDate);
          return serviceDate.getMonth() === currentMonth && 
                 serviceDate.getFullYear() === currentYear;
        })
        .reduce((sum, r) => sum + r.cost, 0)
    };
  }

  openMaintenanceModal(): void {
    this.isEditMode = false;
    this.currentRecordId = null;
    this.maintenanceForm.reset();
    this.showMaintenanceModal = true;
  }

  closeMaintenanceModal(): void {
    this.showMaintenanceModal = false;
    this.maintenanceForm.reset();
    this.currentRecordId = null;
  }

  editMaintenanceRecord(record: ServiceCenterMaintenance): void {
    this.isEditMode = true;
    this.currentRecordId = record.id || null;
    this.maintenanceForm.patchValue({
      vehicleId: record.vehicleId,
      serviceCenterId: record.serviceCenterId,
      type: record.type,
      serviceDate: record.serviceDate,
      cost: record.cost,
      description: record.description,
      receipt: record.receipt
    });
    this.showMaintenanceModal = true;
  }

  onSubmitMaintenanceForm(): void {
    if (this.maintenanceForm.invalid) {
      this.markFormGroupTouched(this.maintenanceForm);
      this.showAlert('Please fill all required fields correctly', true);
      return;
    }

    this.isSaving = true;
    const formData = this.maintenanceForm.value;
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });

    if (this.isEditMode && this.currentRecordId) {
      this.http.put(
        `${this.apiUrl}/maintenance/${this.currentRecordId}`,
        formData,
        { headers }
      ).subscribe({
        next: () => {
          this.showAlert('Maintenance record updated successfully', false);
          this.closeMaintenanceModal();
          this.loadMaintenanceRecords();
          this.isSaving = false;
        },
        error: (error) => {
          console.error('Error updating record:', error);
          this.showAlert('Failed to update maintenance record', true);
          this.isSaving = false;
        }
      });
    } else {
      this.http.post<ServiceCenterMaintenance>(
        `${this.apiUrl}/maintenance`,
        formData,
        { headers }
      ).subscribe({
        next: () => {
          this.showAlert('Maintenance record added successfully', false);
          this.closeMaintenanceModal();
          this.loadMaintenanceRecords();
          this.isSaving = false;
        },
        error: (error) => {
          console.error('Error creating record:', error);
          this.showAlert('Failed to add maintenance record', true);
          this.isSaving = false;
        }
      });
    }
  }

  deleteMaintenanceRecord(id: string): void {
    this.deleteRecordId = id;
    this.showDeleteConfirm = true;
  }

  cancelDelete(): void {
    this.showDeleteConfirm = false;
    this.deleteRecordId = null;
  }

  confirmDelete(): void {
    if (this.deleteRecordId) {
      const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
      this.http.delete(`${this.apiUrl}/maintenance/${this.deleteRecordId}`, { headers }).subscribe({
        next: () => {
          this.showAlert('Maintenance record deleted successfully', false);
          this.loadMaintenanceRecords();
          this.showDeleteConfirm = false;
          this.deleteRecordId = null;
        },
        error: (error) => {
          console.error('Error deleting record:', error);
          this.showAlert('Failed to delete maintenance record', true);
          this.showDeleteConfirm = false;
        }
      });
    }
  }

  onGridReady(params: any): void {
    this.gridApi = params.api;
    params.api.sizeColumnsToFit();
  }

  onQuickFilterChanged(): void {
    if (this.gridApi) {
      this.gridApi.setQuickFilter(this.searchValue);
    }
  }

  exportToCSV(): void {
    if (this.gridApi) {
      this.gridApi.exportDataAsCsv({
        fileName: `maintenance-records-${new Date().toISOString().split('T')[0]}.csv`
      });
    }
  }

  getCurrentDate(): string {
    const today = new Date();
    return today.toISOString().split('T')[0];
  }

  markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();
      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }

  showAlert(message: string, isError: boolean): void {
    this.alertMessage = message;
    this.isErrorMessage = isError;
    this.showMessage = true;
    setTimeout(() => {
      this.showMessage = false;
    }, 5000);
  }
}
