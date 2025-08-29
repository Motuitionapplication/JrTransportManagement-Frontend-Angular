import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AppDriverWalletComponent } from './app-driver-wallet.component';

describe('AppDriverWalletComponent', () => {
  let component: AppDriverWalletComponent;
  let fixture: ComponentFixture<AppDriverWalletComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AppDriverWalletComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AppDriverWalletComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
