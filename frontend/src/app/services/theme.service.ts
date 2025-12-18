/**
 * Servicio de Temas (Theming)
 * 
 * Funcionalidad:
 *   - Gestionar tema visual de la aplicación (light, dark, sepia, pastel)
 *   - Persistir preferencia en localStorage
 *   - Observable para cambios reactivos en UI
 * 
 * Temas SOC:
 *   - light: Tema claro (default)
 *   - dark: Tema oscuro (reducir fatiga visual en turnos nocturnos)
 *   - sepia: Tono cálido (reduce luz azul)
 *   - pastel: Colores suaves (alternativa visual)
 * 
 * Implementación:
 *   - setTheme(): cambia tema + guarda en localStorage + aplica CSS
 *   - applyTheme(): modifica atributo data-theme en <html>
 *   - currentTheme$: observable para componentes que reaccionan a cambios
 * 
 * Uso:
 *   - Usuario cambia tema en settings o header
 *   - Se persiste entre sesiones (localStorage)
 *   - CSS usa [data-theme='dark'] para estilos condicionales
 */
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Theme } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private readonly THEME_KEY = 'bitacora_theme';
  private currentThemeSubject = new BehaviorSubject<Theme>(this.getStoredTheme());
  public currentTheme$ = this.currentThemeSubject.asObservable();

  constructor() {
    this.applyTheme(this.getStoredTheme());
  }

  setTheme(theme: Theme): void {
    localStorage.setItem(this.THEME_KEY, theme);
    this.currentThemeSubject.next(theme);
    this.applyTheme(theme);
  }

  getCurrentTheme(): Theme {
    return this.currentThemeSubject.value;
  }

  private getStoredTheme(): Theme {
    const stored = localStorage.getItem(this.THEME_KEY);
    return (stored as Theme) || 'light';
  }

  private applyTheme(theme: Theme): void {
    document.documentElement.setAttribute('data-theme', theme);
  }
}
