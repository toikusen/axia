import { Injectable } from '@angular/core';
import { from, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ContactSubmission } from '../models/contact-submission.model';
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

  async listAll(): Promise<ContactSubmission[]> {
    const { data, error } = await supabase
      .from('contact_submission')
      .select('*')
      .order('submitted_at', { ascending: false });

    if (error) {
      throw error;
    }

    return data as ContactSubmission[];
  }

  async count(): Promise<number> {
    const { count, error } = await supabase
      .from('contact_submission')
      .select('*', { count: 'exact', head: true });

    if (error) {
      throw error;
    }

    return count ?? 0;
  }
}
