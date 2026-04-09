import { Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '../supabase.client';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly userSignal = signal<User | null>(null);
  readonly currentUser = this.userSignal.asReadonly();

  constructor(private readonly router: Router) {
    void this.hydrateUser();

    supabase.auth.onAuthStateChange((_event, session) => {
      this.userSignal.set(session?.user ?? null);
    });
  }

  async signIn(email: string, password: string): Promise<Session> {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      throw error;
    }

    this.userSignal.set(data.user);

    if (!data.session) {
      throw new Error('登入成功，但未取得有效 session。');
    }

    return data.session;
  }

  async signInWithGoogle(): Promise<void> {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/admin/login`,
      },
    });

    if (error) {
      throw error;
    }
  }

  async isAdminWhitelisted(): Promise<boolean> {
    const user = this.currentUser();
    if (!user?.email) return false;

    const { data } = await supabase
      .from('admin_whitelist')
      .select('email')
      .eq('email', user.email)
      .maybeSingle();

    return data !== null;
  }

  async signOut(): Promise<void> {
    const { error } = await supabase.auth.signOut();

    if (error) {
      throw error;
    }

    this.userSignal.set(null);
    await this.router.navigate(['/admin/login']);
  }

  async getSession(): Promise<Session | null> {
    const { data, error } = await supabase.auth.getSession();

    if (error) {
      throw error;
    }

    this.userSignal.set(data.session?.user ?? null);
    return data.session;
  }

  private async hydrateUser(): Promise<void> {
    const session = await this.getSession();
    this.userSignal.set(session?.user ?? null);
  }
}
