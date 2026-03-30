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
            <iframe
              [src]="featuredEmbedUrl()"
              class="w-full h-full"
              frameborder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowfullscreen
            ></iframe>
          </div>
          <p class="text-text-primary mt-4 text-sm">{{ featured()!.title }}</p>
        </div>
      }

      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        @for (video of others(); track video.id) {
          <div class="group cursor-pointer" (click)="selectVideo(video)">
            <div class="aspect-video bg-bg-secondary border border-border overflow-hidden relative">
              <img
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
          </div>
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

  constructor(private service: VideoService, private sanitizer: DomSanitizer) {}

  ngOnInit() {
    this.service.getAll().subscribe(data => {
      this.videos.set(data);
      const feat = data.find(v => v.is_featured) ?? data[0] ?? null;
      this.featured.set(feat);
      this.others.set(feat ? data.filter(v => v.id !== feat.id) : data);
      if (feat) {
        this.featuredEmbedUrl.set(
          this.sanitizer.bypassSecurityTrustResourceUrl(getYoutubeEmbedUrl(feat.youtube_url))
        );
      }
    });
  }

  getThumbnail(video: Video): string {
    return video.thumbnail_url ?? getYoutubeThumbnail(video.youtube_url);
  }

  selectVideo(video: Video) {
    this.featured.set(video);
    this.others.set(this.videos().filter(v => v.id !== video.id));
    this.featuredEmbedUrl.set(
      this.sanitizer.bypassSecurityTrustResourceUrl(getYoutubeEmbedUrl(video.youtube_url))
    );
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}
