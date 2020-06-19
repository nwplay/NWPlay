import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NwpSettingsComponent } from './nwp-settings.component';

describe('NwpSettingsComponent', () => {
  let component: NwpSettingsComponent;
  let fixture: ComponentFixture<NwpSettingsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [NwpSettingsComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NwpSettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
