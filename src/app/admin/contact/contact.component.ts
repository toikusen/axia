import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { TabsModule } from 'primeng/tabs';
import { TextareaModule } from 'primeng/textarea';
import { TableModule } from 'primeng/table';
import { ContactSubmission } from '../../core/models/contact-submission.model';
import { StaticPage } from '../../core/models/static-page.model';
import { ContactService } from '../../core/services/contact.service';
import { StaticPageService } from '../../core/services/static-page.service';
import { formatDateLabel } from '../shared/admin.utils';

@Component({
  selector: 'app-contact-admin',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ButtonModule, TabsModule, TextareaModule, TableModule],
  template: `
    <section class="space-y-6">
      <header>
        <p class="text-xs uppercase tracking-[0.3em] text-[#c8a882]">Contact</p>
        <h1 class="mt-2 text-3xl font-semibold text-white">聯絡資訊與表單留言</h1>
      </header>

      <p-tabs value="info">
        <p-tablist>
          <p-tab value="info">聯絡資訊</p-tab>
          <p-tab value="messages">表單留言</p-tab>
        </p-tablist>
        <p-tabpanels>
          <p-tabpanel value="info">
            <form class="admin-panel p-6" [formGroup]="form" (ngSubmit)="saveContactInfo()">
              <label class="block text-sm font-medium text-white/90">內容</label>
              <textarea
                pTextarea
                class="admin-textarea mt-3 font-mono"
                rows="14"
                formControlName="content_rich_text"
              ></textarea>

              @if (errorMessage()) {
                <p class="mt-4 text-sm text-red-300">{{ errorMessage() }}</p>
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
            <div class="admin-panel overflow-hidden">
              <p-table [value]="messages()" styleClass="admin-data-table" dataKey="id">
                <ng-template pTemplate="header">
                  <tr>
                    <th>姓名</th>
                    <th>Email</th>
                    <th>留言</th>
                    <th>時間</th>
                  </tr>
                </ng-template>
                <ng-template pTemplate="body" let-item>
                  <tr>
                    <td>{{ item.name }}</td>
                    <td>{{ item.email }}</td>
                    <td class="max-w-xl whitespace-pre-wrap">{{ item.message }}</td>
                    <td>{{ formatLabel(item.submitted_at) }}</td>
                  </tr>
                </ng-template>
              </p-table>
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
