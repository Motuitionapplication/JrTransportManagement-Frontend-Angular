import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

export interface SupportTicket {
  id: string;
  ticketNumber: string;
  subject: string;
  description: string;
  category: 'booking' | 'payment' | 'technical' | 'account' | 'complaint' | 'other';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'open' | 'pending' | 'in-progress' | 'waiting-response' | 'resolved' | 'closed';
  createdDate: Date;
  createdAt: Date;
  lastUpdated: Date;
  updatedAt: Date;
  assignedAgent?: string;
  messages: SupportMessage[];
  attachments?: FileAttachment[];
  unreadMessages?: number;
}

export interface SupportMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderType: 'customer' | 'agent' | 'system';
  message: string;
  content?: string;
  timestamp: Date;
  isRead: boolean;
  isFromUser?: boolean;
  attachments?: FileAttachment[];
}

export interface FileAttachment {
  id: string;
  fileName: string;
  name?: string;
  fileSize: number;
  fileType: string;
  uploadDate: Date;
  downloadUrl: string;
  url?: string;
}

export interface FAQItem {
  id: string;
  category: string;
  question: string;
  answer: string;
  isHelpful?: boolean;
  tags: string[];
  isOpen?: boolean;
}

export interface ContactInfo {
  phone: string;
  email: string;
  whatsapp?: string;
  telegram?: string;
  supportHours: {
    weekdays: string;
    weekends: string;
    timezone: string;
  };
  emergencyContact?: string;
}

@Component({
  selector: 'app-support',
  templateUrl: './support.component.html',
  styleUrls: ['./support.component.scss']
})
export class SupportComponent implements OnInit {
  // Active view
  activeView: 'tickets' | 'new-ticket' | 'faq' | 'contact' = 'tickets';
  
  // Forms
  newTicketForm!: FormGroup;
  messageForm!: FormGroup;
  searchForm!: FormGroup;
  
  // Data
  supportTickets: SupportTicket[] = [];
  filteredTickets: SupportTicket[] = [];
  selectedTicket: SupportTicket | null = null;
  faqItems: FAQItem[] = [];
  filteredFAQs: FAQItem[] = [];
  contactInfo: ContactInfo | null = null;
  
  // UI State
  showTicketModal: boolean = false;
  showMessageModal: boolean = false;
  selectedFiles: File[] = [];
  
  // Filters
  statusFilter: string = 'all';
  categoryFilter: string = 'all';
  priorityFilter: string = 'all';
  searchQuery: string = '';
  faqSearchQuery: string = '';
  
  // Loading states
  isLoading: boolean = false;
  isSubmitting: boolean = false;
  isSendingMessage: boolean = false;
  isUploadingFiles: boolean = false;
  
  // Additional properties expected by HTML template
  activeTab: string = 'tickets';
  selectedTicketFilter: string = 'all';
  liveChatAvailable: boolean = false;
  faqSearchTerm: string = '';
  filteredFaqs: FAQItem[] = [];
  faqCategories: Array<{id: string; name: string; icon: string; count: number;}> = [];
  selectedFaqCategory: string = 'all';
  supportInfo: any = null;
  quickContactForm!: FormGroup;
  supportTicketForm!: FormGroup;
  replyForm!: FormGroup;
  selectedAttachments: File[] = [];
  ticketAttachments: File[] = [];
  isSending: boolean = false;
  isCreating: boolean = false;
  replyAttachments: FileAttachment[] = [];
  userGuides: Array<{id: string; title: string; description: string; difficulty: string; icon: string; duration: string;}> = [];

  constructor(private formBuilder: FormBuilder) {
    this.initializeForms();
  }

  ngOnInit(): void {
    this.loadSupportTickets();
    this.loadFAQs();
    this.loadContactInfo();
  }

  // Initialize forms
  private initializeForms(): void {
    this.newTicketForm = this.formBuilder.group({
      subject: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(100)]],
      description: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(1000)]],
      category: ['', [Validators.required]],
      priority: ['medium', [Validators.required]]
    });

    this.messageForm = this.formBuilder.group({
      message: ['', [Validators.required, Validators.minLength(1), Validators.maxLength(500)]]
    });

    this.searchForm = this.formBuilder.group({
      query: ['']
    });
  }

  // Load support tickets
  loadSupportTickets(): void {
    this.isLoading = true;
    // Mock data - replace with actual API call
    setTimeout(() => {
      this.supportTickets = [
        {
          id: 'TKT-001',
          ticketNumber: 'SUP-2024-001',
          subject: 'Payment not processed correctly',
          description: 'My payment was deducted but booking was not confirmed. Transaction ID: TXN-123456',
          category: 'payment',
          priority: 'high',
          status: 'in-progress',
          createdDate: new Date('2024-01-20T10:30:00'),
          createdAt: new Date('2024-01-20T10:30:00'),
          lastUpdated: new Date('2024-01-20T14:15:00'),
          updatedAt: new Date('2024-01-20T14:15:00'),
          assignedAgent: 'Sarah Wilson',
          messages: [
            {
              id: 'MSG-001',
              senderId: 'CUST-001',
              senderName: 'John Doe',
              senderType: 'customer',
              message: 'My payment was deducted but booking was not confirmed. Transaction ID: TXN-123456',
              timestamp: new Date('2024-01-20T10:30:00'),
              isRead: true
            },
            {
              id: 'MSG-002',
              senderId: 'AGENT-001',
              senderName: 'Sarah Wilson',
              senderType: 'agent',
              message: 'Hello John, I understand your concern. Let me check the transaction status and get back to you shortly.',
              timestamp: new Date('2024-01-20T11:45:00'),
              isRead: true
            },
            {
              id: 'MSG-003',
              senderId: 'AGENT-001',
              senderName: 'Sarah Wilson',
              senderType: 'agent',
              message: 'I have reviewed your transaction. There was a temporary processing delay. Your booking has been confirmed now. Booking ID: BK-789.',
              timestamp: new Date('2024-01-20T14:15:00'),
              isRead: false
            }
          ]
        },
        {
          id: 'TKT-002',
          ticketNumber: 'SUP-2024-002',
          subject: 'Unable to track my shipment',
          description: 'The tracking link is not working for booking JRT-2024-015',
          category: 'technical',
          priority: 'medium',
          status: 'waiting-response',
          createdDate: new Date('2024-01-18T16:20:00'),
          createdAt: new Date('2024-01-18T16:20:00'),
          lastUpdated: new Date('2024-01-19T09:30:00'),
          updatedAt: new Date('2024-01-19T09:30:00'),
          assignedAgent: 'Mike Johnson',
          messages: [
            {
              id: 'MSG-004',
              senderId: 'CUST-001',
              senderName: 'John Doe',
              senderType: 'customer',
              message: 'The tracking link is not working for booking JRT-2024-015',
              timestamp: new Date('2024-01-18T16:20:00'),
              isRead: true
            },
            {
              id: 'MSG-005',
              senderId: 'AGENT-002',
              senderName: 'Mike Johnson',
              senderType: 'agent',
              message: 'Thank you for reporting this issue. Our technical team is working on fixing the tracking system. You should be able to track your shipment within 2 hours.',
              timestamp: new Date('2024-01-19T09:30:00'),
              isRead: true
            }
          ]
        },
        {
          id: 'TKT-003',
          ticketNumber: 'SUP-2024-003',
          subject: 'Refund request for cancelled booking',
          description: 'Requesting refund for booking JRT-2024-010 that was cancelled due to vehicle breakdown',
          category: 'complaint',
          priority: 'medium',
          status: 'resolved',
          createdDate: new Date('2024-01-15T12:00:00'),
          createdAt: new Date('2024-01-15T12:00:00'),
          lastUpdated: new Date('2024-01-17T10:45:00'),
          updatedAt: new Date('2024-01-17T10:45:00'),
          assignedAgent: 'Emily Davis',
          messages: [
            {
              id: 'MSG-006',
              senderId: 'CUST-001',
              senderName: 'John Doe',
              senderType: 'customer',
              message: 'Requesting refund for booking JRT-2024-010 that was cancelled due to vehicle breakdown',
              timestamp: new Date('2024-01-15T12:00:00'),
              isRead: true
            },
            {
              id: 'MSG-007',
              senderId: 'AGENT-003',
              senderName: 'Emily Davis',
              senderType: 'agent',
              message: 'I apologize for the inconvenience. Your refund has been processed and will be credited to your account within 3-5 business days.',
              timestamp: new Date('2024-01-17T10:45:00'),
              isRead: true
            }
          ]
        }
      ];
      this.filterTickets();
      this.isLoading = false;
    }, 1000);
  }

  // Load FAQ items
  loadFAQs(): void {
    // Mock data - replace with actual API call
    this.faqItems = [
      {
        id: 'FAQ-001',
        category: 'Booking',
        question: 'How do I book a transport service?',
        answer: 'To book a transport service, go to the "Book Transport" section, fill in your pickup and drop-off details, select your preferred vehicle type, and confirm your booking. You will receive a confirmation email with booking details.',
        tags: ['booking', 'transport', 'how-to']
      },
      {
        id: 'FAQ-002',
        category: 'Payment',
        question: 'What payment methods are accepted?',
        answer: 'We accept credit cards, debit cards, digital wallets, bank transfers, and cash payments. All online payments are processed securely through our encrypted payment gateway.',
        tags: ['payment', 'methods', 'security']
      },
      {
        id: 'FAQ-003',
        category: 'Tracking',
        question: 'How can I track my shipment?',
        answer: 'Once your booking is confirmed, you will receive a tracking link via email and SMS. You can also track your shipment from the "My Bookings" section in your dashboard.',
        tags: ['tracking', 'shipment', 'status']
      },
      {
        id: 'FAQ-004',
        category: 'Cancellation',
        question: 'What is the cancellation policy?',
        answer: 'You can cancel your booking up to 2 hours before the scheduled pickup time for a full refund. Cancellations made within 2 hours may incur a cancellation fee.',
        tags: ['cancellation', 'refund', 'policy']
      },
      {
        id: 'FAQ-005',
        category: 'Technical',
        question: 'I forgot my password. How do I reset it?',
        answer: 'Click on "Forgot Password" on the login page, enter your email address, and you will receive a password reset link. Follow the instructions in the email to create a new password.',
        tags: ['password', 'reset', 'account']
      }
    ];
    this.filteredFAQs = [...this.faqItems];
  }

  // Load contact information
  loadContactInfo(): void {
    // Mock data - replace with actual API call
    this.contactInfo = {
      phone: '+1-800-JR-TRANS',
      email: 'support@jrtransport.com',
      whatsapp: '+1-555-0123',
      telegram: '@jrtransport',
      supportHours: {
        weekdays: '9:00 AM - 6:00 PM',
        weekends: '10:00 AM - 4:00 PM',
        timezone: 'EST'
      },
      emergencyContact: '+1-800-EMERGENCY'
    };
  }

  // View management
  setActiveView(view: 'tickets' | 'new-ticket' | 'faq' | 'contact'): void {
    this.activeView = view;
  }

  // Ticket management
  createNewTicket(): void {
    if (this.newTicketForm.valid) {
      this.isSubmitting = true;
      const formValue = this.newTicketForm.value;
      
      const newTicket: SupportTicket = {
        id: 'TKT-' + Date.now(),
        ticketNumber: 'SUP-2024-' + String(this.supportTickets.length + 1).padStart(3, '0'),
        subject: formValue.subject,
        description: formValue.description,
        category: formValue.category,
        priority: formValue.priority,
        status: 'open',
        createdDate: new Date(),
        createdAt: new Date(),
        lastUpdated: new Date(),
        updatedAt: new Date(),
        messages: [
          {
            id: 'MSG-' + Date.now(),
            senderId: 'CUST-001',
            senderName: 'John Doe',
            senderType: 'customer',
            message: formValue.description,
            timestamp: new Date(),
            isRead: true
          }
        ]
      };
      
      // Mock API call
      setTimeout(() => {
        this.supportTickets.unshift(newTicket);
        this.filterTickets();
        this.newTicketForm.reset();
        this.newTicketForm.patchValue({ priority: 'medium' });
        this.isSubmitting = false;
        this.activeView = 'tickets';
        alert('Support ticket created successfully!');
      }, 1500);
    } else {
      this.markFormGroupTouched(this.newTicketForm);
    }
  }

  // View ticket details
  viewTicketDetails(ticket: SupportTicket): void {
    this.selectedTicket = ticket;
    this.showTicketModal = true;
    
    // Mark unread messages as read
    ticket.messages.forEach(message => {
      if (message.senderType !== 'customer' && !message.isRead) {
        message.isRead = true;
      }
    });
  }

  // Send message in ticket
  sendMessage(): void {
    if (this.messageForm.valid && this.selectedTicket) {
      this.isSendingMessage = true;
      const messageText = this.messageForm.value.message;
      
      const newMessage: SupportMessage = {
        id: 'MSG-' + Date.now(),
        senderId: 'CUST-001',
        senderName: 'John Doe',
        senderType: 'customer',
        message: messageText,
        timestamp: new Date(),
        isRead: true,
        attachments: this.selectedFiles.length > 0 ? this.convertFilesToAttachments() : undefined
      };
      
      // Mock API call
      setTimeout(() => {
        if (this.selectedTicket) {
          this.selectedTicket.messages.push(newMessage);
          this.selectedTicket.lastUpdated = new Date();
          this.selectedTicket.status = 'waiting-response';
        }
        this.messageForm.reset();
        this.selectedFiles = [];
        this.isSendingMessage = false;
        console.log('Message sent:', messageText);
      }, 1000);
    } else {
      this.markFormGroupTouched(this.messageForm);
    }
  }

  // File upload handling
  onFilesSelected(event: Event): void {
    const files = (event.target as HTMLInputElement).files;
    if (files) {
      const validFiles = Array.from(files).filter(file => {
        const maxSize = 10 * 1024 * 1024; // 10MB
        const allowedTypes = ['image/', 'application/pdf', 'text/', 'application/msword', 'application/vnd.openxmlformats'];
        
        if (file.size > maxSize) {
          alert(`File ${file.name} is too large. Maximum size is 10MB.`);
          return false;
        }
        
        if (!allowedTypes.some(type => file.type.startsWith(type))) {
          alert(`File ${file.name} type is not supported.`);
          return false;
        }
        
        return true;
      });
      
      this.selectedFiles = [...this.selectedFiles, ...validFiles];
    }
  }

  removeSelectedFile(index: number): void {
    this.selectedFiles.splice(index, 1);
  }

  private convertFilesToAttachments(): FileAttachment[] {
    return this.selectedFiles.map(file => ({
      id: 'ATT-' + Date.now() + '-' + Math.random(),
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
      uploadDate: new Date(),
      downloadUrl: '/uploads/' + file.name // Mock URL
    }));
  }

  // Filtering and search
  filterTickets(): void {
    let filtered = this.supportTickets.filter(ticket => {
      const matchesStatus = this.statusFilter === 'all' || ticket.status === this.statusFilter;
      const matchesCategory = this.categoryFilter === 'all' || ticket.category === this.categoryFilter;
      const matchesPriority = this.priorityFilter === 'all' || ticket.priority === this.priorityFilter;
      const matchesSearch = !this.searchQuery ||
        ticket.subject.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        ticket.ticketNumber.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        ticket.description.toLowerCase().includes(this.searchQuery.toLowerCase());

      return matchesStatus && matchesCategory && matchesPriority && matchesSearch;
    });

    // Sort by last updated (newest first)
    filtered.sort((a, b) => new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime());
    this.filteredTickets = filtered;
  }

  searchFAQs(): void {
    if (!this.faqSearchQuery) {
      this.filteredFAQs = [...this.faqItems];
    } else {
      const query = this.faqSearchQuery.toLowerCase();
      this.filteredFAQs = this.faqItems.filter(faq =>
        faq.question.toLowerCase().includes(query) ||
        faq.answer.toLowerCase().includes(query) ||
        faq.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }
  }

  // FAQ feedback
  markFAQHelpful(faq: FAQItem, helpful: boolean): void {
    faq.isHelpful = helpful;
    console.log('FAQ feedback:', faq.id, helpful);
    // Send feedback to API
  }

  // Modal controls
  closeTicketModal(): void {
    this.showTicketModal = false;
    this.selectedTicket = null;
    this.messageForm.reset();
    this.selectedFiles = [];
  }

  // Utility methods
  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();
    });
  }

  getFieldError(form: FormGroup, fieldName: string): string {
    const field = form.get(fieldName);
    if (field?.errors && field.touched) {
      if (field.errors['required']) return `${fieldName} is required`;
      if (field.errors['minlength']) return `Minimum length is ${field.errors['minlength'].requiredLength}`;
      if (field.errors['maxlength']) return `Maximum length is ${field.errors['maxlength'].requiredLength}`;
    }
    return '';
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'open': return 'badge bg-primary';
      case 'in-progress': return 'badge bg-warning';
      case 'waiting-response': return 'badge bg-info';
      case 'resolved': return 'badge bg-success';
      case 'closed': return 'badge bg-secondary';
      default: return 'badge bg-secondary';
    }
  }

  getPriorityClass(priority: string): string {
    switch (priority) {
      case 'low': return 'badge bg-light text-dark';
      case 'medium': return 'badge bg-warning';
      case 'high': return 'badge bg-danger';
      case 'urgent': return 'badge bg-dark';
      default: return 'badge bg-secondary';
    }
  }

  getCategoryIcon(category: string): string {
    switch (category) {
      case 'booking': return 'fas fa-calendar-alt';
      case 'payment': return 'fas fa-credit-card';
      case 'technical': return 'fas fa-cogs';
      case 'account': return 'fas fa-user-circle';
      case 'complaint': return 'fas fa-exclamation-triangle';
      case 'other': return 'fas fa-question-circle';
      default: return 'fas fa-ticket-alt';
    }
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  formatDate(date: Date): string {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(date));
  }

  getUnreadMessageCount(ticket: SupportTicket): number {
    return ticket.messages.filter(msg => msg.senderType !== 'customer' && !msg.isRead).length;
  }

  hasUnreadMessages(ticket: SupportTicket): boolean {
    return this.getUnreadMessageCount(ticket) > 0;
  }

  // Additional methods expected by HTML template
  setActiveTab(tab: string): void {
    this.activeTab = tab;
  }

  createSupportTicket(): void {
    this.setActiveTab('new-ticket');
  }

  getActiveTicketsCount(): number {
    return this.supportTickets.filter(ticket => 
      ticket.status === 'open' || ticket.status === 'in-progress'
    ).length;
  }

  openLiveChat(): void {
    // Implement live chat functionality
    console.log('Opening live chat...');
  }

  getTimeAgo(date: Date): string {
    return this.formatDate(date);
  }

  // Additional methods for FAQ functionality
  searchFAQ(): void {
    this.searchFAQs();
  }

  selectFaqCategory(categoryId: string): void {
    this.selectedFaqCategory = categoryId;
    this.searchFAQs();
  }

  toggleFaq(faqId: string): void {
    // Toggle FAQ expand/collapse
    console.log('Toggling FAQ:', faqId);
  }

  rateFaq(faqId: string, helpful: boolean): void {
    const faq = this.faqItems.find(f => f.id === faqId);
    if (faq) {
      faq.isHelpful = helpful;
    }
  }

  // Additional methods for quick contact
  sendQuickMessage(): void {
    this.sendMessage();
  }

  // File attachment methods
  onAttachmentSelected(event: any): void {
    const files = event.target.files;
    if (files) {
      this.selectedAttachments = Array.from(files);
    }
  }

  removeAttachment(index: number): void {
    this.selectedAttachments.splice(index, 1);
  }

  onTicketAttachmentSelected(event: any): void {
    const files = event.target.files;
    if (files) {
      this.ticketAttachments = Array.from(files);
    }
  }

  removeTicketAttachment(index: number): void {
    this.ticketAttachments.splice(index, 1);
  }

  onReplyAttachmentSelected(event: any): void {
    // Handle reply attachments
    console.log('Reply attachment selected:', event);
  }

  // User guides methods
  openGuide(guide: any): void {
    console.log('Opening guide:', guide);
  }

  getDifficultyClass(difficulty: string): string {
    return `difficulty-${difficulty}`;
  }

  // Support ticket methods
  submitSupportTicket(): void {
    this.createNewTicket();
  }

  refreshTicket(): void {
    // Refresh current ticket
    console.log('Refreshing ticket');
  }

  closeTicket(ticketId: string): void {
    console.log('Closing ticket:', ticketId);
  }

  sendReply(): void {
    this.sendMessage();
  }

  removeReplyAttachment(index: number): void {
    this.replyAttachments.splice(index, 1);
    console.log('Reply attachment removed');
  }


}