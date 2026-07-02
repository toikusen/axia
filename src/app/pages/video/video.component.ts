import { Component, OnInit, signal } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { VideoService } from '../../core/services/video.service';
import { Video, getYoutubeThumbnail, getYoutubeEmbedUrl } from '../../core/models/video.model';

@Component({
  selector: 'app-video',
  standalone: true,
  template: `
    <div class="max-w-6xl mx-auto px-6 py-16 min-h-screen">
      <div class="mb-12">
        <span class="section-label block mb-3">VIDEO</span>
        <div class="w-8 h-px bg-accent"></div>
      </div>

      @if (featured()) {
        <div class="mb-12">
          <div class="aspect-video w-full bg-bg-secondary border border-border overflow-hidden">
            @if (featuredPlaying()) {
              <iframe
                [src]="featuredEmbedUrl()"
                [title]="featured()!.title"
                class="w-full h-full"
                frameborder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowfullscreen
              ></iframe>
            } @else {
              <!-- Facade: YouTube player (~1MB of JS) only loads after a click -->
              <button type="button" class="group relative w-full h-full cursor-pointer" (click)="playFeatured()"
                      [attr.aria-label]="'播放 ' + featured()!.title">
                <img
                  [src]="getThumbnail(featured()!)"
                  [alt]="featured()!.title"
                  fetchpriority="high"
                  class="w-full h-full object-cover"
                />
                <div class="absolute inset-0 flex items-center justify-center bg-bg/40">
                  <div class="w-16 h-16 rounded-full border-2 border-accent flex items-center justify-center
                              group-hover:scale-110 transition-transform duration-200">
                    <span class="text-accent ml-1 text-2xl">▶</span>
                  </div>
                </div>
              </button>
            }
          </div>
          <p class="text-text-primary mt-4 text-sm">{{ featured()!.title }}</p>
        </div>
      }

      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        @for (video of others(); track video.id) {
          <button type="button" class="group cursor-pointer text-left w-full" (click)="selectVideo(video)">
            <div class="aspect-video bg-bg-secondary border border-border overflow-hidden relative">
              <img loading="lazy"
                [src]="getThumbnail(video)"
                [alt]="video.title"
                class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div class="absolute inset-0 flex items-center justify-center bg-bg/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <div class="w-12 h-12 rounded-full border-2 border-accent flex items-center justify-center">
                  <span class="text-accent ml-1 text-lg">▶</span>
                </div>
              </div>
            </div>
            <p class="text-text-secondary text-sm mt-2 group-hover:text-accent transition-colors duration-200">{{ video.title }}</p>
          </button>
        }
      </div>

      @if (videos().length === 0) {
        <p class="text-text-secondary text-sm">目前沒有影片。</p>
      }
    </div>
  `,
})
export class VideoComponent implements OnInit {
  videos = signal<Video[]>([]);
  featured = signal<Video | null>(null);
  others = signal<Video[]>([]);
  featuredEmbedUrl = signal<SafeResourceUrl>('');
  featuredPlaying = signal(false);

  constructor(private service: VideoService, private sanitizer: DomSanitizer) {}

  ngOnInit() {
    this.service.getAll().subscribe(data => {
      this.videos.set(data);
      const feat = data.find(v => v.is_featured) ?? data[0] ?? null;
      this.featured.set(feat);
      this.others.set(feat ? data.filter(v => v.id !== feat.id) : data);
    });
  }

  getThumbnail(video: Video): string {
    return video.thumbnail_url ?? getYoutubeThumbnail(video.youtube_url);
  }

  playFeatured() {
    const feat = this.featured();
    if (!feat) return;
    this.featuredEmbedUrl.set(
      this.sanitizer.bypassSecurityTrustResourceUrl(`${getYoutubeEmbedUrl(feat.youtube_url)}?autoplay=1`)
    );
    this.featuredPlaying.set(true);
  }

  selectVideo(video: Video) {
    this.featured.set(video);
    this.others.set(this.videos().filter(v => v.id !== video.id));
    this.playFeatured();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}
