import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AdminFetcherComponent } from './admin-fetcher.component';
describe('AdminFetcherComponent', () => {
  let component: AdminFetcherComponent;
  let fixture: ComponentFixture<AdminFetcherComponent>;
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AdminFetcherComponent ]
    })
    .compileComponents();
    fixture = TestBed.createComponent(AdminFetcherComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });
  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
