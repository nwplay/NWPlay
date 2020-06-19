import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ResolverPopoverComponent } from './resolver-popover.component';

describe('ResolverPopoverComponent', () => {
  let component: ResolverPopoverComponent;
  let fixture: ComponentFixture<ResolverPopoverComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ResolverPopoverComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ResolverPopoverComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
