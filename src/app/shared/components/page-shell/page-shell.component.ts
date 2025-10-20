import { Component, signal } from '@angular/core';
import { NavbarComponent } from '../navbar/navbar.component';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-page-shell',
  standalone: true,
  imports: [NavbarComponent, SidebarComponent, RouterOutlet],
  template: `
    <app-navbar [onToggleSidebar]="toggleSidebar"></app-navbar>

    <div class="mx-auto grid max-w-7xl grid-cols-1 lg:grid-cols-[18rem,1fr]">
      <app-sidebar
        class="lg:block"
        [open]="sidebarOpen()"
        [onClose]="closeSidebar">
      </app-sidebar>

      <main class="min-h-[calc(100dvh-56px)] bg-brand-bg/60">
        <div class="p-4 lg:p-6">
          <router-outlet></router-outlet>
        </div>
      </main>
    </div>
  `,
})
export class PageShellComponent {
  sidebarOpen = signal(false);
  toggleSidebar = () => this.sidebarOpen.update(v => !v);
  closeSidebar = () => this.sidebarOpen.set(false);
}
