import { Component } from '@angular/core';
import { ThemeService } from './services/theme.service';

@Component({
  selector: 'app-root',
  template: '<router-outlet></router-outlet>',
  styles: []
})
export class AppComponent {
  constructor(private themeService: ThemeService) {
    // El tema se aplica automáticamente en el constructor del servicio
  }
}
