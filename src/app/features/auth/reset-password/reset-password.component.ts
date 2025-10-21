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
  styles: [``],
})
export class ResetPasswordComponent implements OnInit {
  form!: FormGroup;
  loading = true;
  ready = false;
  successMsg = '';
  errorMsg = '';

  constructor(
    private fb: FormBuilder,
    private sb: SupabaseService,
    private router: Router
  ) {}

  async ngOnInit() {
    try {
      const { error } = await this.sb.exchangeCodeFromUrl(window.location.href);
      if (error) throw error;

      this.form = this.fb.group(
        {
          password: ['', [Validators.required, Validators.minLength(8)]],
          confirm: ['', [Validators.required]],
        },
        { validators: this.passwordsMatch }
      );

      this.ready = true;
    } catch (err: any) {
      this.errorMsg = err?.message ?? 'Link de recuperação inválido ou expirado.';
    } finally {
      this.loading = false;
    }
  }

  passwordsMatch(group: FormGroup) {
    const p = group.get('password')?.value;
    const c = group.get('confirm')?.value;
    return p && c && p === c ? null : { mismatch: true };
  }

  async submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.loading = true;
    try {
      const pass = this.form.value.password;
      const { error } = await this.sb.updatePassword(pass);
      if (error) throw error;
      this.successMsg = 'Senha alterada com sucesso! Você já pode fazer login.';
      setTimeout(() => this.router.navigateByUrl('/login'), 2000);
    } catch (err: any) {
      this.errorMsg = err?.message ?? 'Não foi possível alterar a senha.';
    } finally {
      this.loading = false;
    }
  }
}
