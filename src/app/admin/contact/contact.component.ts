import { CommonModule } from '@angular/common';
import { MessageService } from 'primeng/api';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { TabsModule } from 'primeng/tabs';
import { TableModule } from 'primeng/table';
import { EditorModule } from 'primeng/editor';
import { ContactSubmission } from '../../core/models/contact-submission.model';
import { StaticPage } from '../../core/models/static-page.model';
import { ContactService } from '../../core/services/contact.service';
import { StaticPageService } from '../../core/services/static-page.service';
import { formatDateLabel } from '../shared/admin.utils';

@Component({
  selector: 'app-contact-admin',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ButtonModule, TabsModule, TableModule, EditorModule],
  template: `
    <section class="space-y-4">
      <p-tabs value="info">
        <p-tablist>
          <p-tab value="info">聯絡資訊</p-tab>
          <p-tab value="messages">表單留言</p-tab>
        </p-tablist>
        <p-tabpanels>
          <p-tabpanel value="info">
            <form class="admin-panel p-6" [formGroup]="form" (ngSubmit)="saveContactInfo()">
              <label class="block text-sm font-medium text-white/90">內容</label>
              <div class="mt-3">
                <p-editor formControlName="content_rich_text" [style]="{ height: '280px' }" styleClass="w-full">
                  <ng-template pTemplate="header">
                    <span class="ql-formats">
                      <button class="ql-bold" type="button"></button>
                      <button class="ql-italic" type="button"></button>
                      <button class="ql-underline" type="button"></button>
                    </span>
                    <span class="ql-formats">
                      <button class="ql-list" value="ordered" type="button"></button>
                      <button class="ql-list" value="bullet" type="button"></button>
                    </span>
                    <span class="ql-formats">
                      <button class="ql-link" type="button"></button>
                    </span>
                  </ng-template>
                </p-editor>
              </div>
              <p class="mt-2 text-xs text-white/45">這段文字會直接顯示在官網「聯絡」頁，用工具列排版即可，不用輸入程式碼。</p>

              @if (errorMessage()) {
                <p class="mt-4 text-sm text-red-300" role="alert" aria-live="assertive">{{ errorMessage() }}</p>
              }

              <div class="mt-6">
                <button
                  pButton
                  type="submit"
                  icon="pi pi-save"
                  [disabled]="submitting() || form.invalid"
                  [label]="submitting() ? '儲存中…' : '儲存聯絡資訊'"
                ></button>
              </div>
            </form>
          </p-tabpanel>

          <p-tabpanel value="messages">
            <div class="admin-panel overflow-x-auto hidden lg:block">
              <p-table [value]="messages()" styleClass="admin-data-table" dataKey="id"
                       [tableStyle]="{ 'table-layout': 'fixed', width: '100%' }">
                <ng-template pTemplate="header">
                  <tr>
                    <th class="w-32">姓名</th>
                    <th class="w-56">Email</th>
                    <th>留言</th>
                    <th class="w-40">時間</th>
                  </tr>
                </ng-template>
                <ng-template pTemplate="body" let-item>
                  <tr>
                    <td>{{ item.name }}</td>
                    <td>{{ item.email }}</td>
                    <td class="px-4 py-3 align-top">
                      <p class="line-clamp-2 text-sm leading-relaxed text-white/80">{{ item.message }}</p>
                    </td>
                    <td>{{ formatLabel(item.submitted_at) }}</td>
                  </tr>
                </ng-template>
                <ng-template pTemplate="emptymessage">
                  <tr>
                    <td colspan="4" class="px-6 py-12 text-center text-sm text-white/55">目前沒有留言。</td>
                  </tr>
                </ng-template>
              </p-table>
            </div>

            <!-- 窄畫面：卡片堆疊 -->
            <div class="space-y-3 lg:hidden">
              @for (item of messages(); track item.id) {
                <div class="admin-panel p-4">
                  <div class="flex items-start justify-between gap-3">
                    <span class="font-medium text-sm text-white">{{ item.name }}</span>
                    <span class="shrink-0 text-xs text-white/45">{{ formatLabel(item.submitted_at) }}</span>
                  </div>
                  <p class="mt-1 text-xs text-white/55">{{ item.email }}</p>
                  <p class="mt-3 text-sm text-white/80 leading-relaxed">{{ item.message }}</p>
                </div>
              } @empty {
                <div class="admin-panel px-5 py-12 text-center text-sm text-white/55">目前沒有留言。</div>
              }
            </div>
          </p-tabpanel>
        </p-tabpanels>
      </p-tabs>
    </section>
  `,
})
export class ContactComponent implements OnInit {
  private readonly staticPageService = inject(StaticPageService);
  private readonly contactService = inject(ContactService);
  private readonly messageService = inject(MessageService);

  private contactPage: StaticPage | null = null;

  protected readonly submitting = signal(false);
  protected readonly errorMessage = signal('');
  protected readonly messages = signal<ContactSubmission[]>([]);
  protected readonly form = new FormGroup({
    content_rich_text: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
  });

  async ngOnInit(): Promise<void> {
    try {
      const [contactPage, messages] = await Promise.all([
        this.staticPageService.getOrCreateContactPage(),
        this.contactService.listAll(),
      ]);

      this.contactPage = contactPage;
      this.messages.set(messages);
      this.form.patchValue({ content_rich_text: contactPage.content_rich_text });
    } catch (error) {
      this.errorMessage.set(error instanceof Error ? error.message : '聯絡資料載入失敗。');
    }
  }

  protected async saveContactInfo(): Promise<void> {
    if (!this.contactPage) {
      return;
    }

    this.submitting.set(true);
    this.errorMessage.set('');

    try {
      this.contactPage = await this.staticPageService.update(this.contactPage.id, {
        content_rich_text: this.form.getRawValue().content_rich_text,
      });
      this.messageService.add({
        severity: 'success',
        summary: '儲存成功',
        detail: '聯絡資訊已更新。',
      });
    } catch (error) {
      this.errorMessage.set(error instanceof Error ? error.message : '聯絡資訊儲存失敗。');
    } finally {
      this.submitting.set(false);
    }
  }

  protected formatLabel(value: string): string {
    return formatDateLabel(value);
  }
}
