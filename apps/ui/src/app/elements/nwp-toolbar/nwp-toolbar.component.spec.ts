import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NwpToolbarComponent } from './nwp-toolbar.component';

describe('NwpToolbarComponent', () => {
  let component: NwpToolbarComponent;
  let fixture: ComponentFixture<NwpToolbarComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [NwpToolbarComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NwpToolbarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
