import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, BehaviorSubject, throwError } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';

export interface Message {
  id: number;
  from: string;
  subject: string;
  content: string;
  date: Date;
  isRead: boolean;
  type: 'info' | 'warning' | 'success' | 'error';
  priority: 'low' | 'medium' | 'high';
  customerId?: number;
  driverId?: number;
  bookingId?: string;
  attachments?: MessageAttachment[];
}

export interface MessageAttachment {
  id: number;
  filename: string;
  url: string;
  size: number;
  type: string;
}

export interface MessageFilters {
  search?: string;
  type?: string;
  priority?: string;
  isRead?: boolean;
  dateFrom?: Date;
  dateTo?: Date;
  page?: number;
  size?: number;
}

export interface MessageResponse {
  messages: Message[];
  totalElements: number;
  totalPages: number;
  currentPage: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

export interface CreateMessageRequest {
  to: string;
  subject: string;
  content: string;
  type?: 'info' | 'warning' | 'success' | 'error';
  priority?: 'low' | 'medium' | 'high';
  attachments?: File[];
}

@Injectable({
  providedIn: 'root'
})
export class MessageService {
  private apiUrl = `${environment.apiUrl}/messages`;
  private messagesSubject = new BehaviorSubject<Message[]>([]);
  private unreadCountSubject = new BehaviorSubject<number>(0);

  public messages$ = this.messagesSubject.asObservable();
  public unreadCount$ = this.unreadCountSubject.asObservable();

  constructor(private http: HttpClient) {
    // Initialize by loading messages
    this.loadMessages().subscribe();
  }

  /**
   * Load messages with optional filters
   */
  loadMessages(filters?: MessageFilters): Observable<MessageResponse> {
    let params = new HttpParams();
    
    if (filters) {
      if (filters.search) params = params.set('search', filters.search);
      if (filters.type && filters.type !== 'all') params = params.set('type', filters.type);
      if (filters.priority) params = params.set('priority', filters.priority);
      if (filters.isRead !== undefined) params = params.set('isRead', filters.isRead.toString());
      if (filters.dateFrom) params = params.set('dateFrom', filters.dateFrom.toISOString());
      if (filters.dateTo) params = params.set('dateTo', filters.dateTo.toISOString());
      if (filters.page !== undefined) params = params.set('page', filters.page.toString());
      if (filters.size !== undefined) params = params.set('size', filters.size.toString());
    }

    return this.http.get<any>(`${this.apiUrl}/customer`, { params }).pipe(
      map(response => {
        const messageResponse: MessageResponse = {
          messages: response.content.map((msg: any) => this.mapToMessage(msg)) || [],
          totalElements: response.totalElements || 0,
          totalPages: response.totalPages || 0,
          currentPage: response.number || 0,
          hasNext: !response.last,
          hasPrevious: !response.first
        };
        
        // Update local state
        this.messagesSubject.next(messageResponse.messages);
        this.updateUnreadCount(messageResponse.messages);
        
        return messageResponse;
      }),
      catchError(error => {
        console.error('Error loading messages:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Get a specific message by ID
   */
  getMessage(messageId: number): Observable<Message> {
    return this.http.get<any>(`${this.apiUrl}/${messageId}`).pipe(
      map(response => this.mapToMessage(response)),
      catchError(error => {
        console.error('Error getting message:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Mark a message as read
   */
  markAsRead(messageId: number): Observable<void> {
    return this.http.patch<void>(`${this.apiUrl}/${messageId}/read`, {}).pipe(
      tap(() => {
        // Update local state
        const messages = this.messagesSubject.value;
        const message = messages.find(m => m.id === messageId);
        if (message && !message.isRead) {
          message.isRead = true;
          this.messagesSubject.next([...messages]);
          this.updateUnreadCount(messages);
        }
      }),
      catchError(error => {
        console.error('Error marking message as read:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Mark a message as unread
   */
  markAsUnread(messageId: number): Observable<void> {
    return this.http.patch<void>(`${this.apiUrl}/${messageId}/unread`, {}).pipe(
      tap(() => {
        // Update local state
        const messages = this.messagesSubject.value;
        const message = messages.find(m => m.id === messageId);
        if (message && message.isRead) {
          message.isRead = false;
          this.messagesSubject.next([...messages]);
          this.updateUnreadCount(messages);
        }
      }),
      catchError(error => {
        console.error('Error marking message as unread:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Mark all messages as read
   */
  markAllAsRead(): Observable<void> {
    return this.http.patch<void>(`${this.apiUrl}/mark-all-read`, {}).pipe(
      tap(() => {
        // Update local state
        const messages = this.messagesSubject.value.map(m => ({ ...m, isRead: true }));
        this.messagesSubject.next(messages);
        this.unreadCountSubject.next(0);
      }),
      catchError(error => {
        console.error('Error marking all messages as read:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Delete a message
   */
  deleteMessage(messageId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${messageId}`).pipe(
      tap(() => {
        // Update local state
        const messages = this.messagesSubject.value.filter(m => m.id !== messageId);
        this.messagesSubject.next(messages);
        this.updateUnreadCount(messages);
      }),
      catchError(error => {
        console.error('Error deleting message:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Send a new message
   */
  sendMessage(messageRequest: CreateMessageRequest): Observable<Message> {
    const formData = new FormData();
    formData.append('to', messageRequest.to);
    formData.append('subject', messageRequest.subject);
    formData.append('content', messageRequest.content);
    
    if (messageRequest.type) formData.append('type', messageRequest.type);
    if (messageRequest.priority) formData.append('priority', messageRequest.priority);
    
    if (messageRequest.attachments) {
      messageRequest.attachments.forEach((file, index) => {
        formData.append(`attachments[${index}]`, file);
      });
    }

    return this.http.post<any>(`${this.apiUrl}/send`, formData).pipe(
      map(response => this.mapToMessage(response)),
      catchError(error => {
        console.error('Error sending message:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Reply to a message
   */
  replyToMessage(messageId: number, content: string, attachments?: File[]): Observable<Message> {
    const formData = new FormData();
    formData.append('content', content);
    
    if (attachments) {
      attachments.forEach((file, index) => {
        formData.append(`attachments[${index}]`, file);
      });
    }

    return this.http.post<any>(`${this.apiUrl}/${messageId}/reply`, formData).pipe(
      map(response => this.mapToMessage(response)),
      catchError(error => {
        console.error('Error replying to message:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Forward a message
   */
  forwardMessage(messageId: number, to: string, additionalContent?: string): Observable<Message> {
    const request = {
      to,
      additionalContent: additionalContent || ''
    };

    return this.http.post<any>(`${this.apiUrl}/${messageId}/forward`, request).pipe(
      map(response => this.mapToMessage(response)),
      catchError(error => {
        console.error('Error forwarding message:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Get unread messages count
   */
  getUnreadCount(): Observable<number> {
    return this.http.get<{count: number}>(`${this.apiUrl}/unread-count`).pipe(
      map(response => response.count),
      tap(count => this.unreadCountSubject.next(count)),
      catchError(error => {
        console.error('Error getting unread count:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Download message attachment
   */
  downloadAttachment(attachmentId: number): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/attachments/${attachmentId}`, {
      responseType: 'blob'
    }).pipe(
      catchError(error => {
        console.error('Error downloading attachment:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Search messages
   */
  searchMessages(query: string, page: number = 0, size: number = 10): Observable<MessageResponse> {
    const params = new HttpParams()
      .set('search', query)
      .set('page', page.toString())
      .set('size', size.toString());

    return this.http.get<any>(`${this.apiUrl}/search`, { params }).pipe(
      map(response => ({
        messages: response.content.map((msg: any) => this.mapToMessage(msg)) || [],
        totalElements: response.totalElements || 0,
        totalPages: response.totalPages || 0,
        currentPage: response.number || 0,
        hasNext: !response.last,
        hasPrevious: !response.first
      })),
      catchError(error => {
        console.error('Error searching messages:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Map backend response to Message interface
   */
  private mapToMessage(response: any): Message {
    return {
      id: response.id,
      from: response.fromUser?.name || response.from || 'System',
      subject: response.subject,
      content: response.content,
      date: new Date(response.createdAt || response.date),
      isRead: response.isRead || false,
      type: response.type || 'info',
      priority: response.priority || 'low',
      customerId: response.customerId,
      driverId: response.driverId,
      bookingId: response.bookingId,
      attachments: response.attachments?.map((att: any) => ({
        id: att.id,
        filename: att.filename,
        url: att.url,
        size: att.size,
        type: att.contentType
      })) || []
    };
  }

  /**
   * Update unread count from messages array
   */
  private updateUnreadCount(messages: Message[]): void {
    const unreadCount = messages.filter(m => !m.isRead).length;
    this.unreadCountSubject.next(unreadCount);
  }

  /**
   * Clear local state
   */
  clearMessages(): void {
    this.messagesSubject.next([]);
    this.unreadCountSubject.next(0);
  }
}