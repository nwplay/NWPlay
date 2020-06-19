import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NwpStartComponent } from './nwp-start.component';

describe('NwpStartComponent', () => {
  let component: NwpStartComponent;
  let fixture: ComponentFixture<NwpStartComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [NwpStartComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NwpStartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
