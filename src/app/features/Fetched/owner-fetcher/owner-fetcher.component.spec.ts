import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OwnerFetcherComponent } from './owner-fetcher.component';

describe('OwnerFetcherComponent', () => {
  let component: OwnerFetcherComponent;
  let fixture: ComponentFixture<OwnerFetcherComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ OwnerFetcherComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OwnerFetcherComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
