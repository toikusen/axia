import { Component, OnInit, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { StaticPageService } from '../../core/services/static-page.service';
import { StaticPage } from '../../core/models/static-page.model';

@Component({
  selector: 'app-rules',
  standalone: true,
  imports: [],
  template: `
    <div class="max-w-3xl mx-auto px-6 py-16 min-h-screen">
      <div class="mb-12">
        <span class="section-label block mb-3">RULES</span>
        <div class="w-8 h-px bg-accent"></div>
      </div>

      <!-- Sub-page nav -->
      @if (pages().length > 1) {
        <div class="flex gap-4 mb-10 border-b border-border pb-4 flex-wrap">
          @for (page of pages(); track page.slug) {
            <button
              class="text-xs tracking-widest uppercase transition-colors duration-200 pb-2"
              [class.text-accent]="currentPage()?.slug === page.slug"
              [class.border-b]="currentPage()?.slug === page.slug"
              [class.border-accent]="currentPage()?.slug === page.slug"
              [class.text-text-secondary]="currentPage()?.slug !== page.slug"
              (click)="selectPage(page)"
            >{{ page.title }}</button>
          }
        </div>
      }

      @if (currentPage()) {
        <div>
          <h1 class="font-display text-2xl text-text-primary mb-8">{{ currentPage()!.title }}</h1>
          <div class="prose-axia" [innerHTML]="safeContent()"></div>
        </div>
      } @else if (pages().length === 0) {
        <p class="text-text-secondary text-sm">目前沒有規則頁面。</p>
      } @else {
        <p class="text-text-secondary text-sm">載入中...</p>
      }
    </div>
  `,
  styles: [`
    .prose-axia :is(p, li) { color: #6a6870; line-height: 1.8; margin-bottom: 1em; font-size: 0.875rem; }
    .prose-axia h2 { color: #c8a882; font-size: 1rem; font-family: Georgia, serif; letter-spacing: 0.1em; margin: 2em 0 0.75em; }
    .prose-axia ul { padding-left: 1.25rem; list-style-type: disc; }
  `]
})
export class RulesComponent implements OnInit {
  pages = signal<StaticPage[]>([]);
  currentPage = signal<StaticPage | null>(null);
  safeContent = signal<SafeHtml>('');

  constructor(
    private route: ActivatedRoute,
    private service: StaticPageService,
    private sanitizer: DomSanitizer,
  ) {}

  ngOnInit() {
    this.service.getAll().subscribe(data => {
      // 過濾掉 contact-info 這個 slug（那是 CONTACT 頁面用的）
      const rulesPages = data.filter(p => p.slug !== 'contact-info');
      this.pages.set(rulesPages);
      const slug = this.route.snapshot.paramMap.get('slug');
      const initial = slug
        ? rulesPages.find(p => p.slug === slug) ?? rulesPages[0]
        : rulesPages[0];
      if (initial) this.selectPage(initial);
    });
  }

  selectPage(page: StaticPage) {
    this.currentPage.set(page);
    this.safeContent.set(this.sanitizer.bypassSecurityTrustHtml(page.content_rich_text));
  }
}
