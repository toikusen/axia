import { Component, OnInit, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { InformationService } from '../../../core/services/information.service';
import { Information } from '../../../core/models/information.model';

@Component({
  selector: 'app-information-detail',
  standalone: true,
  imports: [RouterLink, DatePipe],
  template: `
    <div class="max-w-3xl mx-auto px-6 py-16 min-h-screen">
      <a routerLink="/information" class="nav-link text-xs block mb-12">← BACK TO INFORMATION</a>
      @if (item()) {
        <article>
          <div class="mb-2">
            <span class="text-text-secondary text-xs font-mono">
              {{ item()!.published_at | date:'yyyy.MM.dd' }}
            </span>
          </div>
          @if (item()!.tags.length > 0) {
            <div class="flex gap-2 mb-4 flex-wrap">
              @for (tag of item()!.tags; track tag) {
                <span class="text-xs text-accent border border-accent px-2 py-0.5">{{ tag }}</span>
              }
            </div>
          }
          <h1 class="text-2xl text-text-primary font-display mb-8 leading-snug">{{ item()!.title }}</h1>
          @if (item()!.cover_image_url) {
            <img [src]="item()!.cover_image_url!" [alt]="item()!.title"
                 class="w-full max-h-96 object-cover mb-8 border border-border" />
          }
          <div class="prose-axia" [innerHTML]="safeContent()"></div>
        </article>
      } @else {
        <p class="text-text-secondary">載入中...</p>
      }
    </div>
  `,
  styles: [`
    .prose-axia :is(p, li) { color: #ddd8cf; line-height: 1.8; margin-bottom: 1em; font-size: 0.9rem; }
    .prose-axia h2 { color: #c8a882; font-size: 1.1rem; font-family: Georgia, serif; letter-spacing: 0.1em; margin: 2em 0 0.75em; }
    .prose-axia a { color: #c8a882; text-decoration: underline; }
    .prose-axia img { max-width: 100%; }
    .prose-axia ul { padding-left: 1.25rem; list-style-type: disc; }
  `]
})
export class InformationDetailComponent implements OnInit {
  item = signal<Information | null>(null);
  safeContent = signal<SafeHtml>('');
  constructor(
    private route: ActivatedRoute,
    private service: InformationService,
    private sanitizer: DomSanitizer,
  ) {}
  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id')!;
    this.service.getById(id).subscribe(data => {
      this.item.set(data);
      this.safeContent.set(this.sanitizer.bypassSecurityTrustHtml(data.content_rich_text));
    });
  }
}
