import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BulkAccountComponent } from './bulk-account.component';

describe('BulkAccountComponent', () => {
  let component: BulkAccountComponent;
  let fixture: ComponentFixture<BulkAccountComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BulkAccountComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BulkAccountComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
