import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HelpDrawerComponent } from './help-drawer.component';

describe('HelpDrawerComponent', () => {
  let component: HelpDrawerComponent;
  let fixture: ComponentFixture<HelpDrawerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HelpDrawerComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HelpDrawerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
