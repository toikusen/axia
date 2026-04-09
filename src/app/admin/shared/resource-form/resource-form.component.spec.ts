import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { MessageService } from 'primeng/api';
import { ResourceFormComponent } from './resource-form.component';

describe('ResourceFormComponent — richtext rendering', () => {
  let fixture: ComponentFixture<ResourceFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ResourceFormComponent],
      providers: [
        MessageService,
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              data: { resourceKey: 'schedule' },
              paramMap: { get: () => null },
            },
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ResourceFormComponent);
    fixture.detectChanges();
  });

  it('should render p-editor for richtext fields', () => {
    const editors = fixture.nativeElement.querySelectorAll('p-editor');
    expect(editors.length).toBeGreaterThan(0);
  });

  it('should not render a plain textarea for any field', () => {
    const textareas = fixture.nativeElement.querySelectorAll('textarea.admin-textarea');
    expect(textareas.length).toBe(0);
  });
});
