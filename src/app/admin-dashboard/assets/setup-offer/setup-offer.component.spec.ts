import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SetupOfferComponent } from './setup-offer.component';

describe('SetupOfferComponent', () => {
  let component: SetupOfferComponent;
  let fixture: ComponentFixture<SetupOfferComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SetupOfferComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SetupOfferComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
