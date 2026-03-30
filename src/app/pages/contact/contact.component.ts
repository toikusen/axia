import { Component, OnInit, signal } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { ContactService } from '../../core/services/contact.service';
import { StaticPageService } from '../../core/services/static-page.service';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [ReactiveFormsModule],
  template: `
    <div class="max-w-2xl mx-auto px-6 py-16 min-h-screen">
      <div class="mb-12">
        <span class="section-label block mb-3">CONTACT</span>
        <div class="w-8 h-px bg-accent"></div>
      </div>

      <!-- 聯絡資訊顯示 -->
      @if (contactInfo()) {
        <div class="prose-axia mb-12 pb-12 border-b border-border" [innerHTML]="contactInfo()"></div>
      }

      @if (submitted()) {
        <div class="text-center py-16">
          <div class="text-accent text-4xl mb-6">✓</div>
          <p class="text-text-primary mb-2">感謝您的來信。</p>
          <p class="text-text-secondary text-sm">我們將盡快回覆您。</p>
        </div>
      } @else {
        <form [formGroup]="form" (ngSubmit)="onSubmit()" class="flex flex-col gap-6">
          <div>
            <label class="section-label block mb-2 text-xs">姓名 *</label>
            <input
              formControlName="name"
              type="text"
              class="w-full bg-bg-secondary border border-border text-text-primary px-4 py-3 text-sm
                     focus:outline-none focus:border-accent transition-colors duration-200"
              placeholder="您的姓名"
            />
            @if (form.get('name')?.invalid && form.get('name')?.touched) {
              <p class="text-red-400 text-xs mt-1">請輸入姓名。</p>
            }
          </div>

          <div>
            <label class="section-label block mb-2 text-xs">電子郵件 *</label>
            <input
              formControlName="email"
              type="email"
              class="w-full bg-bg-secondary border border-border text-text-primary px-4 py-3 text-sm
                     focus:outline-none focus:border-accent transition-colors duration-200"
              placeholder="your@email.com"
            />
            @if (form.get('email')?.invalid && form.get('email')?.touched) {
              <p class="text-red-400 text-xs mt-1">請輸入有效的電子郵件。</p>
            }
          </div>

          <div>
            <label class="section-label block mb-2 text-xs">訊息 *</label>
            <textarea
              formControlName="message"
              rows="6"
              class="w-full bg-bg-secondary border border-border text-text-primary px-4 py-3 text-sm
                     focus:outline-none focus:border-accent transition-colors duration-200 resize-none"
              placeholder="請在此輸入您的訊息..."
            ></textarea>
            @if (form.get('message')?.invalid && form.get('message')?.touched) {
              <p class="text-red-400 text-xs mt-1">請輸入訊息。</p>
            }
          </div>

          @if (error()) {
            <p class="text-red-400 text-xs">{{ error() }}</p>
          }

          <button
            type="submit"
            class="btn-primary self-start"
            [disabled]="loading()"
          >
            {{ loading() ? '送出中...' : 'SEND' }}
          </button>
        </form>
      }
    </div>
  `,
  styles: [`
    .prose-axia :is(p, li) { color: #6a6870; line-height: 1.8; margin-bottom: 1em; font-size: 0.875rem; }
    .prose-axia h2 { color: #c8a882; font-size: 1rem; font-family: Georgia, serif; letter-spacing: 0.1em; margin: 2em 0 0.75em; }
    .prose-axia a { color: #c8a882; text-decoration: underline; }
  `]
})
export class ContactComponent implements OnInit {
  form: FormGroup;
  loading = signal(false);
  submitted = signal(false);
  error = signal<string | null>(null);
  contactInfo = signal<SafeHtml | null>(null);

  constructor(
    private fb: FormBuilder,
    private service: ContactService,
    private staticPageService: StaticPageService,
    private sanitizer: DomSanitizer,
  ) {
    this.form = this.fb.group({
      name: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      message: ['', [Validators.required, Validators.minLength(10)]],
    });
  }

  ngOnInit() {
    this.staticPageService.getBySlug('contact-info').subscribe({
      next: (page) => {
        if (page) {
          this.contactInfo.set(this.sanitizer.bypassSecurityTrustHtml(page.content_rich_text));
        }
      },
      error: () => {
        // 聯絡資訊頁不存在時靜默忽略（不影響表單）
      }
    });
  }

  onSubmit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.loading.set(true);
    this.error.set(null);
    this.service.submit(this.form.value).subscribe({
      next: () => {
        this.loading.set(false);
        this.submitted.set(true);
      },
      error: (err) => {
        this.loading.set(false);
        this.error.set('送出失敗，請稍後再試。');
        console.error(err);
      },
    });
  }
}
