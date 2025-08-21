import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WalletManagementsComponent } from './wallet-managements.component';

describe('WalletManagementsComponent', () => {
  let component: WalletManagementsComponent;
  let fixture: ComponentFixture<WalletManagementsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ WalletManagementsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WalletManagementsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
