import { Component, computed } from '@angular/core';
import { PageShellComponent } from './shared/components/page-shell/page-shell.component';
import { AuthService } from './core/services/auth.service';
import { NgIf } from '@angular/common';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  template: `<router-outlet></router-outlet>`,
})
export class AppComponent {
  constructor(public auth: AuthService) {}
}
