import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AppCustomerWalletComponent } from './app-customer-wallet.component';

describe('AppCustomerWalletComponent', () => {
  let component: AppCustomerWalletComponent;
  let fixture: ComponentFixture<AppCustomerWalletComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AppCustomerWalletComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AppCustomerWalletComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
