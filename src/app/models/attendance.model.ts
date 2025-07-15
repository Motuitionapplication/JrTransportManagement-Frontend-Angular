export interface Attendance {
  id: string;
  studentId: string;
  classId: string;
  date: Date;
  status: AttendanceStatus;
  checkInTime?: Date;
  checkOutTime?: Date;
  notes?: string;
  markedBy: string; // teacher ID
}

export enum AttendanceStatus {
  PRESENT = 'present',
  ABSENT = 'absent',
  LATE = 'late',
  SICK = 'sick',
  EXCUSED = 'excused'
}

export interface AttendanceReport {
  studentId: string;
  studentName: string;
  classId: string;
  className: string;
  totalDays: number;
  presentDays: number;
  absentDays: number;
  lateDays: number;
  attendancePercentage: number;
  period: {
    startDate: Date;
    endDate: Date;
  };
}
