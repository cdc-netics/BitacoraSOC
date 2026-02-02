import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { ThemeService } from './services/theme.service';
import { ConfigService } from './services/config.service';
import { environment } from '../environments/environment';
import { RouterOutlet } from '@angular/router';

@Component({
    selector: 'app-root',
    template: '<router-outlet></router-outlet>',
    styles: [],
    standalone: true,
    imports: [RouterOutlet]
})
export class AppComponent implements OnInit {
  private backendBaseUrl = environment.backendBaseUrl;

  constructor(
    private themeService: ThemeService,
    private configService: ConfigService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    // El tema se aplica automáticamente en el constructor del servicio
  }

  ngOnInit(): void {
    // Cargar y actualizar favicon dinámicamente
    if (isPlatformBrowser(this.platformId)) {
      this.configService.getLogo().subscribe({
        next: (response) => {
          if (response.logoUrl) {
            const fullUrl = this.getAssetUrl(response.logoUrl);
            this.updateFavicon(fullUrl);
          }
        },
        error: () => {
          // Si hay error, mantener el favicon por defecto
        }
      });
    }
  }

  private getAssetUrl(url: string): string {
    if (!url) return '';
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }
    return `${this.backendBaseUrl}${url}`;
  }

  private updateFavicon(iconUrl: string): void {
    const link: HTMLLinkElement = document.querySelector("link[rel*='icon']") || document.createElement('link');
    link.type = 'image/x-icon';
    link.rel = 'icon';
    link.href = iconUrl;
    document.getElementsByTagName('head')[0].appendChild(link);
  }
}
