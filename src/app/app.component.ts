import { Component } from '@angular/core';
import { Router, NavigationEnd, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs/operators';

declare global {
  interface Window { gtag?: (...args: any[]) => void; }
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  template: `<router-outlet></router-outlet>`,
})
export class AppComponent {
  constructor(private router: Router) {
    // Envia page_view a cada navegação bem-sucedida
    this.router.events
      .pipe(filter((e): e is NavigationEnd => e instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        // Evita hits em dev/local; ajuste conforme sua lógica
        const host = location.hostname;
        const isProd =
          host.endsWith('granaflow.app') ||
          host.endsWith('vercel.app');

        if (!isProd) return;

        window.gtag?.('event', 'page_view', {
          page_title: document.title,
          page_location: window.location.href,
          page_path: event.urlAfterRedirects,
        });
      });
  }
}
