# Dynamic Message Component

## Overview
The Message Component has been fully converted to a dynamic, backend-integrated solution for the JR Transport Management System. It provides a comprehensive messaging interface for customers to receive and manage messages from drivers, administrators, and the system.

## Features

### ✨ **Core Functionality**
- **Real-time Message Loading** - Fetches messages from backend API
- **Search & Filtering** - Search by content, filter by type/status/priority
- **Pagination** - Server-side pagination for large message lists
- **Message Threading** - Reply and forward functionality
- **Attachment Support** - Upload, view, and download file attachments
- **Read/Unread Status** - Mark messages as read/unread with backend sync

### 🔧 **Backend Integration**
- **RESTful API Integration** - Full CRUD operations via MessageService
- **Error Handling** - Comprehensive error handling with user feedback
- **Reactive Programming** - Uses RxJS observables for real-time updates
- **Caching** - Local state management with BehaviorSubjects
- **File Upload** - FormData-based file attachment handling

### 🎨 **UI/UX Features**
- **Split-view Interface** - Message list + detailed message view
- **Responsive Design** - Mobile, tablet, and desktop optimized
- **Loading States** - Skeleton loading and spinners
- **Success/Error Feedback** - Toast notifications and error alerts
- **Accessibility** - ARIA labels and keyboard navigation

## API Endpoints

The component integrates with the following backend endpoints:

```
GET    /api/messages/customer          - Get paginated messages
GET    /api/messages/{id}              - Get specific message
PATCH  /api/messages/{id}/read         - Mark as read
PATCH  /api/messages/{id}/unread       - Mark as unread
PATCH  /api/messages/mark-all-read     - Mark all as read
DELETE /api/messages/{id}              - Delete message
POST   /api/messages/send              - Send new message
POST   /api/messages/{id}/reply        - Reply to message
POST   /api/messages/{id}/forward      - Forward message
GET    /api/messages/unread-count      - Get unread count
GET    /api/messages/search            - Search messages
GET    /api/messages/attachments/{id}  - Download attachment
```

## Component Structure

```
src/app/features/customer/components/message/
├── message.component.ts           # Main component logic
├── message.component.html         # Template with split-view UI
├── message.component.scss         # Comprehensive styling
└── README.md                     # This documentation

src/app/services/
└── message.service.ts            # Backend integration service
```

## Data Models

### Message Interface
```typescript
interface Message {
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
```

### Message Filters
```typescript
interface MessageFilters {
  search?: string;
  type?: string;
  priority?: string;
  isRead?: boolean;
  dateFrom?: Date;
  dateTo?: Date;
  page?: number;
  size?: number;
}
```

## Usage Example

```typescript
// In parent component
import { MessageComponent } from './components/message/message.component';

// The component automatically loads and manages messages
// No additional setup required - fully self-contained
```

## Backend Requirements

### Expected API Response Format
```json
{
  "content": [
    {
      "id": 1,
      "fromUser": { "name": "Driver Name" },
      "subject": "Trip Update",
      "content": "Message content here",
      "createdAt": "2024-01-15T10:30:00Z",
      "isRead": false,
      "type": "warning",
      "priority": "high",
      "customerId": 123,
      "bookingId": "BK001",
      "attachments": [
        {
          "id": 1,
          "filename": "receipt.pdf",
          "url": "/files/receipt.pdf",
          "size": 1024,
          "contentType": "application/pdf"
        }
      ]
    }
  ],
  "totalElements": 50,
  "totalPages": 5,
  "number": 0,
  "first": true,
  "last": false
}
```

## Environment Configuration

The service uses the environment API URL:
```typescript
// environment.ts
apiUrl: 'https://jrtransportmanagement-backend-spring.onrender.com/api'
```

## Error Handling

- **Network Errors** - Displays user-friendly error messages
- **Validation Errors** - Shows field-specific error feedback
- **Timeout Handling** - Configurable timeout with retry options
- **Offline Support** - Graceful degradation when offline

## Performance Optimizations

- **Debounced Search** - 300ms debounce on search input
- **Virtual Scrolling** - Server-side pagination for large datasets
- **Lazy Loading** - Messages loaded on demand
- **Caching** - Local state caching with BehaviorSubjects
- **OnPush Change Detection** - Optimized change detection strategy

## Security Features

- **JWT Authentication** - All API calls include authentication
- **XSS Protection** - Sanitized message content display
- **File Upload Validation** - Secure file attachment handling
- **CSRF Protection** - Cross-site request forgery protection

## Future Enhancements

- [ ] **Real-time Updates** - WebSocket integration for live messages
- [ ] **Message Templates** - Pre-defined message templates
- [ ] **Rich Text Editor** - WYSIWYG editor for message composition
- [ ] **Message Categories** - Custom message categorization
- [ ] **Auto-Reply** - Automated response configuration
- [ ] **Message Archiving** - Archive old messages
- [ ] **Export Functionality** - Export messages to PDF/Excel

## Troubleshooting

### Common Issues
1. **Messages not loading** - Check API URL and authentication
2. **Search not working** - Verify debounce timing and backend search endpoint
3. **Attachments failing** - Check file size limits and MIME type restrictions
4. **Pagination errors** - Verify page size and total count calculations

### Debug Mode
Enable debug logging by setting:
```typescript
// In message.service.ts
private debug = true; // Set to true for console logging
```

## Dependencies

- **Angular 15+** - Core framework
- **RxJS** - Reactive programming
- **Bootstrap 5** - UI framework
- **FontAwesome** - Icons
- **HttpClient** - HTTP requests

## License

This component is part of the JR Transport Management System and follows the project's licensing terms.