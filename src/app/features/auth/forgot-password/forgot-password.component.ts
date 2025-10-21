// src/app/pages/forgot-password/forgot-password.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { SupabaseService } from '../../../core/services/supabase.service';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './forgot-password.component.html',
  styles: [``],
})
export class ForgotPasswordComponent {
  loading = false;
  sent = false;
  errorMsg = '';
  form: FormGroup;

  constructor(private fb: FormBuilder, private sb: SupabaseService) {
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
    });
  }

  async submit() {
    this.errorMsg = '';
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.loading = true;
    try {
      const email = (this.form.value.email as string).trim();
      const { error } = await this.sb.sendResetPasswordEmail(
        email,
        `${window.location.origin}/reset-password`
      );
      if (error) throw error;
      this.sent = true;
    } catch (err: any) {
      this.errorMsg = err?.message ?? 'Erro ao enviar e-mail de recuperação.';
    } finally {
      this.loading = false;
    }
  }
}
