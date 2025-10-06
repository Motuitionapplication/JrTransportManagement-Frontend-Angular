import { Component, OnInit } from '@angular/core';

export interface Document {
  id: string;
  name: string;
  type: 'license' | 'insurance' | 'registration' | 'medical' | 'background' | 'training' | 'other';
  status: 'approved' | 'pending' | 'rejected' | 'expired' | 'missing';
  uploadDate: Date;
  expiryDate?: Date;
  fileUrl?: string;
  fileName?: string;
  fileSize?: number;
  description?: string;
  isRequired: boolean;
  rejectionReason?: string;
  approvedBy?: string;
  approvedDate?: Date;
}

export interface DocumentCategory {
  name: string;
  type: string;
  icon: string;
  description: string;
  documents: Document[];
  completionStatus: 'complete' | 'incomplete' | 'expiring';
}

export interface UploadProgress {
  documentId: string;
  progress: number;
  isUploading: boolean;
}

@Component({
  selector: 'app-documents',
  templateUrl: './documents.component.html',
  styleUrls: ['./documents.component.scss']
})
export class DocumentsComponent implements OnInit {
  documents: Document[] = [];
  documentCategories: DocumentCategory[] = [];
  loading = true;
  
  // Upload management
  uploadingDocuments = new Map<string, UploadProgress>();
  maxFileSize = 10 * 1024 * 1024; // 10MB
  allowedFileTypes = ['.pdf', '.jpg', '.jpeg', '.png', '.doc', '.docx'];
  
  // UI state
  activeCategory = '';
  showUploadModal = false;
  selectedDocumentType = '';
  
  // Filters and search
  statusFilter = '';
  searchQuery = '';
  sortBy = 'uploadDate';
  sortOrder = 'desc';

  constructor() { }

  ngOnInit(): void {
    this.loadDocuments();
  }

  loadDocuments(): void {
    this.loading = true;
    
    // Simulate API call
    setTimeout(() => {
      this.documents = this.generateMockDocuments();
      this.organizeDocumentsByCategory();
      this.loading = false;
    }, 1000);
  }

  generateMockDocuments(): Document[] {
    const documents: Document[] = [
      {
        id: 'doc_1',
        name: "Driver's License",
        type: 'license',
        status: 'approved',
        uploadDate: new Date('2023-01-15'),
        expiryDate: new Date('2025-06-15'),
        fileName: 'drivers_license.pdf',
        fileSize: 2048576,
        description: 'Valid commercial driver license',
        isRequired: true,
        approvedBy: 'Admin User',
        approvedDate: new Date('2023-01-16')
      },
      {
        id: 'doc_2',
        name: 'Vehicle Insurance',
        type: 'insurance',
        status: 'pending',
        uploadDate: new Date('2023-02-01'),
        expiryDate: new Date('2024-02-28'),
        fileName: 'vehicle_insurance.pdf',
        fileSize: 1536000,
        description: 'Comprehensive vehicle insurance policy',
        isRequired: true,
        approvedBy: 'Admin User',
        approvedDate: new Date('2023-02-02')
      },
      {
        id: 'doc_3',
        name: 'Vehicle Registration',
        type: 'registration',
        status: 'approved',
        uploadDate: new Date('2023-01-20'),
        expiryDate: new Date('2024-12-31'),
        fileName: 'vehicle_registration.jpg',
        fileSize: 1024000,
        description: 'Current vehicle registration certificate',
        isRequired: true,
        approvedBy: 'Admin User',
        approvedDate: new Date('2023-01-21')
      },
      {
        id: 'doc_4',
        name: 'Medical Certificate',
        type: 'medical',
        status: 'pending',
        uploadDate: new Date('2023-12-01'),
        expiryDate: new Date('2024-12-01'),
        fileName: 'medical_certificate.pdf',
        fileSize: 896000,
        description: 'Annual medical fitness certificate',
        isRequired: true
      },
      {
        id: 'doc_5',
        name: 'Background Check',
        type: 'background',
        status: 'approved',
        uploadDate: new Date('2022-12-15'),
        fileName: 'background_check.pdf',
        fileSize: 1792000,
        description: 'Criminal background verification',
        isRequired: true,
        approvedBy: 'HR Department',
        approvedDate: new Date('2022-12-20')
      },
      {
        id: 'doc_6',
        name: 'Safety Training Certificate',
        type: 'training',
        status: 'approved',
        uploadDate: new Date('2023-03-15'),
        expiryDate: new Date('2025-03-15'),
        fileName: 'safety_training.pdf',
        fileSize: 512000,
        description: 'Defensive driving and safety training',
        isRequired: false,
        approvedBy: 'Training Dept',
        approvedDate: new Date('2023-03-16')
      },
      {
        id: 'doc_7',
        name: 'First Aid Certificate',
        type: 'training',
        status: 'rejected',
        uploadDate: new Date('2023-11-10'),
        expiryDate: new Date('2025-11-10'),
        fileName: 'first_aid_cert.jpg',
        fileSize: 768000,
        description: 'Basic first aid training certificate',
        isRequired: false,
        rejectionReason: 'Document quality is poor, please upload a clearer image'
      },
      {
        id: 'doc_8',
        name: 'Tax Documents',
        type: 'other',
        status: 'missing',
        uploadDate: new Date(),
        description: 'Tax identification and related documents',
        isRequired: true
      }
    ];
    
    return documents.sort((a, b) => b.uploadDate.getTime() - a.uploadDate.getTime());
  }

  organizeDocumentsByCategory(): void {
    this.documentCategories = [
      {
        name: 'Driver License & ID',
        type: 'license',
        icon: '🪪',
        description: 'Driver license and identification documents',
        documents: this.documents.filter(doc => doc.type === 'license'),
        completionStatus: this.getCategoryStatus('license')
      },
      {
        name: 'Insurance Documents',
        type: 'insurance',
        icon: '🛡️',
        description: 'Vehicle and liability insurance policies',
        documents: this.documents.filter(doc => doc.type === 'insurance'),
        completionStatus: this.getCategoryStatus('insurance')
      },
      {
        name: 'Vehicle Registration',
        type: 'registration',
        icon: '🚗',
        description: 'Vehicle registration and ownership documents',
        documents: this.documents.filter(doc => doc.type === 'registration'),
        completionStatus: this.getCategoryStatus('registration')
      },
      {
        name: 'Medical Certificates',
        type: 'medical',
        icon: '🏥',
        description: 'Medical fitness and health certificates',
        documents: this.documents.filter(doc => doc.type === 'medical'),
        completionStatus: this.getCategoryStatus('medical')
      },
      {
        name: 'Background Checks',
        type: 'background',
        icon: '🔍',
        description: 'Criminal background and verification documents',
        documents: this.documents.filter(doc => doc.type === 'background'),
        completionStatus: this.getCategoryStatus('background')
      },
      {
        name: 'Training Certificates',
        type: 'training',
        icon: '🎓',
        description: 'Training and certification documents',
        documents: this.documents.filter(doc => doc.type === 'training'),
        completionStatus: this.getCategoryStatus('training')
      },
      {
        name: 'Other Documents',
        type: 'other',
        icon: '📄',
        description: 'Additional required documents',
        documents: this.documents.filter(doc => doc.type === 'other'),
        completionStatus: this.getCategoryStatus('other')
      }
    ];
  }

  getCategoryStatus(categoryType: string): 'complete' | 'incomplete' | 'expiring' {
    const categoryDocs = this.documents.filter(doc => doc.type === categoryType && doc.isRequired);
    
    if (categoryDocs.length === 0) return 'complete';
    
    const hasMissing = categoryDocs.some(doc => doc.status === 'missing' || doc.status === 'rejected');
    const hasExpiring = categoryDocs.some(doc => this.isExpiringSoon(doc));
    
    if (hasMissing) return 'incomplete';
    if (hasExpiring) return 'expiring';
    
    return 'complete';
  }

  isExpiringSoon(document: Document): boolean {
    if (!document.expiryDate) return false;
    
    const now = new Date();
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
    
    return document.expiryDate <= thirtyDaysFromNow && document.expiryDate > now;
  }

  isExpired(document: Document): boolean {
    if (!document.expiryDate) return false;
    return document.expiryDate < new Date();
  }

  // File upload handling
  onFileSelected(event: any, documentType: string): void {
    const files = event.target.files;
    if (files && files.length > 0) {
      for (let file of files) {
        this.uploadDocument(file, documentType);
      }
    }
    event.target.value = ''; // Reset input
  }

  uploadDocument(file: File, documentType: string): void {
    // Validate file
    const validation = this.validateFile(file);
    if (!validation.isValid) {
      alert(validation.message);
      return;
    }

    // Create document entry
    const documentId = `doc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Add upload progress tracking
    this.uploadingDocuments.set(documentId, {
      documentId,
      progress: 0,
      isUploading: true
    });

    // Simulate file upload with progress
    this.simulateFileUpload(documentId, file, documentType);
  }

  validateFile(file: File): { isValid: boolean; message: string } {
    // Check file size
    if (file.size > this.maxFileSize) {
      return {
        isValid: false,
        message: `File size exceeds ${this.formatFileSize(this.maxFileSize)} limit`
      };
    }

    // Check file type
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
    if (!this.allowedFileTypes.includes(fileExtension)) {
      return {
        isValid: false,
        message: `File type ${fileExtension} is not allowed. Allowed types: ${this.allowedFileTypes.join(', ')}`
      };
    }

    return { isValid: true, message: '' };
  }

  simulateFileUpload(documentId: string, file: File, documentType: string): void {
    const uploadProgress = this.uploadingDocuments.get(documentId);
    if (!uploadProgress) return;

    const interval = setInterval(() => {
      uploadProgress.progress += Math.random() * 20;
      
      if (uploadProgress.progress >= 100) {
        uploadProgress.progress = 100;
        uploadProgress.isUploading = false;
        
        // Create new document
        const newDocument: Document = {
          id: documentId,
          name: this.getDocumentName(documentType),
          type: documentType as any,
          status: 'pending',
          uploadDate: new Date(),
          fileName: file.name,
          fileSize: file.size,
          description: `Uploaded ${file.name}`,
          isRequired: this.isRequiredDocument(documentType)
        };

        // Add to documents array
        this.documents.unshift(newDocument);
        this.organizeDocumentsByCategory();
        
        // Remove from upload tracking
        this.uploadingDocuments.delete(documentId);
        
        clearInterval(interval);
        
        console.log(`Document ${file.name} uploaded successfully`);
      }
    }, 200);
  }

  getDocumentName(documentType: string): string {
    const names: { [key: string]: string } = {
      license: "Driver's License",
      insurance: 'Vehicle Insurance',
      registration: 'Vehicle Registration',
      medical: 'Medical Certificate',
      background: 'Background Check',
      training: 'Training Certificate',
      other: 'Other Document'
    };
    return names[documentType] || 'Document';
  }

  isRequiredDocument(documentType: string): boolean {
    const requiredTypes = ['license', 'insurance', 'registration', 'medical', 'background'];
    return requiredTypes.includes(documentType);
  }

  // Document actions
  downloadDocument(document: Document): void {
    if (document.fileUrl) {
      window.open(document.fileUrl, '_blank');
    } else {
      console.log('Downloading document:', document.fileName);
      // TODO: Implement actual download functionality
    }
  }

  viewDocument(document: Document): void {
    if (document.fileUrl) {
      window.open(document.fileUrl, '_blank');
    } else {
      console.log('Viewing document:', document.fileName);
      // TODO: Implement document viewer
    }
  }

  deleteDocument(document: Document): void {
    const confirmDelete = confirm(`Are you sure you want to delete ${document.name}?`);
    
    if (confirmDelete) {
      const index = this.documents.findIndex(doc => doc.id === document.id);
      if (index > -1) {
        this.documents.splice(index, 1);
        this.organizeDocumentsByCategory();
        console.log('Document deleted:', document.name);
      }
    }
  }

  replaceDocument(document: Document): void {
    // Trigger file input for replacement
    const input = (document as any).createElement('input');
    input.type = 'file';
    input.accept = this.allowedFileTypes.join(',');
    input.onchange = (event: any) => {
      const file = event.target.files[0];
      if (file) {
        this.deleteDocument(document);
        this.uploadDocument(file, document.type);
      }
    };
    input.click();
  }

  // UI helpers
  selectCategory(categoryType: string): void {
    this.activeCategory = this.activeCategory === categoryType ? '' : categoryType;
  }

  getFilteredDocuments(): Document[] {
    let filtered = [...this.documents];

    // Apply status filter
    if (this.statusFilter) {
      filtered = filtered.filter(doc => doc.status === this.statusFilter);
    }

    // Apply search filter
    if (this.searchQuery) {
      const query = this.searchQuery.toLowerCase();
      filtered = filtered.filter(doc =>
        doc.name.toLowerCase().includes(query) ||
        doc.description?.toLowerCase().includes(query) ||
        doc.fileName?.toLowerCase().includes(query)
      );
    }

    // Apply category filter
    if (this.activeCategory) {
      filtered = filtered.filter(doc => doc.type === this.activeCategory);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let valueA: any, valueB: any;

      switch (this.sortBy) {
        case 'name':
          valueA = a.name.toLowerCase();
          valueB = b.name.toLowerCase();
          break;
        case 'status':
          valueA = a.status;
          valueB = b.status;
          break;
        case 'uploadDate':
          valueA = a.uploadDate.getTime();
          valueB = b.uploadDate.getTime();
          break;
        case 'expiryDate':
          valueA = a.expiryDate?.getTime() || 0;
          valueB = b.expiryDate?.getTime() || 0;
          break;
        default:
          return 0;
      }

      const comparison = valueA > valueB ? 1 : valueA < valueB ? -1 : 0;
      return this.sortOrder === 'asc' ? comparison : -comparison;
    });

    return filtered;
  }

  clearFilters(): void {
    this.statusFilter = '';
    this.searchQuery = '';
    this.activeCategory = '';
    this.sortBy = 'uploadDate';
    this.sortOrder = 'desc';
  }

  // Upload modal
  openUploadModal(documentType = ''): void {
    this.selectedDocumentType = documentType;
    this.showUploadModal = true;
  }

  closeUploadModal(): void {
    this.showUploadModal = false;
    this.selectedDocumentType = '';
  }

  // Utility methods
  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 B';
    
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  formatDate(date: Date): string {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(date);
  }

  getStatusClass(status: string): string {
    return `status-${status}`;
  }

  getCategoryStatusClass(status: string): string {
    return `category-${status}`;
  }

  getDaysUntilExpiry(document: Document): number {
    if (!document.expiryDate) return Infinity;
    
    const now = new Date();
    const expiry = new Date(document.expiryDate);
    const diffTime = expiry.getTime() - now.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  getDocumentIcon(type: string): string {
    const icons: { [key: string]: string } = {
      license: '🪪',
      insurance: '🛡️',
      registration: '🚗',
      medical: '🏥',
      background: '🔍',
      training: '🎓',
      other: '📄'
    };
    return icons[type] || '📄';
  }

  getStatusIcon(status: string): string {
    const icons: { [key: string]: string } = {
      approved: '✅',
      pending: '⏳',
      rejected: '❌',
      expired: '⚠️',
      missing: '❓'
    };
    return icons[status] || '❓';
  }

  // Bulk operations
  selectAllDocuments(): void {
    // TODO: Implement bulk selection
    console.log('Select all documents');
  }

  downloadAllDocuments(): void {
    // TODO: Implement bulk download
    console.log('Download all documents');
  }

  // Document verification status
  requestVerification(document: Document): void {
    document.status = 'pending';
    console.log('Verification requested for:', document.name);
    // TODO: Implement verification request
  }

  // Help and support
  getDocumentHelp(documentType: string): void {
    console.log('Getting help for document type:', documentType);
    // TODO: Implement help system
  }

  // Helper methods for template calculations
  getApprovedCount(documents: Document[]): number {
    return documents.filter(doc => doc.status === 'approved').length;
  }

  getProgressPercentage(documents: Document[]): number {
    const approved = this.getApprovedCount(documents);
    const total = Math.max(documents.length, 1);
    return (approved / total) * 100;
  }

  trackByDocumentId(index: number, doc: Document): string {
    return doc.id;
  }

  // Math helper for templates
  getMath() {
    return Math;
  }
}