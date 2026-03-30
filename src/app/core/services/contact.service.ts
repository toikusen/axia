import { Injectable } from '@angular/core';
import { from, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { supabase } from '../supabase.client';

export interface ContactForm {
  name: string;
  email: string;
  message: string;
}

@Injectable({ providedIn: 'root' })
export class ContactService {
  submit(form: ContactForm): Observable<void> {
    return from(
      supabase.from('contact_submission').insert(form)
    ).pipe(map(({ error }) => {
      if (error) throw error;
    }));
  }
}
