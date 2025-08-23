import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AppAdminWalletComponent } from './app-admin-wallet.component';

describe('AppAdminWalletComponent', () => {
  let component: AppAdminWalletComponent;
  let fixture: ComponentFixture<AppAdminWalletComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AppAdminWalletComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AppAdminWalletComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
