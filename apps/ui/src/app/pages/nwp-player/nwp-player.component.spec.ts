import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NwpPlayerComponent } from './nwp-player.component';

describe('NwplayPlayerComponent', () => {
  let component: NwpPlayerComponent;
  let fixture: ComponentFixture<NwpPlayerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [NwpPlayerComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NwpPlayerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
