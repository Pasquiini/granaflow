// pages/reset-password/reset-password.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { SupabaseService } from '../../../core/services/supabase.service';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './reset-password.component.html',
})
export class ResetPasswordComponent implements OnInit {
  form!: FormGroup;
  loading = true;
  ready = false;
  errorMsg = '';
  successMsg = '';

  constructor(private fb: FormBuilder, private sb: SupabaseService, private router: Router) {}

  async ngOnInit() {
    try {
      const { error } = await this.sb.handleRecoveryFromUrl(window.location.href);
      if (error) throw error;

      this.form = this.fb.group(
        {
          password: ['', [Validators.required, Validators.minLength(8)]],
          confirm: ['', [Validators.required]],
        },
        { validators: (g: FormGroup) =>
            g.get('password')!.value === g.get('confirm')!.value ? null : { mismatch: true } }
      );

      this.ready = true; // só fica true se veio de um link válido
    } catch (err: any) {
      this.errorMsg = err?.message ?? 'Link de recuperação inválido ou expirado.';
    } finally {
      this.loading = false;
    }
  }

  async submit() {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.loading = true;
    try {
      const pass = this.form.value.password;
      const { error } = await this.sb.updatePassword(pass);
      if (error) throw error;
      this.successMsg = 'Senha alterada com sucesso! Você já pode fazer login.';
      setTimeout(() => this.router.navigateByUrl('/login'), 1200);
    } catch (err: any) {
      this.errorMsg = err?.message ?? 'Não foi possível alterar a senha.';
    } finally {
      this.loading = false;
    }
  }
}
