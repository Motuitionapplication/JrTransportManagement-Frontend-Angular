export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  subject: string;
  content: string;
  sentDate: Date;
  readDate?: Date;
  isRead: boolean;
  messageType: MessageType;
  attachments?: MessageAttachment[];
  priority: MessagePriority;
  relatedStudentId?: string;
}

export enum MessageType {
  ANNOUNCEMENT = 'announcement',
  PERSONAL = 'personal',
  PROGRESS_REPORT = 'progress_report',
  REMINDER = 'reminder',
  EMERGENCY = 'emergency'
}

export enum MessagePriority {
  LOW = 'low',
  NORMAL = 'normal',
  HIGH = 'high',
  URGENT = 'urgent'
}

export interface MessageAttachment {
  id: string;
  fileName: string;
  fileUrl: string;
  fileSize: number;
  mimeType: string;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  authorId: string;
  publishDate: Date;
  expiryDate?: Date;
  targetAudience: AnnouncementAudience[];
  isActive: boolean;
  attachments?: MessageAttachment[];
}

export enum AnnouncementAudience {
  ALL_PARENTS = 'all_parents',
  ALL_TEACHERS = 'all_teachers',
  CLASS_SPECIFIC = 'class_specific',
  INDIVIDUAL = 'individual'
}
