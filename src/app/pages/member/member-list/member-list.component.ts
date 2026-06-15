import { Component, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MemberService } from '../../../core/services/member.service';
import { Member } from '../../../core/models/member.model';

@Component({
  selector: 'app-member-list',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="max-w-5xl mx-auto px-6 py-16 min-h-screen">
      <div class="mb-12">
        <span class="section-label block mb-3">MEMBER</span>
        <div class="w-8 h-px bg-accent"></div>
      </div>
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
        @for (member of members(); track member.id) {
          <a [routerLink]="['/member', member.id]"
             class="group relative overflow-hidden border border-border hover:border-accent transition-all duration-300 block">
            <div class="aspect-[3/4] bg-bg-secondary overflow-hidden">
              @if (member.photo_url) {
                <img [src]="member.photo_url" [alt]="member.name"
                     class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              } @else {
                <div class="w-full h-full flex items-center justify-center">
                  <span class="text-text-secondary text-4xl font-display">{{ member.name[0] }}</span>
                </div>
              }
            </div>
            <div class="p-3 border-t" [style.border-color]="member.color_hex">
              <p class="text-text-primary text-sm font-display tracking-widest break-words">{{ member.name }}</p>
            </div>
          </a>
        }
      </div>
    </div>
  `,
})
export class MemberListComponent implements OnInit {
  members = signal<Member[]>([]);
  constructor(private service: MemberService) {}
  ngOnInit() { this.service.getAll().subscribe(data => this.members.set(data)); }
}
