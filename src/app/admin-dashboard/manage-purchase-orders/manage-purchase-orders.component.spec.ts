import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ManagePurchaseOrdersComponent } from './manage-purchase-orders.component';

describe('ManagePurchaseOrdersComponent', () => {
  let component: ManagePurchaseOrdersComponent;
  let fixture: ComponentFixture<ManagePurchaseOrdersComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ManagePurchaseOrdersComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ManagePurchaseOrdersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
