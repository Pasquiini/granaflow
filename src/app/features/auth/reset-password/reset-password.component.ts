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

  constructor(private fb: FormBuilder, private sb: SupabaseService, private router: Router) { }

  /**
   * ✅ Adicione este método na classe
   *  Ele será usado como validador do FormGroup.
   */
  passwordsMatch(group: FormGroup) {
    const pass = group.get('password')?.value;
    const confirm = group.get('confirm')?.value;
    return pass && confirm && pass === confirm ? null : { mismatch: true };
  }

  async ngOnInit() {
    try {
      // (opcional) ver, no console, a URL completa que chegou
      // console.log('href ->', window.location.href);

      const { error } = await this.sb.handleRecoveryFromUrl(window.location.href);
      if (error) throw error;

      this.form = this.fb.group(
        {
          password: ['', [Validators.required, Validators.minLength(8)]],
          confirm: ['', [Validators.required]],
        },
        { validators: this.passwordsMatch.bind(this) }
      );

      // (opcional) confirmar que a sessão existe
      // const sess = await this.sb.client.auth.getSession();
      // console.log('session ->', sess.data.session);

      this.ready = true;
    } catch (err: any) {
      this.errorMsg = err?.message ?? 'Link de recuperação inválido ou expirado.';
    } finally {
      this.loading = false;
    }
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
      setTimeout(() => this.router.navigateByUrl('/login'), 1500);
    } catch (err: any) {
      this.errorMsg = err?.message ?? 'Não foi possível alterar a senha.';
    } finally {
      this.loading = false;
    }
  }
}
