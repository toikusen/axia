import { CommonModule } from '@angular/common';
import { Component, forwardRef } from '@angular/core';
import { ControlValueAccessor, FormsModule, NG_VALUE_ACCESSOR } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';

interface JsonMapEntry {
  key: string;
  value: string;
}

@Component({
  selector: 'app-json-map-input',
  standalone: true,
  imports: [CommonModule, FormsModule, ButtonModule, InputTextModule],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => JsonMapInputComponent),
      multi: true,
    },
  ],
  template: `
    <div class="space-y-3">
      @for (entry of entries; track $index) {
        <div class="grid gap-3 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto]">
          <input
            pInputText
            class="admin-input"
            [disabled]="disabled"
            [(ngModel)]="entry.key"
            (ngModelChange)="emitChanges()"
            placeholder="名稱（如：instagram）"
          />
          <input
            pInputText
            class="admin-input"
            [disabled]="disabled"
            [(ngModel)]="entry.value"
            (ngModelChange)="emitChanges()"
            placeholder="連結 URL"
          />
          <button
            pButton
            type="button"
            severity="secondary"
            icon="pi pi-trash"
            [disabled]="disabled"
            (click)="removeEntry($index)"
          ></button>
        </div>
      }

      <button
        pButton
        type="button"
        severity="secondary"
        icon="pi pi-plus"
        label="新增連結"
        [disabled]="disabled"
        (click)="addEntry()"
      ></button>
    </div>
  `,
})
export class JsonMapInputComponent implements ControlValueAccessor {
  protected entries: JsonMapEntry[] = [{ key: '', value: '' }];
  protected disabled = false;

  private onChange: (value: Record<string, string>) => void = () => undefined;
  private onTouched: () => void = () => undefined;

  writeValue(value: Record<string, string> | null): void {
    const entries = Object.entries(value ?? {}).map(([key, entryValue]) => ({
      key,
      value: entryValue,
    }));

    this.entries = entries.length > 0 ? entries : [{ key: '', value: '' }];
  }

  registerOnChange(fn: (value: Record<string, string>) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  protected addEntry(): void {
    this.entries = [...this.entries, { key: '', value: '' }];
    this.emitChanges();
  }

  protected removeEntry(index: number): void {
    const nextEntries = this.entries.filter((_, entryIndex) => entryIndex !== index);
    this.entries = nextEntries.length > 0 ? nextEntries : [{ key: '', value: '' }];
    this.emitChanges();
  }

  protected emitChanges(): void {
    const value = Object.fromEntries(
      this.entries
        .map(entry => [entry.key.trim(), entry.value.trim()])
        .filter(([key, entryValue]) => key.length > 0 || entryValue.length > 0)
    );

    this.onTouched();
    this.onChange(value);
  }
}
