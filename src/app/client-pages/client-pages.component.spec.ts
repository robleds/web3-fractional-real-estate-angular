import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ClientPagesComponent } from './client-pages.component';

describe('ClientPagesComponent', () => {
  let component: ClientPagesComponent;
  let fixture: ComponentFixture<ClientPagesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ClientPagesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ClientPagesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
