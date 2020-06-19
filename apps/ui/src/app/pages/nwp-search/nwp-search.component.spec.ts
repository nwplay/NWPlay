import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NwpSearchComponent } from './nwp-search.component';

describe('NwpCollectionComponent', () => {
  let component: NwpSearchComponent;
  let fixture: ComponentFixture<NwpSearchComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [NwpSearchComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NwpSearchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
