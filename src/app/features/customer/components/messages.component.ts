import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  senderType: 'admin' | 'customer' | 'support' | 'driver';
  recipientId: string;
  recipientName: string;
  recipientType: 'admin' | 'customer' | 'support' | 'driver';
  content: string;
  messageType: 'text' | 'image' | 'file' | 'location' | 'system';
  timestamp: Date;
  read: boolean;
  delivered: boolean;
  attachments?: MessageAttachment[];
  replyTo?: string; // Message ID this is replying to
  edited?: boolean;
  editedAt?: Date;
  priority: 'low' | 'normal' | 'high' | 'urgent';
}

interface MessageAttachment {
  id: string;
  name: string;
  type: 'image' | 'document' | 'audio' | 'video';
  url: string;
  size: number;
  mimeType: string;
}

interface Conversation {
  id: string;
  participantIds: string[];
  participantNames: string[];
  participantTypes: ('admin' | 'customer' | 'support' | 'driver')[];
  title: string;
  lastMessage: Message;
  unreadCount: number;
  isGroup: boolean;
  createdAt: Date;
  updatedAt: Date;
  archived: boolean;
  muted: boolean;
  pinned: boolean;
  conversationType: 'support' | 'booking' | 'general' | 'emergency';
  bookingId?: string;
  tripId?: string;
}

interface MessageFilter {
  searchQuery: string;
  conversationType: string;
  dateRange: string;
  unreadOnly: boolean;
  priority: string;
}

@Component({
  selector: 'app-customer-messages',
  templateUrl: './messages.component.html',
  styleUrls: ['./messages.component.scss']
})
export class MessagesComponent implements OnInit, OnDestroy {
  @ViewChild('messageInput') messageInput!: ElementRef<HTMLTextAreaElement>;
  @ViewChild('messagesContainer') messagesContainer!: ElementRef<HTMLDivElement>;
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  // Component state
  isLoading: boolean = false;
  isLoadingConversations: boolean = false;
  isLoadingMessages: boolean = false;
  isSending: boolean = false;

  // Data
  conversations: Conversation[] = [];
  filteredConversations: Conversation[] = [];
  messages: Message[] = [];
  selectedConversation: Conversation | null = null;

  // UI state
  selectedConversationId: string | null = null;
  newMessage: string = '';
  replyingTo: Message | null = null;
  editingMessage: Message | null = null;
  showEmojiPicker: boolean = false;
  showAttachments: boolean = false;
  
  // Filters and search
  filter: MessageFilter = {
    searchQuery: '',
    conversationType: 'all',
    dateRange: 'all',
    unreadOnly: false,
    priority: 'all'
  };

  // Sidebar state
  sidebarCollapsed: boolean = false;
  showConversationDetails: boolean = false;

  // Auto-refresh
  autoRefresh: boolean = true;
  refreshInterval: number = 30;
  private refreshTimer: any;
  private destroy$ = new Subject<void>();

  // Typing indicator
  typingUsers: { [conversationId: string]: string[] } = {};
  private typingTimer: any;

  constructor() {}

  ngOnInit(): void {
    this.loadConversations();
    this.setupAutoRefresh();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    if (this.refreshTimer) {
      clearInterval(this.refreshTimer);
    }
    if (this.typingTimer) {
      clearTimeout(this.typingTimer);
    }
  }

  /**
   * TrackBy function for conversations list performance
   */
  trackByConversationId(index: number, conversation: Conversation): string {
    return conversation.id;
  }

  /**
   * TrackBy function for messages list performance
   */
  trackByMessageId(index: number, message: Message): string {
    return message.id;
  }

  /**
   * Load all conversations
   */
  loadConversations(): void {
    this.isLoadingConversations = true;
    
    // Simulate API call - replace with actual service
    setTimeout(() => {
      this.conversations = this.getMockConversations();
      this.filteredConversations = [...this.conversations];
      this.applyFilters();
      this.isLoadingConversations = false;
    }, 800);
  }

  /**
   * Load messages for selected conversation
   */
  loadMessages(conversationId: string): void {
    if (!conversationId) return;
    
    this.isLoadingMessages = true;
    this.selectedConversationId = conversationId;
    
    // Find and select conversation
    this.selectedConversation = this.conversations.find(c => c.id === conversationId) || null;
    
    // Simulate API call - replace with actual service
    setTimeout(() => {
      this.messages = this.getMockMessages(conversationId);
      this.markConversationAsRead(conversationId);
      this.isLoadingMessages = false;
      
      // Scroll to bottom
      setTimeout(() => this.scrollToBottom(), 100);
    }, 500);
  }

  /**
   * Send a new message
   */
  sendMessage(): void {
    if (!this.newMessage.trim() || !this.selectedConversation || this.isSending) {
      return;
    }

    this.isSending = true;
    const messageContent = this.newMessage.trim();
    
    const newMessage: Message = {
      id: 'msg-' + Date.now(),
      conversationId: this.selectedConversation.id,
      senderId: 'current-customer',
      senderName: 'You',
      senderType: 'customer',
      recipientId: this.selectedConversation.participantIds[0],
      recipientName: this.selectedConversation.participantNames[0],
      recipientType: this.selectedConversation.participantTypes[0],
      content: messageContent,
      messageType: 'text',
      timestamp: new Date(),
      read: false,
      delivered: false,
      replyTo: this.replyingTo?.id,
      priority: 'normal'
    };

    // Add message to current conversation
    this.messages.push(newMessage);
    
    // Update conversation last message
    this.selectedConversation.lastMessage = newMessage;
    this.selectedConversation.updatedAt = new Date();
    
    // Clear input and reset states
    this.newMessage = '';
    this.replyingTo = null;
    this.isSending = false;
    
    // Scroll to bottom
    setTimeout(() => this.scrollToBottom(), 100);
    
    // Simulate server response
    setTimeout(() => {
      newMessage.delivered = true;
      
      // Simulate read receipt after some time
      setTimeout(() => {
        newMessage.read = true;
      }, 2000);
    }, 1000);
  }

  /**
   * Start new conversation
   */
  startNewConversation(): void {
    // This would typically open a modal to select recipients
    console.log('Starting new conversation...');
  }

  /**
   * Reply to a specific message
   */
  replyToMessage(message: Message): void {
    this.replyingTo = message;
    this.focusInput();
  }

  /**
   * Edit a message
   */
  editMessage(message: Message): void {
    if (message.senderType === 'customer' && message.senderId === 'current-customer') {
      this.editingMessage = message;
      this.newMessage = message.content;
      this.focusInput();
    }
  }

  /**
   * Delete a message
   */
  deleteMessage(message: Message): void {
    if (message.senderType === 'customer' && message.senderId === 'current-customer') {
      if (confirm('Are you sure you want to delete this message?')) {
        const index = this.messages.findIndex(m => m.id === message.id);
        if (index > -1) {
          this.messages.splice(index, 1);
        }
      }
    }
  }

  /**
   * Mark conversation as read
   */
  markConversationAsRead(conversationId: string): void {
    const conversation = this.conversations.find(c => c.id === conversationId);
    if (conversation) {
      conversation.unreadCount = 0;
    }
  }

  /**
   * Archive/Unarchive conversation
   */
  toggleArchiveConversation(conversation: Conversation): void {
    conversation.archived = !conversation.archived;
    console.log(`Conversation ${conversation.archived ? 'archived' : 'unarchived'}`);
  }

  /**
   * Mute/Unmute conversation
   */
  toggleMuteConversation(conversation: Conversation): void {
    conversation.muted = !conversation.muted;
    console.log(`Conversation ${conversation.muted ? 'muted' : 'unmuted'}`);
  }

  /**
   * Pin/Unpin conversation
   */
  togglePinConversation(conversation: Conversation): void {
    conversation.pinned = !conversation.pinned;
    this.sortConversations();
  }

  /**
   * Apply filters to conversations
   */
  applyFilters(): void {
    let filtered = [...this.conversations];

    // Search filter
    if (this.filter.searchQuery) {
      const query = this.filter.searchQuery.toLowerCase();
      filtered = filtered.filter(conv => 
        conv.title.toLowerCase().includes(query) ||
        conv.lastMessage.content.toLowerCase().includes(query) ||
        conv.participantNames.some(name => name.toLowerCase().includes(query))
      );
    }

    // Conversation type filter
    if (this.filter.conversationType !== 'all') {
      filtered = filtered.filter(conv => conv.conversationType === this.filter.conversationType);
    }

    // Unread only filter
    if (this.filter.unreadOnly) {
      filtered = filtered.filter(conv => conv.unreadCount > 0);
    }

    // Date range filter
    if (this.filter.dateRange !== 'all') {
      filtered = filtered.filter(conv => this.isInDateRange(conv.updatedAt, this.filter.dateRange));
    }

    this.filteredConversations = filtered;
    this.sortConversations();
  }

  /**
   * Clear all filters
   */
  clearFilters(): void {
    this.filter = {
      searchQuery: '',
      conversationType: 'all',
      dateRange: 'all',
      unreadOnly: false,
      priority: 'all'
    };
    this.applyFilters();
  }

  /**
   * Sort conversations
   */
  private sortConversations(): void {
    this.filteredConversations.sort((a, b) => {
      // Pinned conversations first
      if (a.pinned !== b.pinned) {
        return a.pinned ? -1 : 1;
      }
      
      // Then by last message timestamp
      return b.updatedAt.getTime() - a.updatedAt.getTime();
    });
  }

  /**
   * Check if date is in specified range
   */
  private isInDateRange(date: Date, range: string): boolean {
    const now = new Date();
    const messageDate = new Date(date);
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    switch (range) {
      case 'today':
        return messageDate >= today;
      case 'yesterday':
        const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
        return messageDate >= yesterday && messageDate < today;
      case 'this-week':
        const weekStart = new Date(today.getTime() - today.getDay() * 24 * 60 * 60 * 1000);
        return messageDate >= weekStart;
      case 'this-month':
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        return messageDate >= monthStart;
      default:
        return true;
    }
  }

  /**
   * Handle file attachment
   */
  onFileSelect(): void {
    this.fileInput.nativeElement.click();
  }

  onFileChange(event: any): void {
    const files = event.target.files;
    if (files && files.length > 0) {
      // Handle file upload
      console.log('Files selected:', files);
    }
  }

  /**
   * Toggle emoji picker
   */
  toggleEmojiPicker(): void {
    this.showEmojiPicker = !this.showEmojiPicker;
  }

  /**
   * Add emoji to message
   */
  addEmoji(emoji: string): void {
    this.newMessage += emoji;
    this.showEmojiPicker = false;
    this.focusInput();
  }

  /**
   * Focus message input
   */
  focusInput(): void {
    setTimeout(() => {
      if (this.messageInput) {
        this.messageInput.nativeElement.focus();
      }
    }, 100);
  }

  /**
   * Scroll messages to bottom
   */
  scrollToBottom(): void {
    if (this.messagesContainer) {
      const element = this.messagesContainer.nativeElement;
      element.scrollTop = element.scrollHeight;
    }
  }

  /**
   * Handle input keypress
   */
  onKeyPress(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      if (this.editingMessage) {
        this.saveEditedMessage();
      } else {
        this.sendMessage();
      }
    }
  }

  /**
   * Save edited message
   */
  saveEditedMessage(): void {
    if (this.editingMessage && this.newMessage.trim()) {
      this.editingMessage.content = this.newMessage.trim();
      this.editingMessage.edited = true;
      this.editingMessage.editedAt = new Date();
      
      this.editingMessage = null;
      this.newMessage = '';
    }
  }

  /**
   * Cancel editing
   */
  cancelEdit(): void {
    this.editingMessage = null;
    this.newMessage = '';
  }

  /**
   * Cancel reply
   */
  cancelReply(): void {
    this.replyingTo = null;
  }

  /**
   * Setup auto refresh
   */
  private setupAutoRefresh(): void {
    if (this.autoRefresh) {
      this.refreshTimer = setInterval(() => {
        if (this.selectedConversationId) {
          // Refresh current conversation messages silently
          this.refreshCurrentConversation();
        }
        // Refresh conversation list
        this.loadConversations();
      }, this.refreshInterval * 1000);
    }
  }

  /**
   * Refresh current conversation
   */
  private refreshCurrentConversation(): void {
    if (this.selectedConversationId) {
      // Simulate getting new messages
      const newMessages = this.getMockMessages(this.selectedConversationId);
      if (newMessages.length > this.messages.length) {
        this.messages = newMessages;
        setTimeout(() => this.scrollToBottom(), 100);
      }
    }
  }

  /**
   * Toggle sidebar
   */
  toggleSidebar(): void {
    this.sidebarCollapsed = !this.sidebarCollapsed;
  }

  /**
   * Toggle conversation details
   */
  toggleConversationDetails(): void {
    this.showConversationDetails = !this.showConversationDetails;
  }

  /**
   * Format message timestamp
   */
  formatMessageTime(timestamp: Date): string {
    const now = new Date();
    const messageDate = new Date(timestamp);
    const diffTime = Math.abs(now.getTime() - messageDate.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return messageDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffDays === 1) {
      return 'Yesterday ' + messageDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else {
      return messageDate.toLocaleDateString();
    }
  }

  /**
   * Format conversation last message time
   */
  formatLastMessageTime(timestamp: Date): string {
    const now = new Date();
    const messageDate = new Date(timestamp);
    const diffTime = Math.abs(now.getTime() - messageDate.getTime());
    const diffMinutes = Math.floor(diffTime / (1000 * 60));
    const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffMinutes < 60) {
      return diffMinutes < 1 ? 'Just now' : `${diffMinutes}m`;
    } else if (diffHours < 24) {
      return `${diffHours}h`;
    } else if (diffDays < 7) {
      return `${diffDays}d`;
    } else {
      return messageDate.toLocaleDateString();
    }
  }

  /**
   * Get conversation status class
   */
  getConversationStatusClass(conversation: Conversation): string {
    const classes = ['conversation-item'];
    
    if (conversation.id === this.selectedConversationId) {
      classes.push('active');
    }
    
    if (conversation.unreadCount > 0) {
      classes.push('unread');
    }
    
    if (conversation.pinned) {
      classes.push('pinned');
    }
    
    if (conversation.muted) {
      classes.push('muted');
    }
    
    return classes.join(' ');
  }

  /**
   * Get message status icon
   */
  getMessageStatusIcon(message: Message): string {
    if (message.senderType === 'customer' && message.senderId === 'current-customer') {
      if (message.read) {
        return 'fas fa-check-double text-primary';
      } else if (message.delivered) {
        return 'fas fa-check-double text-muted';
      } else {
        return 'fas fa-check text-muted';
      }
    }
    return '';
  }

  /**
   * Get priority badge class
   */
  getPriorityBadgeClass(priority: string): string {
    switch (priority) {
      case 'urgent': return 'badge bg-danger';
      case 'high': return 'badge bg-warning';
      case 'normal': return '';
      case 'low': return 'badge bg-secondary';
      default: return '';
    }
  }

  /**
   * Get conversation type icon
   */
  getConversationTypeIcon(type: string): string {
    switch (type) {
      case 'support': return 'fas fa-headset';
      case 'booking': return 'fas fa-calendar-alt';
      case 'emergency': return 'fas fa-exclamation-triangle';
      case 'general': return 'fas fa-comments';
      default: return 'fas fa-comment';
    }
  }

  /**
   * Mock data - replace with actual API calls
   */
  private getMockConversations(): Conversation[] {
    return [
      {
        id: 'conv-1',
        participantIds: ['support-1'],
        participantNames: ['Support Team'],
        participantTypes: ['support'],
        title: 'Support - Booking Issue #12345',
        lastMessage: {
          id: 'msg-1',
          conversationId: 'conv-1',
          senderId: 'support-1',
          senderName: 'Support Team',
          senderType: 'support',
          recipientId: 'current-customer',
          recipientName: 'You',
          recipientType: 'customer',
          content: 'We have resolved the issue with your booking. You should receive a confirmation email shortly.',
          messageType: 'text',
          timestamp: new Date(Date.now() - 5 * 60 * 1000), // 5 minutes ago
          read: false,
          delivered: true,
          priority: 'normal'
        },
        unreadCount: 2,
        isGroup: false,
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 5 * 60 * 1000),
        archived: false,
        muted: false,
        pinned: true,
        conversationType: 'support',
        bookingId: 'BK-2024-001'
      },
      {
        id: 'conv-2',
        participantIds: ['driver-1'],
        participantNames: ['Rajesh Kumar'],
        participantTypes: ['driver'],
        title: 'Driver - Trip #TR-2024-001',
        lastMessage: {
          id: 'msg-2',
          conversationId: 'conv-2',
          senderId: 'current-customer',
          senderName: 'You',
          senderType: 'customer',
          recipientId: 'driver-1',
          recipientName: 'Rajesh Kumar',
          recipientType: 'driver',
          content: 'Thank you for the safe delivery. Great service!',
          messageType: 'text',
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
          read: true,
          delivered: true,
          priority: 'normal'
        },
        unreadCount: 0,
        isGroup: false,
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
        archived: false,
        muted: false,
        pinned: false,
        conversationType: 'booking',
        tripId: 'TR-2024-001'
      },
      {
        id: 'conv-3',
        participantIds: ['admin-1'],
        participantNames: ['Admin Team'],
        participantTypes: ['admin'],
        title: 'Account Verification',
        lastMessage: {
          id: 'msg-3',
          conversationId: 'conv-3',
          senderId: 'admin-1',
          senderName: 'Admin Team',
          senderType: 'admin',
          recipientId: 'current-customer',
          recipientName: 'You',
          recipientType: 'customer',
          content: 'Your account has been successfully verified. Welcome to JR Transport!',
          messageType: 'text',
          timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
          read: true,
          delivered: true,
          priority: 'normal'
        },
        unreadCount: 0,
        isGroup: false,
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        archived: false,
        muted: false,
        pinned: false,
        conversationType: 'general'
      }
    ];
  }

  private getMockMessages(conversationId: string): Message[] {
    const messages: { [key: string]: Message[] } = {
      'conv-1': [
        {
          id: 'msg-1-1',
          conversationId: 'conv-1',
          senderId: 'current-customer',
          senderName: 'You',
          senderType: 'customer',
          recipientId: 'support-1',
          recipientName: 'Support Team',
          recipientType: 'support',
          content: 'Hi, I am having trouble with my booking #BK-2024-001. It shows as confirmed but I received no confirmation email.',
          messageType: 'text',
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
          read: true,
          delivered: true,
          priority: 'normal'
        },
        {
          id: 'msg-1-2',
          conversationId: 'conv-1',
          senderId: 'support-1',
          senderName: 'Support Team',
          senderType: 'support',
          recipientId: 'current-customer',
          recipientName: 'You',
          recipientType: 'customer',
          content: 'Hello! Thank you for reaching out. I can see your booking in our system. Let me check why the confirmation email was not sent.',
          messageType: 'text',
          timestamp: new Date(Date.now() - 90 * 60 * 1000),
          read: true,
          delivered: true,
          priority: 'normal'
        },
        {
          id: 'msg-1-3',
          conversationId: 'conv-1',
          senderId: 'support-1',
          senderName: 'Support Team',
          senderType: 'support',
          recipientId: 'current-customer',
          recipientName: 'You',
          recipientType: 'customer',
          content: 'I found the issue - there was a temporary problem with our email service. I have manually triggered the confirmation email and you should receive it within the next few minutes.',
          messageType: 'text',
          timestamp: new Date(Date.now() - 10 * 60 * 1000),
          read: false,
          delivered: true,
          priority: 'normal'
        },
        {
          id: 'msg-1-4',
          conversationId: 'conv-1',
          senderId: 'support-1',
          senderName: 'Support Team',
          senderType: 'support',
          recipientId: 'current-customer',
          recipientName: 'You',
          recipientType: 'customer',
          content: 'We have resolved the issue with your booking. You should receive a confirmation email shortly.',
          messageType: 'text',
          timestamp: new Date(Date.now() - 5 * 60 * 1000),
          read: false,
          delivered: true,
          priority: 'normal'
        }
      ]
    };

    return messages[conversationId] || [];
  }
}