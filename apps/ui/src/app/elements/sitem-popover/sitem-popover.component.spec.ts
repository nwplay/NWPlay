import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SitemPopoverComponent } from './sitem-popover.component';

describe('ResolverPopoverComponent', () => {
  let component: SitemPopoverComponent;
  let fixture: ComponentFixture<SitemPopoverComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [SitemPopoverComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SitemPopoverComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
