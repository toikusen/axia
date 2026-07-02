import { Component, OnInit, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { UpperCasePipe } from '@angular/common';
import { MemberService } from '../../../core/services/member.service';
import { Member } from '../../../core/models/member.model';

@Component({
  selector: 'app-member-detail',
  standalone: true,
  imports: [RouterLink, UpperCasePipe],
  template: `
    <div class="min-h-screen">
      @if (member()) {
        <div class="relative h-[70vh] overflow-hidden">
          @if (member()!.photo_url) {
            <img [src]="member()!.photo_url!" [alt]="member()!.name"
                 class="w-full h-full object-cover object-top" />
          } @else {
            <div class="w-full h-full bg-bg-secondary flex items-center justify-center">
              <span class="font-display text-8xl text-text-secondary">{{ member()!.name[0] }}</span>
            </div>
          }
          <div class="absolute inset-0 bg-gradient-to-t from-bg via-transparent to-transparent"></div>
          <div class="absolute bottom-0 left-0 right-0 h-1"
               [style.background-color]="member()!.color_hex"></div>
        </div>
        <div class="max-w-2xl mx-auto px-6 py-12">
          <a routerLink="/member" class="nav-link text-xs block mb-8">← MEMBER</a>
          <h1 class="font-display text-3xl md:text-4xl text-text-primary tracking-wider break-words mb-6">{{ member()!.name }}</h1>
          <div class="w-8 h-px mb-8" [style.background-color]="member()!.color_hex"></div>
          <p class="text-text-primary/90 leading-relaxed mb-10">{{ member()!.bio }}</p>
          @if (snsEntries().length > 0) {
            <div class="flex gap-4 flex-wrap">
              @for (sns of snsEntries(); track sns.platform) {
                @if (sns.url) {
                  <a [href]="sns.url" target="_blank" rel="noopener"
                     class="nav-link text-xs border border-border px-4 py-2 hover:border-accent">
                    {{ sns.platform | uppercase }}
                  </a>
                }
              }
            </div>
          }
        </div>
      } @else {
        <div class="flex items-center justify-center min-h-screen">
          <p class="text-text-secondary">載入中...</p>
        </div>
      }
    </div>
  `,
})
export class MemberDetailComponent implements OnInit {
  member = signal<Member | null>(null);
  snsEntries = signal<{ platform: string; url: string }[]>([]);
  constructor(private route: ActivatedRoute, private service: MemberService, private title: Title) {}
  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id')!;
    this.service.getById(id).subscribe(data => {
      this.member.set(data);
      this.title.setTitle(`${data.name}｜成員介紹｜AXIA`);
      this.snsEntries.set(
        Object.entries(data.sns_links).map(([platform, url]) => ({ platform, url }))
      );
    });
  }
}
