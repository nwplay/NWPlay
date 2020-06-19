import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NwpMediaCardComponent } from './nwp-media-card.component';

describe('NwpMediaCardComponent', () => {
  let component: NwpMediaCardComponent;
  let fixture: ComponentFixture<NwpMediaCardComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [NwpMediaCardComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NwpMediaCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
