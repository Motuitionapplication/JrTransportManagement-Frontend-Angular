import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil, debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { MessageService, Message, MessageFilters, MessageResponse } from '../../../../services/message.service';

@Component({
  selector: 'app-message',
  templateUrl: './message.component.html',
  styleUrls: ['./message.component.scss']
})
export class MessageComponent implements OnInit, OnDestroy {
  messages: Message[] = [];
  filteredMessages: Message[] = [];
  selectedMessage: Message | null = null;
  isLoading: boolean = false;
  searchTerm: string = '';
  filterType: string = 'all';
  unreadCount: number = 0;
  
  // Pagination
  currentPage: number = 0;
  totalPages: number = 0;
  totalElements: number = 0;
  pageSize: number = 10;
  hasNext: boolean = false;
  hasPrevious: boolean = false;

  // Error handling
  errorMessage: string = '';
  showError: boolean = false;

  // Search debouncing
  private searchSubject = new Subject<string>();
  private destroy$ = new Subject<void>();

  constructor(
    private router: Router,
    private messageService: MessageService
  ) { }

  ngOnInit(): void {
    this.initializeComponent();
    this.setupSearchDebouncing();
    this.subscribeToMessages();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initializeComponent(): void {
    this.loadMessages();
  }

  private setupSearchDebouncing(): void {
    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    ).subscribe(searchTerm => {
      this.performSearch(searchTerm);
    });
  }

  private subscribeToMessages(): void {
    // Subscribe to messages observable
    this.messageService.messages$.pipe(
      takeUntil(this.destroy$)
    ).subscribe(messages => {
      this.messages = messages;
      this.applyLocalFilters();
    });

    // Subscribe to unread count
    this.messageService.unreadCount$.pipe(
      takeUntil(this.destroy$)
    ).subscribe(count => {
      this.unreadCount = count;
    });
  }

  loadMessages(page: number = 0): void {
    this.isLoading = true;
    this.clearError();

    const filters: MessageFilters = {
      page,
      size: this.pageSize,
      type: this.filterType !== 'all' ? this.filterType : undefined,
      search: this.searchTerm || undefined
    };

    this.messageService.loadMessages(filters).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (response: MessageResponse) => {
        this.handleLoadSuccess(response);
      },
      error: (error) => {
        this.handleLoadError(error);
      }
    });
  }

  private handleLoadSuccess(response: MessageResponse): void {
    this.filteredMessages = response.messages;
    this.currentPage = response.currentPage;
    this.totalPages = response.totalPages;
    this.totalElements = response.totalElements;
    this.hasNext = response.hasNext;
    this.hasPrevious = response.hasPrevious;
    this.isLoading = false;
  }

  private handleLoadError(error: any): void {
    console.error('Error loading messages:', error);
    this.errorMessage = 'Failed to load messages. Please try again.';
    this.showError = true;
    this.isLoading = false;
  }

  selectMessage(message: Message): void {
    this.selectedMessage = message;
    if (!message.isRead) {
      this.markAsRead(message.id);
    }
  }

  closeMessage(): void {
    this.selectedMessage = null;
  }

  deleteMessage(messageId: number): void {
    if (confirm('Are you sure you want to delete this message?')) {
      this.messageService.deleteMessage(messageId).pipe(
        takeUntil(this.destroy$)
      ).subscribe({
        next: () => {
          if (this.selectedMessage && this.selectedMessage.id === messageId) {
            this.selectedMessage = null;
          }
          this.showSuccessMessage('Message deleted successfully');
          this.loadMessages(this.currentPage);
        },
        error: (error) => {
          this.handleError('Failed to delete message', error);
        }
      });
    }
  }

  markAsRead(messageId: number): void {
    this.messageService.markAsRead(messageId).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: () => {
        // State is updated automatically by the service
      },
      error: (error) => {
        this.handleError('Failed to mark message as read', error);
      }
    });
  }

  markAsUnread(messageId: number): void {
    this.messageService.markAsUnread(messageId).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: () => {
        // State is updated automatically by the service
      },
      error: (error) => {
        this.handleError('Failed to mark message as unread', error);
      }
    });
  }

  onSearchChange(): void {
    this.searchSubject.next(this.searchTerm);
  }

  onFilterChange(): void {
    this.currentPage = 0;
    this.loadMessages(0);
  }

  private performSearch(searchTerm: string): void {
    this.currentPage = 0;
    this.loadMessages(0);
  }

  private applyLocalFilters(): void {
    // Local filtering is now handled by the backend
    // This method is kept for any client-side filtering if needed
    this.filteredMessages = [...this.messages];
  }

  markAllAsRead(): void {
    this.messageService.markAllAsRead().pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: () => {
        this.showSuccessMessage('All messages marked as read');
      },
      error: (error) => {
        this.handleError('Failed to mark all messages as read', error);
      }
    });
  }

  refreshMessages(): void {
    this.loadMessages(this.currentPage);
  }

  // Pagination methods
  goToPage(page: number): void {
    if (page >= 0 && page < this.totalPages) {
      this.currentPage = page;
      this.loadMessages(page);
    }
  }

  nextPage(): void {
    if (this.hasNext) {
      this.goToPage(this.currentPage + 1);
    }
  }

  previousPage(): void {
    if (this.hasPrevious) {
      this.goToPage(this.currentPage - 1);
    }
  }

  // Reply functionality
  replyToMessage(messageId: number, content: string): void {
    this.messageService.replyToMessage(messageId, content).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: () => {
        this.showSuccessMessage('Reply sent successfully');
        this.loadMessages(this.currentPage);
      },
      error: (error) => {
        this.handleError('Failed to send reply', error);
      }
    });
  }

  // Forward functionality
  forwardMessage(messageId: number, to: string): void {
    this.messageService.forwardMessage(messageId, to).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: () => {
        this.showSuccessMessage('Message forwarded successfully');
      },
      error: (error) => {
        this.handleError('Failed to forward message', error);
      }
    });
  }

  // Error handling
  private handleError(message: string, error: any): void {
    console.error(message, error);
    this.errorMessage = message;
    this.showError = true;
    setTimeout(() => this.clearError(), 5000);
  }

  private showSuccessMessage(message: string): void {
    // You can implement a toast notification service here
    console.log('Success:', message);
  }

  clearError(): void {
    this.errorMessage = '';
    this.showError = false;
  }

  // Download attachment
  downloadAttachment(attachmentId: number, filename: string): void {
    this.messageService.downloadAttachment(attachmentId).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (blob: Blob) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        link.click();
        window.URL.revokeObjectURL(url);
      },
      error: (error) => {
        this.handleError('Failed to download attachment', error);
      }
    });
  }

  getPriorityIcon(priority: string): string {
    switch (priority) {
      case 'high': return 'fas fa-exclamation-triangle text-danger';
      case 'medium': return 'fas fa-exclamation-circle text-warning';
      default: return 'fas fa-info-circle text-info';
    }
  }

  getTypeIcon(type: string): string {
    switch (type) {
      case 'success': return 'fas fa-check-circle text-success';
      case 'warning': return 'fas fa-exclamation-triangle text-warning';
      case 'error': return 'fas fa-times-circle text-danger';
      default: return 'fas fa-info-circle text-info';
    }
  }

  // Utility methods
  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString();
  }

  formatTime(date: Date): string {
    return new Date(date).toLocaleTimeString();
  }

  hasAttachments(message: Message): boolean {
    return !!(message.attachments && message.attachments.length > 0);
  }

  getPageNumbers(): number[] {
    const maxPages = 5;
    const pages: number[] = [];
    const start = Math.max(0, this.currentPage - Math.floor(maxPages / 2));
    const end = Math.min(this.totalPages, start + maxPages);
    
    for (let i = start; i < end; i++) {
      pages.push(i);
    }
    
    return pages;
  }
}