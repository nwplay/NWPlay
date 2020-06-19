import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NwpCollectionComponent } from './nwp-collection.component';

describe('NwpCollectionComponent', () => {
  let component: NwpCollectionComponent;
  let fixture: ComponentFixture<NwpCollectionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [NwpCollectionComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NwpCollectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
