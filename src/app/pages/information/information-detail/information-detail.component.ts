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
          <h1 class="font-display text-3xl md:text-4xl text-text-primary mb-8 leading-snug">{{ item()!.title }}</h1>
          @if (item()!.cover_image_url) {
            <img [src]="item()!.cover_image_url!" [alt]="item()!.title"
                 class="w-full max-h-96 object-contain bg-bg-secondary mb-8 border border-border" />
          }
          <div class="prose-axia prose-axia-light" [innerHTML]="safeContent()"></div>
        </article>
      } @else {
        <p class="text-text-secondary">載入中...</p>
      }
    </div>
  `,
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
