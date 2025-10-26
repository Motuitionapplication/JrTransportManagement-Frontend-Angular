import { Component, OnInit } from '@angular/core';

export interface ScheduleEvent {
  id: string;
  title: string;
  type: 'trip' | 'break' | 'maintenance' | 'training' | 'personal';
  date: Date;
  startTime: string;
  endTime: string;
  status: 'scheduled' | 'in-progress' | 'completed' | 'cancelled';
  location?: string;
  customerName?: string;
  tripId?: string;
  description?: string;
  isRecurring?: boolean;
  recurringPattern?: 'daily' | 'weekly' | 'monthly';
  priority: 'low' | 'medium' | 'high';
  color: string;
}

export interface WorkingHours {
  day: string;
  isWorking: boolean;
  startTime: string;
  endTime: string;
  breakStart?: string;
  breakEnd?: string;
}

export interface AvailabilityStatus {
  isAvailable: boolean;
  currentStatus: 'available' | 'busy' | 'break' | 'offline';
  nextAvailable?: Date;
  reason?: string;
}

@Component({
  selector: 'app-schedule',
  templateUrl: './schedule.component.html',
  styleUrls: ['./schedule.component.scss']
})
export class ScheduleComponent implements OnInit {
  events: ScheduleEvent[] = [];
  filteredEvents: ScheduleEvent[] = [];
  currentDate = new Date();
  selectedDate = new Date();
  viewMode: 'day' | 'week' | 'month' = 'day';
  
  workingHours: WorkingHours[] = [];
  availabilityStatus: AvailabilityStatus = {
    isAvailable: true,
    currentStatus: 'available'
  };
  
  loading = true;
  showEventForm = false;
  selectedEvent: ScheduleEvent | null = null;
  
  // Filters
  eventTypeFilter = '';
  statusFilter = '';
  
  // Calendar navigation
  calendarWeeks: Date[][] = [];
  monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  
  dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  
  constructor() {
    this.selectedDate = new Date();
    this.currentDate = new Date();
  }

  ngOnInit(): void {
    this.loadScheduleData();
    this.initializeWorkingHours();
    this.generateCalendar();
  }

  loadScheduleData(): void {
    this.loading = true;
    
    // Simulate API call
    setTimeout(() => {
      this.events = this.generateMockEvents();
      this.filteredEvents = this.getEventsForDate(this.selectedDate);
      this.updateAvailabilityStatus();
      this.loading = false;
    }, 1000);
  }

  generateMockEvents(): ScheduleEvent[] {
    const events: ScheduleEvent[] = [];
    const today = new Date();
    
    // Generate events for the next 30 days
    for (let i = 0; i < 30; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() + i);
      
      // Skip some days randomly
      if (Math.random() > 0.7) continue;
      
      const numEvents = Math.floor(Math.random() * 4) + 1;
      
      for (let j = 0; j < numEvents; j++) {
        const eventType = this.getRandomEventType();
        const startHour = Math.floor(Math.random() * 12) + 8; // 8 AM to 7 PM
        const duration = Math.floor(Math.random() * 3) + 1; // 1-3 hours
        
        events.push({
          id: `event_${i}_${j}`,
          title: this.getEventTitle(eventType),
          type: eventType,
          date: new Date(date),
          startTime: `${String(startHour).padStart(2, '0')}:00`,
          endTime: `${String(startHour + duration).padStart(2, '0')}:00`,
          status: this.getRandomStatus(),
          location: eventType === 'trip' ? this.getRandomLocation() : undefined,
          customerName: eventType === 'trip' ? this.getRandomCustomerName() : undefined,
          tripId: eventType === 'trip' ? `TRIP${String(Math.floor(Math.random() * 10000)).padStart(4, '0')}` : undefined,
          description: this.getEventDescription(eventType),
          priority: this.getRandomPriority(),
          color: this.getEventColor(eventType),
          isRecurring: Math.random() > 0.8,
          recurringPattern: Math.random() > 0.5 ? 'weekly' : 'daily'
        });
      }
    }
    
    return events.sort((a, b) => {
      const dateCompare = a.date.getTime() - b.date.getTime();
      if (dateCompare === 0) {
        return a.startTime.localeCompare(b.startTime);
      }
      return dateCompare;
    });
  }

  getRandomEventType(): 'trip' | 'break' | 'maintenance' | 'training' | 'personal' {
    const types: ('trip' | 'break' | 'maintenance' | 'training' | 'personal')[] = ['trip', 'break', 'maintenance', 'training', 'personal'];
    const weights = [0.6, 0.2, 0.1, 0.05, 0.05]; // 60% trips, 20% breaks, etc.
    
    const random = Math.random();
    let sum = 0;
    
    for (let i = 0; i < weights.length; i++) {
      sum += weights[i];
      if (random < sum) return types[i];
    }
    
    return 'trip';
  }

  getEventTitle(type: string): string {
    const titles = {
      trip: ['Pickup & Delivery', 'Customer Trip', 'School Run', 'Airport Transfer'],
      break: ['Lunch Break', 'Rest Period', 'Coffee Break'],
      maintenance: ['Vehicle Inspection', 'Oil Change', 'Tire Check', 'Fuel Up'],
      training: ['Safety Training', 'Customer Service Workshop', 'New Routes Training'],
      personal: ['Personal Time', 'Appointment', 'Family Time']
    };
    
    const typeArray = titles[type as keyof typeof titles] || ['Event'];
    return typeArray[Math.floor(Math.random() * typeArray.length)];
  }

  getRandomStatus(): 'scheduled' | 'in-progress' | 'completed' | 'cancelled' {
    const statuses: ('scheduled' | 'in-progress' | 'completed' | 'cancelled')[] = ['scheduled', 'in-progress', 'completed', 'cancelled'];
    const weights = [0.5, 0.1, 0.35, 0.05];
    
    const random = Math.random();
    let sum = 0;
    
    for (let i = 0; i < weights.length; i++) {
      sum += weights[i];
      if (random < sum) return statuses[i];
    }
    
    return 'scheduled';
  }

  getRandomPriority(): 'low' | 'medium' | 'high' {
    const priorities: ('low' | 'medium' | 'high')[] = ['low', 'medium', 'high'];
    const weights = [0.4, 0.4, 0.2];
    
    const random = Math.random();
    let sum = 0;
    
    for (let i = 0; i < weights.length; i++) {
      sum += weights[i];
      if (random < sum) return priorities[i];
    }
    
    return 'medium';
  }

  getEventColor(type: string): string {
    const colors = {
      trip: '#3b82f6',
      break: '#10b981',
      maintenance: '#f59e0b',
      training: '#8b5cf6',
      personal: '#ef4444'
    };
    
    return colors[type as keyof typeof colors] || '#6b7280';
  }

  getRandomLocation(): string {
    const locations = [
      'Downtown Area', 'Airport Terminal', 'Shopping Mall', 'Business District',
      'Residential Area', 'Train Station', 'Hospital', 'University Campus'
    ];
    return locations[Math.floor(Math.random() * locations.length)];
  }

  getRandomCustomerName(): string {
    const names = [
      'John Smith', 'Sarah Johnson', 'Michael Brown', 'Emily Davis',
      'David Wilson', 'Lisa Anderson', 'Robert Taylor', 'Jennifer Miller'
    ];
    return names[Math.floor(Math.random() * names.length)];
  }

  getEventDescription(type: string): string {
    const descriptions = {
      trip: 'Customer transportation service',
      break: 'Scheduled break time',
      maintenance: 'Vehicle maintenance and inspection',
      training: 'Professional development session',
      personal: 'Personal time off'
    };
    
    return descriptions[type as keyof typeof descriptions] || 'Scheduled event';
  }

  initializeWorkingHours(): void {
    this.workingHours = [
      { day: 'Monday', isWorking: true, startTime: '08:00', endTime: '18:00', breakStart: '12:00', breakEnd: '13:00' },
      { day: 'Tuesday', isWorking: true, startTime: '08:00', endTime: '18:00', breakStart: '12:00', breakEnd: '13:00' },
      { day: 'Wednesday', isWorking: true, startTime: '08:00', endTime: '18:00', breakStart: '12:00', breakEnd: '13:00' },
      { day: 'Thursday', isWorking: true, startTime: '08:00', endTime: '18:00', breakStart: '12:00', breakEnd: '13:00' },
      { day: 'Friday', isWorking: true, startTime: '08:00', endTime: '18:00', breakStart: '12:00', breakEnd: '13:00' },
      { day: 'Saturday', isWorking: true, startTime: '09:00', endTime: '15:00' },
      { day: 'Sunday', isWorking: false, startTime: '', endTime: '' }
    ];
  }

  updateAvailabilityStatus(): void {
    const now = new Date();
    const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    const dayOfWeek = this.dayNames[now.getDay()];
    
    const todayHours = this.workingHours.find(h => h.day === dayOfWeek);
    
    if (!todayHours || !todayHours.isWorking) {
      this.availabilityStatus = {
        isAvailable: false,
        currentStatus: 'offline',
        reason: 'Not a working day'
      };
      return;
    }
    
    const currentEvent = this.events.find(event => {
      return this.isSameDate(event.date, now) &&
             currentTime >= event.startTime &&
             currentTime <= event.endTime &&
             event.status === 'in-progress';
    });
    
    if (currentEvent) {
      this.availabilityStatus = {
        isAvailable: false,
        currentStatus: 'busy',
        reason: `Currently ${currentEvent.title.toLowerCase()}`
      };
    } else if (currentTime >= todayHours.startTime && currentTime <= todayHours.endTime) {
      this.availabilityStatus = {
        isAvailable: true,
        currentStatus: 'available'
      };
    } else {
      this.availabilityStatus = {
        isAvailable: false,
        currentStatus: 'offline',
        reason: 'Outside working hours'
      };
    }
  }

  generateCalendar(): void {
    this.calendarWeeks = [];
    const year = this.selectedDate.getFullYear();
    const month = this.selectedDate.getMonth();
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    let currentWeek: Date[] = [];
    let currentDate = new Date(startDate);
    
    while (currentDate <= lastDay || currentWeek.length < 7) {
      currentWeek.push(new Date(currentDate));
      
      if (currentWeek.length === 7) {
        this.calendarWeeks.push(currentWeek);
        currentWeek = [];
      }
      
      currentDate.setDate(currentDate.getDate() + 1);
      
      // Stop after we've filled the calendar
      if (this.calendarWeeks.length >= 6) break;
    }
  }

  // Navigation methods
  changeViewMode(mode: 'day' | 'week' | 'month'): void {
    this.viewMode = mode;
    this.applyFilters();
  }

  navigateDate(direction: 'prev' | 'next'): void {
    const newDate = new Date(this.selectedDate);
    
    switch (this.viewMode) {
      case 'day':
        newDate.setDate(newDate.getDate() + (direction === 'next' ? 1 : -1));
        break;
      case 'week':
        newDate.setDate(newDate.getDate() + (direction === 'next' ? 7 : -7));
        break;
      case 'month':
        newDate.setMonth(newDate.getMonth() + (direction === 'next' ? 1 : -1));
        break;
    }
    
    this.selectedDate = newDate;
    this.applyFilters();
    if (this.viewMode === 'month') {
      this.generateCalendar();
    }
  }

  selectDate(date: Date): void {
    this.selectedDate = new Date(date);
    this.viewMode = 'day';
    this.applyFilters();
  }

  goToToday(): void {
    this.selectedDate = new Date();
    this.applyFilters();
    if (this.viewMode === 'month') {
      this.generateCalendar();
    }
  }

  // Event management
  getEventsForDate(date: Date): ScheduleEvent[] {
    return this.events.filter(event => this.isSameDate(event.date, date));
  }

  getEventsForWeek(): ScheduleEvent[] {
    const weekStart = this.getWeekStart(this.selectedDate);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 6);
    
    return this.events.filter(event => {
      return event.date >= weekStart && event.date <= weekEnd;
    });
  }

  getEventsForMonth(): ScheduleEvent[] {
    const monthStart = new Date(this.selectedDate.getFullYear(), this.selectedDate.getMonth(), 1);
    const monthEnd = new Date(this.selectedDate.getFullYear(), this.selectedDate.getMonth() + 1, 0);
    
    return this.events.filter(event => {
      return event.date >= monthStart && event.date <= monthEnd;
    });
  }

  getWeekStart(date: Date): Date {
    const result = new Date(date);
    const day = result.getDay();
    const diff = result.getDate() - day;
    result.setDate(diff);
    result.setHours(0, 0, 0, 0);
    return result;
  }

  applyFilters(): void {
    let events: ScheduleEvent[] = [];
    
    switch (this.viewMode) {
      case 'day':
        events = this.getEventsForDate(this.selectedDate);
        break;
      case 'week':
        events = this.getEventsForWeek();
        break;
      case 'month':
        events = this.getEventsForMonth();
        break;
    }
    
    // Apply type filter
    if (this.eventTypeFilter) {
      events = events.filter(event => event.type === this.eventTypeFilter);
    }
    
    // Apply status filter
    if (this.statusFilter) {
      events = events.filter(event => event.status === this.statusFilter);
    }
    
    this.filteredEvents = events;
  }

  clearFilters(): void {
    this.eventTypeFilter = '';
    this.statusFilter = '';
    this.applyFilters();
  }

  // Event actions
  selectEvent(event: ScheduleEvent): void {
    this.selectedEvent = event;
  }

  startEvent(event: ScheduleEvent): void {
    event.status = 'in-progress';
    console.log('Starting event:', event.title);
    this.updateAvailabilityStatus();
  }

  completeEvent(event: ScheduleEvent): void {
    event.status = 'completed';
    console.log('Completing event:', event.title);
    this.updateAvailabilityStatus();
  }

  cancelEvent(event: ScheduleEvent): void {
    event.status = 'cancelled';
    console.log('Cancelling event:', event.title);
    this.updateAvailabilityStatus();
  }

  editEvent(event: ScheduleEvent): void {
    this.selectedEvent = event;
    this.showEventForm = true;
  }

  createNewEvent(): void {
    this.selectedEvent = null;
    this.showEventForm = true;
  }

  // Utility methods
  isSameDate(date1: Date, date2: Date): boolean {
    return date1.getFullYear() === date2.getFullYear() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getDate() === date2.getDate();
  }

  isToday(date: Date): boolean {
    return this.isSameDate(date, new Date());
  }

  isSelectedDate(date: Date): boolean {
    return this.isSameDate(date, this.selectedDate);
  }

  hasEvents(date: Date): boolean {
    return this.events.some(event => this.isSameDate(event.date, date));
  }

  formatDate(date: Date): string {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(date);
  }

  formatTime(time: string): string {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  }

  formatDateRange(): string {
    switch (this.viewMode) {
      case 'day':
        return this.formatDate(this.selectedDate);
      case 'week':
        const weekStart = this.getWeekStart(this.selectedDate);
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekEnd.getDate() + 6);
        return `${this.formatDate(weekStart)} - ${this.formatDate(weekEnd)}`;
      case 'month':
        return `${this.monthNames[this.selectedDate.getMonth()]} ${this.selectedDate.getFullYear()}`;
      default:
        return '';
    }
  }

  getEventStatusClass(status: string): string {
    return `status-${status}`;
  }

  getEventTypeClass(type: string): string {
    return `type-${type}`;
  }

  getPriorityClass(priority: string): string {
    return `priority-${priority}`;
  }

  // Track by functions for ngFor optimization
  trackByEventId(index: number, event: ScheduleEvent): string {
    return event.id;
  }

  getEventsForDateByIndex(dayIndex: number): ScheduleEvent[] {
    const weekStart = this.getWeekStart(this.selectedDate);
    const targetDate = new Date(weekStart.getTime() + dayIndex * 24 * 60 * 60 * 1000);
    return this.getEventsForDate(targetDate);
  }

  changeViewModeHelper(mode: string): void {
    this.changeViewMode(mode as 'day' | 'week' | 'month');
  }
}