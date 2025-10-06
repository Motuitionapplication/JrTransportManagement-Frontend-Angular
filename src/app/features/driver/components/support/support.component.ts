import { Component, OnInit } from '@angular/core';

export interface SupportTicket {
  id: string;
  title: string;
  description: string;
  category: 'technical' | 'account' | 'payment' | 'general';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'open' | 'in-progress' | 'resolved' | 'closed';
  createdAt: Date;
  updatedAt: Date;
  driverId: string;
  assignedAgent?: string;
  attachments: SupportAttachment[];
  messages: SupportMessage[];
}

export interface SupportMessage {
  id: string;
  ticketId: string;
  senderId: string;
  senderType: 'driver' | 'support';
  message: string;
  timestamp: Date;
  attachments?: SupportAttachment[];
}

export interface SupportAttachment {
  id: string;
  filename: string;
  fileUrl: string;
  fileType: string;
  fileSize: number;
  uploadedAt: Date;
}

export interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: string;
  tags: string[];
  views: number;
  helpful: number;
  notHelpful: number;
  expanded?: boolean; // Add expanded property for UI state
}

export interface ContactInfo {
  phone: string;
  email: string;
  hours: string;
  emergencyPhone: string;
}

@Component({
  selector: 'app-support',
  templateUrl: './support.component.html',
  styleUrls: ['./support.component.scss']
})
export class SupportComponent implements OnInit {
  // Active tab management
  activeTab: string = 'tickets';

  // Support tickets
  supportTickets: SupportTicket[] = [];
  filteredTickets: SupportTicket[] = [];
  
  // FAQ data
  faqItems: FAQItem[] = [];
  filteredFAQs: FAQItem[] = [];
  
  // Contact information
  contactInfo: ContactInfo = {
    phone: '+1-800-555-HELP',
    email: 'support@jrtransport.com',
    hours: '24/7 Support Available',
    emergencyPhone: '+1-800-555-URGENT'
  };

  // Modal controls
  showNewTicketModal: boolean = false;
  showTicketModal: boolean = false;
  selectedTicket: SupportTicket | null = null;

  // Form data
  newTicket: Partial<SupportTicket> = {
    title: '',
    description: '',
    category: 'general',
    priority: 'medium'
  };

  // Search and filtering
  ticketSearchQuery: string = '';
  faqSearchQuery: string = '';
  selectedCategory: string = 'all';
  selectedStatus: string = 'all';

  // File upload
  selectedFiles: File[] = [];

  constructor() {}

  ngOnInit(): void {
    this.loadSupportTickets();
    this.loadFAQItems();
  }

  // Tab management
  setActiveTab(tab: string): void {
    this.activeTab = tab;
  }

  // Load support tickets
  loadSupportTickets(): void {
    // Mock data - replace with actual API call
    this.supportTickets = [
      {
        id: 'TK-001',
        title: 'Unable to upload driving license',
        description: 'Getting error when trying to upload my driving license document',
        category: 'technical',
        priority: 'medium',
        status: 'open',
        createdAt: new Date('2024-01-15T10:30:00'),
        updatedAt: new Date('2024-01-15T10:30:00'),
        driverId: 'DRV-001',
        attachments: [],
        messages: [
          {
            id: 'MSG-001',
            ticketId: 'TK-001',
            senderId: 'DRV-001',
            senderType: 'driver',
            message: 'I am unable to upload my driving license. The file is in PDF format and under 5MB.',
            timestamp: new Date('2024-01-15T10:30:00')
          }
        ]
      },
      {
        id: 'TK-002',
        title: 'Payment not received',
        description: 'My last week earnings are not showing in my wallet',
        category: 'payment',
        priority: 'high',
        status: 'in-progress',
        createdAt: new Date('2024-01-14T14:20:00'),
        updatedAt: new Date('2024-01-15T09:15:00'),
        driverId: 'DRV-001',
        assignedAgent: 'Sarah Johnson',
        attachments: [],
        messages: [
          {
            id: 'MSG-002',
            ticketId: 'TK-002',
            senderId: 'DRV-001',
            senderType: 'driver',
            message: 'I completed 15 trips last week but payment is not reflected in my wallet.',
            timestamp: new Date('2024-01-14T14:20:00')
          },
          {
            id: 'MSG-003',
            ticketId: 'TK-002',
            senderId: 'SUPP-001',
            senderType: 'support',
            message: 'Hi! I am looking into your payment issue. Can you please provide your trip IDs from last week?',
            timestamp: new Date('2024-01-15T09:15:00')
          }
        ]
      }
    ];
    this.filterTickets();
  }

  // Load FAQ items
  loadFAQItems(): void {
    // Mock data - replace with actual API call
    this.faqItems = [
      {
        id: 'FAQ-001',
        question: 'How do I update my profile information?',
        answer: 'Go to Profile section, click Edit Profile, make your changes and save. Some changes may require verification.',
        category: 'Account',
        tags: ['profile', 'update', 'edit'],
        views: 245,
        helpful: 32,
        notHelpful: 3
      },
      {
        id: 'FAQ-002',
        question: 'When will I receive my payments?',
        answer: 'Payments are processed weekly on Fridays. It may take 1-2 business days to reflect in your bank account.',
        category: 'Payments',
        tags: ['payment', 'salary', 'earnings'],
        views: 189,
        helpful: 28,
        notHelpful: 1
      },
      {
        id: 'FAQ-003',
        question: 'How do I report a vehicle breakdown?',
        answer: 'Use the Emergency button in the app or call our 24/7 support line. We will arrange immediate assistance.',
        category: 'Emergency',
        tags: ['breakdown', 'emergency', 'vehicle'],
        views: 156,
        helpful: 22,
        notHelpful: 2
      },
      {
        id: 'FAQ-004',
        question: 'Can I change my assigned routes?',
        answer: 'Route assignments are based on efficiency and demand. Contact support to discuss route preference changes.',
        category: 'Routes',
        tags: ['routes', 'assignment', 'schedule'],
        views: 134,
        helpful: 19,
        notHelpful: 4
      }
    ];
    this.filterFAQs();
  }

  // Filter tickets
  filterTickets(): void {
    this.filteredTickets = this.supportTickets.filter(ticket => {
      const matchesSearch = !this.ticketSearchQuery || 
        ticket.title.toLowerCase().includes(this.ticketSearchQuery.toLowerCase()) ||
        ticket.description.toLowerCase().includes(this.ticketSearchQuery.toLowerCase());
      
      const matchesCategory = this.selectedCategory === 'all' || ticket.category === this.selectedCategory;
      const matchesStatus = this.selectedStatus === 'all' || ticket.status === this.selectedStatus;
      
      return matchesSearch && matchesCategory && matchesStatus;
    });
  }

  // Filter FAQs
  filterFAQs(): void {
    this.filteredFAQs = this.faqItems.filter(faq => {
      return !this.faqSearchQuery || 
        faq.question.toLowerCase().includes(this.faqSearchQuery.toLowerCase()) ||
        faq.answer.toLowerCase().includes(this.faqSearchQuery.toLowerCase()) ||
        faq.tags.some(tag => tag.toLowerCase().includes(this.faqSearchQuery.toLowerCase()));
    });
  }

  // Ticket operations
  createNewTicket(): void {
    if (!this.newTicket.title || !this.newTicket.description) {
      return;
    }

    const ticket: SupportTicket = {
      id: `TK-${String(this.supportTickets.length + 1).padStart(3, '0')}`,
      title: this.newTicket.title!,
      description: this.newTicket.description!,
      category: this.newTicket.category as any || 'general',
      priority: this.newTicket.priority as any || 'medium',
      status: 'open',
      createdAt: new Date(),
      updatedAt: new Date(),
      driverId: 'DRV-001', // Current driver ID
      attachments: [],
      messages: [
        {
          id: `MSG-${Date.now()}`,
          ticketId: `TK-${String(this.supportTickets.length + 1).padStart(3, '0')}`,
          senderId: 'DRV-001',
          senderType: 'driver',
          message: this.newTicket.description!,
          timestamp: new Date()
        }
      ]
    };

    this.supportTickets.unshift(ticket);
    this.filterTickets();
    this.closeNewTicketModal();
    
    // Reset form
    this.newTicket = {
      title: '',
      description: '',
      category: 'general',
      priority: 'medium'
    };
  }

  openTicket(ticket: SupportTicket): void {
    this.selectedTicket = ticket;
    this.showTicketModal = true;
  }

  sendMessage(message: string): void {
    if (!this.selectedTicket || !message.trim()) {
      return;
    }

    const newMessage: SupportMessage = {
      id: `MSG-${Date.now()}`,
      ticketId: this.selectedTicket.id,
      senderId: 'DRV-001',
      senderType: 'driver',
      message: message.trim(),
      timestamp: new Date()
    };

    this.selectedTicket.messages.push(newMessage);
    this.selectedTicket.updatedAt = new Date();

    // Clear the message input (handled in template)
  }

  // Modal controls
  openNewTicketModal(): void {
    this.showNewTicketModal = true;
  }

  closeNewTicketModal(): void {
    this.showNewTicketModal = false;
    this.selectedFiles = [];
  }

  closeTicketModal(): void {
    this.showTicketModal = false;
    this.selectedTicket = null;
  }

  // File handling
  onFileSelected(event: any): void {
    const files = Array.from(event.target.files) as File[];
    this.selectedFiles = [...this.selectedFiles, ...files];
  }

  removeFile(index: number): void {
    this.selectedFiles.splice(index, 1);
  }

  // FAQ helpers
  markFAQHelpful(faq: FAQItem, helpful: boolean): void {
    if (helpful) {
      faq.helpful++;
    } else {
      faq.notHelpful++;
    }
  }

  // Utility methods
  getStatusClass(status: string): string {
    switch (status) {
      case 'open': return 'status-open';
      case 'in-progress': return 'status-in-progress';
      case 'resolved': return 'status-resolved';
      case 'closed': return 'status-closed';
      default: return 'status-open';
    }
  }

  getPriorityClass(priority: string): string {
    switch (priority) {
      case 'low': return 'priority-low';
      case 'medium': return 'priority-medium';
      case 'high': return 'priority-high';
      case 'urgent': return 'priority-urgent';
      default: return 'priority-medium';
    }
  }

  getCategoryIcon(category: string): string {
    switch (category) {
      case 'technical': return 'fas fa-cog';
      case 'account': return 'fas fa-user';
      case 'payment': return 'fas fa-credit-card';
      case 'general': return 'fas fa-question-circle';
      default: return 'fas fa-question-circle';
    }
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}