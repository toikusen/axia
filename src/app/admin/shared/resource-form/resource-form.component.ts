import { CommonModule, NgClass } from '@angular/common';
import { Component, Injector, OnInit, computed, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { DatePickerModule } from 'primeng/datepicker';
import { EditorModule } from 'primeng/editor';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { TextareaModule } from 'primeng/textarea';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { MessageService } from 'primeng/api';
import { AdminFormField, AdminResourceKey } from '../admin.types';
import { markAllControlsTouched, tagsToInputValue } from '../admin.utils';
import { ImageUploadComponent } from '../image-upload/image-upload.component';
import { JsonMapInputComponent } from '../json-map-input/json-map-input.component';
import { getAdminResourceConfig } from '../resource-registry';

@Component({
  selector: 'app-resource-form',
  standalone: true,
  imports: [
    CommonModule,
    NgClass,
    ReactiveFormsModule,
    RouterModule,
    ButtonModule,
    DatePickerModule,
    EditorModule,
    InputTextModule,
    SelectModule,
    TextareaModule,
    ToggleSwitchModule,
    ImageUploadComponent,
    JsonMapInputComponent,
  ],
  template: `
    <section class="space-y-4">
      <div class="flex">
        <a
          pButton
          severity="secondary"
          [routerLink]="config().basePath"
          icon="pi pi-arrow-left"
          label="返回列表"
        ></a>
      </div>

      <form class="admin-panel p-6" [formGroup]="form" (ngSubmit)="save()">
        <div class="grid gap-6 md:grid-cols-2">
          @for (field of config().fields; track field.key) {
            <div
              [ngClass]="[
                field.span === 1 ? 'md:col-span-1' : 'md:col-span-2',
                field.type === 'toggle' ? 'flex items-center justify-between gap-4' : 'space-y-3'
              ]"
            >
              <label [for]="'field-' + field.key" class="block text-sm font-medium text-white/90">
                {{ field.label }}
                @if (field.required) {
                  <span class="text-accent" aria-hidden="true">*</span>
                  <span class="sr-only">（必填）</span>
                }
              </label>

              @switch (field.type) {
                @case ('text') {
                  <input
                    pInputText
                    class="admin-input"
                    [id]="'field-' + field.key"
                    [formControlName]="field.key"
                    [placeholder]="field.placeholder ?? ''"
                  />
                }
                @case ('textarea') {
                  <p-editor
                    [formControlName]="field.key"
                    [style]="{ height: (field.rows ?? 6) * 28 + 'px' }"
                    styleClass="w-full"
                  >
                    <ng-template pTemplate="header">
                      <span class="ql-formats">
                        <select class="ql-header">
                          <option value="1">H1</option>
                          <option value="2">H2</option>
                          <option value="3">H3</option>
                          <option selected>Normal</option>
                        </select>
                      </span>
                      <span class="ql-formats">
                        <button class="ql-bold" type="button"></button>
                        <button class="ql-italic" type="button"></button>
                        <button class="ql-underline" type="button"></button>
                        <button class="ql-strike" type="button"></button>
                      </span>
                      <span class="ql-formats">
                        <button class="ql-list" value="ordered" type="button"></button>
                        <button class="ql-list" value="bullet" type="button"></button>
                      </span>
                      <span class="ql-formats">
                        <button class="ql-blockquote" type="button"></button>
                        <button class="ql-link" type="button"></button>
                      </span>
                      <span class="ql-formats">
                        <select class="ql-align"></select>
                      </span>
                      <span class="ql-formats">
                        <button class="ql-clean" type="button"></button>
                      </span>
                    </ng-template>
                  </p-editor>
                }
                @case ('richtext') {
                  <p-editor
                    [formControlName]="field.key"
                    [style]="{ height: (field.rows ?? 6) * 28 + 'px' }"
                    styleClass="w-full"
                  >
                    <ng-template pTemplate="header">
                      <span class="ql-formats">
                        <select class="ql-header">
                          <option value="1">H1</option>
                          <option value="2">H2</option>
                          <option value="3">H3</option>
                          <option selected>Normal</option>
                        </select>
                      </span>
                      <span class="ql-formats">
                        <button class="ql-bold" type="button"></button>
                        <button class="ql-italic" type="button"></button>
                        <button class="ql-underline" type="button"></button>
                        <button class="ql-strike" type="button"></button>
                      </span>
                      <span class="ql-formats">
                        <button class="ql-list" value="ordered" type="button"></button>
                        <button class="ql-list" value="bullet" type="button"></button>
                      </span>
                      <span class="ql-formats">
                        <button class="ql-blockquote" type="button"></button>
                        <button class="ql-link" type="button"></button>
                      </span>
                      <span class="ql-formats">
                        <select class="ql-align"></select>
                      </span>
                      <span class="ql-formats">
                        <button class="ql-clean" type="button"></button>
                      </span>
                    </ng-template>
                  </p-editor>
                }
                @case ('image') {
                  <app-image-upload
                    [imageUrl]="stringValue(field.key)"
                    [uploadFolder]="field.uploadFolder ?? 'misc'"
                    (imageUrlChange)="updateImage(field.key, $event)"
                  />
                }
                @case ('datetime') {
                  <p-datepicker
                    appendTo="body"
                    [formControlName]="field.key"
                    [showIcon]="true"
                    [showTime]="true"
                    hourFormat="24"
                    styleClass="w-full"
                    inputStyleClass="w-full"
                  ></p-datepicker>
                }
                @case ('date') {
                  <p-datepicker
                    appendTo="body"
                    [formControlName]="field.key"
                    [showIcon]="true"
                    styleClass="w-full"
                    inputStyleClass="w-full"
                  ></p-datepicker>
                }
                @case ('select') {
                  <p-select
                    [options]="field.options ?? []"
                    optionLabel="label"
                    optionValue="value"
                    [formControlName]="field.key"
                    appendTo="body"
                    styleClass="w-full"
                  ></p-select>
                }
                @case ('toggle') {
                  <p-toggleswitch [formControlName]="field.key"></p-toggleswitch>
                }
                @case ('number') {
                  <input
                    pInputText
                    type="number"
                    class="admin-input"
                    [formControlName]="field.key"
                    [attr.step]="field.step ?? '1'"
                  />
                }
                @case ('color') {
                  <div class="flex items-center gap-3">
                    <input
                      type="color"
                      class="h-10 w-14 cursor-pointer rounded border border-accent/20 bg-transparent"
                      [value]="stringValue(field.key)"
                      (input)="updateColor(field.key, $event)"
                    />
                    <input
                      pInputText
                      class="admin-input"
                      [formControlName]="field.key"
                    />
                  </div>
                }
                @case ('tags') {
                  <input
                    pInputText
                    class="admin-input"
                    [value]="tagValue(field.key)"
                    [placeholder]="field.placeholder ?? ''"
                    (input)="updateTags(field.key, $event)"
                  />
                }
                @case ('json') {
                  <app-json-map-input [formControlName]="field.key"></app-json-map-input>
                }
              }

              @if (field.description) {
                <p class="text-xs text-white/45">{{ field.description }}</p>
              }

              @if (isInvalid(field)) {
                <p class="text-xs text-red-300" role="alert">{{ field.label }} 為必填欄位。</p>
              }
            </div>
          }
        </div>

        @if (errorMessage()) {
          <p class="mt-6 text-sm text-red-300" role="alert" aria-live="assertive">{{ errorMessage() }}</p>
        }

        <div class="mt-8 flex flex-wrap gap-3">
          <button
            pButton
            type="submit"
            [disabled]="submitting()"
            icon="pi pi-save"
            [label]="submitting() ? '儲存中…' : '儲存'"
          ></button>
          <a
            pButton
            severity="secondary"
            [routerLink]="config().basePath"
            label="取消"
          ></a>
        </div>
      </form>
    </section>
  `,
})
export class ResourceFormComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly injector = inject(Injector);
  private readonly messageService = inject(MessageService);
  private readonly resourceKey = this.route.snapshot.data['resourceKey'] as AdminResourceKey;
  private readonly recordId = this.route.snapshot.paramMap.get('id');

  protected readonly config = computed(() => getAdminResourceConfig(this.resourceKey));
  protected readonly isEditMode = signal(Boolean(this.recordId));
  protected readonly submitting = signal(false);
  protected readonly errorMessage = signal('');
  protected readonly form = new FormGroup({});

  async ngOnInit(): Promise<void> {
    this.buildForm();

    if (this.recordId) {
      try {
        const record = await this.config().loadOne(this.injector, this.recordId);
        this.form.patchValue(this.config().toFormValue(record));
      } catch (error) {
        this.errorMessage.set(error instanceof Error ? error.message : '資料載入失敗。');
      }
      return;
    }

    this.form.patchValue(this.config().emptyValue());
  }

  protected isInvalid(field: AdminFormField): boolean {
    const control = this.form.get(field.key);
    return Boolean(field.required && control && control.invalid && control.touched);
  }

  protected stringValue(fieldKey: string): string {
    return String(this.form.get(fieldKey)?.value ?? '');
  }

  protected tagValue(fieldKey: string): string {
    return tagsToInputValue(this.form.get(fieldKey)?.value);
  }

  protected updateImage(fieldKey: string, imageUrl: string): void {
    this.form.get(fieldKey)?.setValue(imageUrl);
    this.form.get(fieldKey)?.markAsDirty();
  }

  protected updateColor(fieldKey: string, event: Event): void {
    const input = event.target as HTMLInputElement;
    this.form.get(fieldKey)?.setValue(input.value);
    this.form.get(fieldKey)?.markAsDirty();
  }

  protected updateTags(fieldKey: string, event: Event): void {
    const input = event.target as HTMLInputElement;
    this.form.get(fieldKey)?.setValue(input.value);
    this.form.get(fieldKey)?.markAsDirty();
  }

  protected async save(): Promise<void> {
    if (this.form.invalid) {
      markAllControlsTouched(this.form);
      return;
    }

    this.submitting.set(true);
    this.errorMessage.set('');

    try {
      const payload = this.config().fromFormValue(this.form.getRawValue());

      if (this.recordId) {
        await this.config().update(this.injector, this.recordId, payload);
      } else {
        await this.config().create(this.injector, payload);
      }

      this.messageService.add({
        severity: 'success',
        summary: '儲存成功',
        detail: `${this.config().singularLabel} 已儲存。`,
      });

      await this.router.navigate([this.config().basePath]);
    } catch (error) {
      this.errorMessage.set(error instanceof Error ? error.message : '儲存失敗。');
    } finally {
      this.submitting.set(false);
    }
  }

  private buildForm(): void {
    for (const field of this.config().fields) {
      const validators = field.required ? [Validators.required] : [];
      this.form.addControl(field.key, new FormControl(null, { nonNullable: false, validators }));
    }
  }
}
