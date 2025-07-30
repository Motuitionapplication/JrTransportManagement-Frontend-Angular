import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomerFetcherComponent } from './customer-fetcher.component';

describe('CustomerFetcherComponent', () => {
  let component: CustomerFetcherComponent;
  let fixture: ComponentFixture<CustomerFetcherComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CustomerFetcherComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CustomerFetcherComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
