import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

import { CustomerDashboardComponent } from './customer-dashboard.component';

// Declare Jasmine globals to fix TypeScript compilation
declare function describe(description: string, specDefinitions: () => void): void;
declare function beforeEach(action: (() => void) | (() => Promise<void>)): void;
declare function it(expectation: string, assertion?: (() => void) | (() => Promise<void>), timeout?: number): void;

// Simple expect function declarations
declare function expect(actual: any): {
  toBeTruthy(): boolean;
  toBeDefined(): boolean;
  toBeGreaterThan(expected: number): boolean;
  toBe(expected: any): boolean;
};

describe('CustomerDashboardComponent', () => {
  let component: CustomerDashboardComponent;
  let fixture: ComponentFixture<CustomerDashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CustomerDashboardComponent],
      imports: [
        RouterTestingModule,
        MatCardModule,
        MatIconModule,
        NoopAnimationsModule
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(CustomerDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with correct stats data', () => {
    expect(component.statsData).toBeDefined();
    expect(component.statsData.length).toBeGreaterThan(0);
  });

  it('should initialize with recent activities', () => {
    expect(component.recentActivities).toBeDefined();
    expect(component.recentActivities.length).toBeGreaterThan(0);
  });

  it('should get correct activity icon for success type', () => {
    const icon = component.getActivityIcon('success');
    expect(icon).toBe('check_circle');
  });

  it('should get correct activity icon for warning type', () => {
    const icon = component.getActivityIcon('warning');
    expect(icon).toBe('warning');
  });

  it('should get correct activity icon for error type', () => {
    const icon = component.getActivityIcon('error');
    expect(icon).toBe('error');
  });

  it('should get correct activity icon for info type', () => {
    const icon = component.getActivityIcon('info');
    expect(icon).toBe('info');
  });

  it('should format time ago correctly for recent timestamps', () => {
    const now = new Date();
    const thirtyMinutesAgo = new Date(now.getTime() - 30 * 60 * 1000);
    const timeAgo = component.getTimeAgo(thirtyMinutesAgo);
    expect(timeAgo).toBe('30 minutes ago');
  });

  it('should format time ago correctly for just now', () => {
    const now = new Date();
    const timeAgo = component.getTimeAgo(now);
    expect(timeAgo).toBe('Just now');
  });
});