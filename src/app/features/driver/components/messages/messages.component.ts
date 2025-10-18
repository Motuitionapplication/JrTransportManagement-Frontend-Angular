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
}

interface MessageFilter {
  conversationType: string;
  senderType: string;
  messageType: string;
  priority: string;
  dateRange: string;
  searchQuery: string;
}

@Component({
  selector: 'app-messages',
  templateUrl: './messages.component.html',
  styleUrls: ['./messages.component.scss']
})
export class MessagesComponent implements OnInit, OnDestroy {
  @ViewChild('messageInput', { static: false }) messageInput!: ElementRef;
  @ViewChild('messagesContainer', { static: false }) messagesContainer!: ElementRef;
  @ViewChild('fileInput', { static: false }) fileInput!: ElementRef;

  private destroy$ = new Subject<void>();
  
  // Component State
  loading = true;
  error: string | null = null;
  
  // Messages Data
  conversations: Conversation[] = [];
  messages: Message[] = [];
  filteredConversations: Conversation[] = [];
  selectedConversation: Conversation | null = null;
  currentUserId = 'driver123'; // This should come from auth service
  
  // UI State
  sidebarCollapsed = false;
  showMessageDetails = false;
  showAttachmentPreview = false;
  selectedAttachment: MessageAttachment | null = null;
  
  // Message Composition
  newMessageContent = '';
  isTyping = false;
  replyingTo: Message | null = null;
  selectedFiles: File[] = [];
  
  // Filters
  activeFilters: MessageFilter = {
    conversationType: '',
    senderType: '',
    messageType: '',
    priority: '',
    dateRange: '',
    searchQuery: ''
  };
  
  // Message Statistics
  messageStats = {
    totalConversations: 0,
    unreadMessages: 0,
    activeSupport: 0,
    pendingEmergency: 0
  };

  conversationTypes = [
    { value: '', label: 'All Types' },
    { value: 'support', label: 'Support' },
    { value: 'booking', label: 'Booking Related' },
    { value: 'general', label: 'General' },
    { value: 'emergency', label: 'Emergency' }
  ];

  messageTypes = [
    { value: '', label: 'All Messages' },
    { value: 'text', label: 'Text Messages' },
    { value: 'image', label: 'Images' },
    { value: 'file', label: 'Files' },
    { value: 'location', label: 'Location' },
    { value: 'system', label: 'System Messages' }
  ];

  priorityLevels = [
    { value: '', label: 'All Priority' },
    { value: 'low', label: 'Low Priority' },
    { value: 'normal', label: 'Normal' },
    { value: 'high', label: 'High Priority' },
    { value: 'urgent', label: 'Urgent' }
  ];

  ngOnInit(): void {
    this.loadConversations();
    this.calculateStats();
    // Set up real-time message updates (WebSocket connection would go here)
    this.setupMessageUpdates();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadConversations(): void {
    this.loading = true;
    
    // Simulate API call
    setTimeout(() => {
      this.conversations = this.generateMockConversations();
      this.filteredConversations = [...this.conversations];
      this.calculateStats();
      this.loading = false;
    }, 1500);
  }

  private generateMockConversations(): Conversation[] {
    return [
      {
        id: 'conv1',
        participantIds: ['admin1', 'driver123'],
        participantNames: ['Support Team', 'You'],
        participantTypes: ['admin', 'driver'],
        title: 'Account Verification',
        lastMessage: {
          id: 'msg1',
          conversationId: 'conv1',
          senderId: 'admin1',
          senderName: 'Support Team',
          senderType: 'admin',
          recipientId: 'driver123',
          recipientName: 'You',
          recipientType: 'driver',
          content: 'Your documents have been approved. You can now start accepting rides.',
          messageType: 'text',
          timestamp: new Date(Date.now() - 30 * 60 * 1000),
          read: false,
          delivered: true,
          priority: 'high'
        },
        unreadCount: 2,
        isGroup: false,
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 30 * 60 * 1000),
        archived: false,
        muted: false,
        pinned: true,
        conversationType: 'support'
      },
      {
        id: 'conv2',
        participantIds: ['customer1', 'driver123'],
        participantNames: ['John Smith', 'You'],
        participantTypes: ['customer', 'driver'],
        title: 'Booking #BK001',
        lastMessage: {
          id: 'msg2',
          conversationId: 'conv2',
          senderId: 'customer1',
          senderName: 'John Smith',
          senderType: 'customer',
          recipientId: 'driver123',
          recipientName: 'You',
          recipientType: 'driver',
          content: 'Thank you for the safe ride! Rating: 5 stars',
          messageType: 'text',
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
          read: true,
          delivered: true,
          priority: 'normal'
        },
        unreadCount: 0,
        isGroup: false,
        createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
        archived: false,
        muted: false,
        pinned: false,
        conversationType: 'booking'
      },
      {
        id: 'conv3',
        participantIds: ['support1', 'driver123'],
        participantNames: ['Emergency Support', 'You'],
        participantTypes: ['support', 'driver'],
        title: 'Emergency Alert',
        lastMessage: {
          id: 'msg3',
          conversationId: 'conv3',
          senderId: 'support1',
          senderName: 'Emergency Support',
          senderType: 'support',
          recipientId: 'driver123',
          recipientName: 'You',
          recipientType: 'driver',
          content: 'Are you safe? Please respond to confirm your status.',
          messageType: 'text',
          timestamp: new Date(Date.now() - 15 * 60 * 1000),
          read: false,
          delivered: true,
          priority: 'urgent'
        },
        unreadCount: 1,
        isGroup: false,
        createdAt: new Date(Date.now() - 15 * 60 * 1000),
        updatedAt: new Date(Date.now() - 15 * 60 * 1000),
        archived: false,
        muted: false,
        pinned: true,
        conversationType: 'emergency'
      }
    ];
  }

  private calculateStats(): void {
    this.messageStats = {
      totalConversations: this.conversations.length,
      unreadMessages: this.conversations.reduce((sum, conv) => sum + conv.unreadCount, 0),
      activeSupport: this.conversations.filter(conv => 
        conv.conversationType === 'support' && conv.unreadCount > 0
      ).length,
      pendingEmergency: this.conversations.filter(conv => 
        conv.conversationType === 'emergency' && conv.unreadCount > 0
      ).length
    };
  }

  private setupMessageUpdates(): void {
    // Set up real-time message updates
    // This would typically connect to WebSocket or polling service
    console.log('Setting up real-time message updates...');
  }

  // Conversation Management
  selectConversation(conversation: Conversation): void {
    this.selectedConversation = conversation;
    this.loadMessagesForConversation(conversation.id);
    this.markConversationAsRead(conversation.id);
    
    // Collapse sidebar on mobile
    if (window.innerWidth <= 768) {
      this.sidebarCollapsed = true;
    }
  }

  private loadMessagesForConversation(conversationId: string): void {
    // Simulate loading messages
    setTimeout(() => {
      this.messages = this.generateMockMessages(conversationId);
      this.scrollToBottom();
    }, 500);
  }

  private generateMockMessages(conversationId: string): Message[] {
    // Return mock messages based on conversation
    const baseMessages = [
      {
        id: 'msg1',
        conversationId,
        senderId: 'admin1',
        senderName: 'Support Team',
        senderType: 'admin' as const,
        recipientId: 'driver123',
        recipientName: 'You',
        recipientType: 'driver' as const,
        content: 'Hello! We need to verify some documents.',
        messageType: 'text' as const,
        timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000),
        read: true,
        delivered: true,
        priority: 'normal' as const
      },
      {
        id: 'msg2',
        conversationId,
        senderId: 'driver123',
        senderName: 'You',
        senderType: 'driver' as const,
        recipientId: 'admin1',
        recipientName: 'Support Team',
        recipientType: 'admin' as const,
        content: 'Sure, what documents do you need?',
        messageType: 'text' as const,
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
        read: true,
        delivered: true,
        priority: 'normal' as const
      }
    ];

    return baseMessages;
  }

  private markConversationAsRead(conversationId: string): void {
    const conversation = this.conversations.find(conv => conv.id === conversationId);
    if (conversation && conversation.unreadCount > 0) {
      conversation.unreadCount = 0;
      this.calculateStats();
    }
  }

  // Message Sending
  sendMessage(): void {
    if (!this.newMessageContent.trim() && this.selectedFiles.length === 0) {
      return;
    }

    if (!this.selectedConversation) {
      return;
    }

    const newMessage: Message = {
      id: 'msg' + Date.now(),
      conversationId: this.selectedConversation.id,
      senderId: this.currentUserId,
      senderName: 'You',
      senderType: 'driver',
      recipientId: this.selectedConversation.participantIds.find(id => id !== this.currentUserId) || '',
      recipientName: this.selectedConversation.participantNames.find((name, index) => 
        this.selectedConversation!.participantIds[index] !== this.currentUserId
      ) || '',
      recipientType: this.selectedConversation.participantTypes.find((type, index) => 
        this.selectedConversation!.participantIds[index] !== this.currentUserId
      ) || 'admin',
      content: this.newMessageContent,
      messageType: this.selectedFiles.length > 0 ? 'file' : 'text',
      timestamp: new Date(),
      read: false,
      delivered: false,
      priority: 'normal',
      attachments: this.selectedFiles.length > 0 ? this.createAttachmentsFromFiles() : undefined,
      replyTo: this.replyingTo?.id
    };

    this.messages.push(newMessage);
    this.updateConversationLastMessage(newMessage);
    
    // Clear input
    this.newMessageContent = '';
    this.selectedFiles = [];
    this.replyingTo = null;
    
    this.scrollToBottom();
  }

  private createAttachmentsFromFiles(): MessageAttachment[] {
    return this.selectedFiles.map((file, index) => ({
      id: 'att' + Date.now() + index,
      name: file.name,
      type: this.getFileType(file.type),
      url: URL.createObjectURL(file),
      size: file.size,
      mimeType: file.type
    }));
  }

  private getFileType(mimeType: string): 'image' | 'document' | 'audio' | 'video' {
    if (mimeType.startsWith('image/')) return 'image';
    if (mimeType.startsWith('audio/')) return 'audio';
    if (mimeType.startsWith('video/')) return 'video';
    return 'document';
  }

  private updateConversationLastMessage(message: Message): void {
    if (this.selectedConversation) {
      this.selectedConversation.lastMessage = message;
      this.selectedConversation.updatedAt = new Date();
    }
  }

  // Message Actions
  replyToMessage(message: Message): void {
    this.replyingTo = message;
    this.messageInput?.nativeElement.focus();
  }

  cancelReply(): void {
    this.replyingTo = null;
  }

  deleteMessage(messageId: string): void {
    if (confirm('Are you sure you want to delete this message?')) {
      this.messages = this.messages.filter(msg => msg.id !== messageId);
    }
  }

  markAsImportant(message: Message): void {
    message.priority = message.priority === 'high' ? 'normal' : 'high';
  }

  // File Handling
  onFileSelected(event: any): void {
    const files = Array.from(event.target.files) as File[];
    this.selectedFiles = [...this.selectedFiles, ...files];
  }

  removeSelectedFile(index: number): void {
    this.selectedFiles.splice(index, 1);
  }

  openFileSelector(): void {
    this.fileInput.nativeElement.click();
  }

  // Attachment Handling
  viewAttachment(attachment: MessageAttachment): void {
    this.selectedAttachment = attachment;
    this.showAttachmentPreview = true;
  }

  downloadAttachment(attachment: MessageAttachment): void {
    const link = document.createElement('a');
    link.href = attachment.url;
    link.download = attachment.name;
    link.click();
  }

  closeAttachmentPreview(): void {
    this.showAttachmentPreview = false;
    this.selectedAttachment = null;
  }

  // Conversation Actions
  archiveConversation(conversationId: string): void {
    const conversation = this.conversations.find(conv => conv.id === conversationId);
    if (conversation) {
      conversation.archived = !conversation.archived;
      this.applyFilters();
    }
  }

  muteConversation(conversationId: string): void {
    const conversation = this.conversations.find(conv => conv.id === conversationId);
    if (conversation) {
      conversation.muted = !conversation.muted;
    }
  }

  pinConversation(conversationId: string): void {
    const conversation = this.conversations.find(conv => conv.id === conversationId);
    if (conversation) {
      conversation.pinned = !conversation.pinned;
    }
  }

  startNewConversation(): void {
    // Implementation for starting new conversation
    console.log('Starting new conversation...');
  }

  // Filtering
  applyFilters(): void {
    this.filteredConversations = this.conversations.filter(conversation => {
      // Apply various filters
      if (this.activeFilters.conversationType && conversation.conversationType !== this.activeFilters.conversationType) {
        return false;
      }
      
      if (this.activeFilters.searchQuery) {
        const query = this.activeFilters.searchQuery.toLowerCase();
        if (!conversation.title.toLowerCase().includes(query) &&
            !conversation.lastMessage.content.toLowerCase().includes(query)) {
          return false;
        }
      }
      
      return !conversation.archived;
    });
  }

  clearFilters(): void {
    this.activeFilters = {
      conversationType: '',
      senderType: '',
      messageType: '',
      priority: '',
      dateRange: '',
      searchQuery: ''
    };
    this.applyFilters();
  }

  // UI Helpers
  toggleSidebar(): void {
    this.sidebarCollapsed = !this.sidebarCollapsed;
  }

  toggleMessageDetails(): void {
    this.showMessageDetails = !this.showMessageDetails;
  }

  private scrollToBottom(): void {
    setTimeout(() => {
      if (this.messagesContainer) {
        this.messagesContainer.nativeElement.scrollTop = 
          this.messagesContainer.nativeElement.scrollHeight;
      }
    }, 100);
  }

  // Utility Methods
  formatMessageTime(timestamp: Date): string {
    const now = new Date();
    const messageDate = new Date(timestamp);
    const diffInHours = Math.abs(now.getTime() - messageDate.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 1) {
      const minutes = Math.floor(diffInHours * 60);
      return `${minutes}m ago`;
    } else if (diffInHours < 24) {
      return messageDate.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit', 
        hour12: true 
      });
    } else {
      return messageDate.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric' 
      });
    }
  }

  getConversationIcon(type: string): string {
    switch (type) {
      case 'support': return '🛠️';
      case 'booking': return '🚗';
      case 'emergency': return '🚨';
      case 'general': return '💬';
      default: return '📝';
    }
  }

  getPriorityColor(priority: string): string {
    switch (priority) {
      case 'urgent': return '#ef4444';
      case 'high': return '#f59e0b';
      case 'normal': return '#6b7280';
      case 'low': return '#10b981';
      default: return '#6b7280';
    }
  }

  isOwnMessage(message: Message): boolean {
    return message.senderId === this.currentUserId;
  }

  shouldShowDateSeparator(index: number): boolean {
    if (index === 0) return true;
    
    const currentMessage = this.messages[index];
    const previousMessage = this.messages[index - 1];
    
    const currentDate = new Date(currentMessage.timestamp).toDateString();
    const previousDate = new Date(previousMessage.timestamp).toDateString();
    
    return currentDate !== previousDate;
  }

  getDateSeparatorText(date: Date): string {
    const today = new Date().toDateString();
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toDateString();
    const messageDate = new Date(date).toDateString();
    
    if (messageDate === today) return 'Today';
    if (messageDate === yesterday) return 'Yesterday';
    
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  // Track by functions for ngFor optimization
  trackByMessageId(index: number, message: Message): string {
    return message.id;
  }

  // Reply helper methods
  getReplyAuthor(replyToId: string): string {
    const replyMessage = this.messages.find(msg => msg.id === replyToId);
    return replyMessage ? replyMessage.senderName : 'Unknown';
  }

  getReplyContent(replyToId: string): string {
    const replyMessage = this.messages.find(msg => msg.id === replyToId);
    return replyMessage ? replyMessage.content : '';
  }

  // Event helper methods
  onEnterKeydown(event: any): void {
    const keyboardEvent = event as KeyboardEvent;
    if (!keyboardEvent.shiftKey) {
      this.sendMessage();
      keyboardEvent.preventDefault();
    }
  }

  // Message helper methods
  isActionableMessage(message: Message): boolean {
    return message.messageType !== 'system';
  }
}