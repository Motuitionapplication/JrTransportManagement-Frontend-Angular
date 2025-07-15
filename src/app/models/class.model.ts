export interface Class {
  id: string;
  name: string;
  description: string;
  ageGroup: string; // e.g., "3-4 years", "4-5 years"
  capacity: number;
  currentEnrollment: number;
  teacherId: string;
  assistantTeacherIds?: string[];
  schedule: ClassSchedule[];
  room: string;
  isActive: boolean;
  startDate: Date;
  endDate?: Date;
  fees: number;
  activities: string[];
}

export interface ClassSchedule {
  dayOfWeek: number; // 0 = Sunday, 1 = Monday, etc.
  startTime: string; // HH:mm format
  endTime: string; // HH:mm format
  subject?: string;
  activity?: string;
}

export interface ClassActivity {
  id: string;
  name: string;
  description: string;
  duration: number; // minutes
  materials?: string[];
  learningObjectives: string[];
}
