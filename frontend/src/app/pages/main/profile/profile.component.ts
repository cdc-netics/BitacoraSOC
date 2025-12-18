import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from '../../../services/auth.service';
import { ThemeService } from '../../../services/theme.service';
import { Theme } from '../../../models/user.model';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {
  profileForm!: FormGroup;
  passwordForm!: FormGroup;
  currentUser: any;
  isLoading = false;
  themes: Theme[] = ['light', 'dark', 'sepia', 'pastel'];

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private themeService: ThemeService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    this.initForms();
  }

  initForms(): void {
    this.profileForm = this.fb.group({
      fullName: [this.currentUser?.fullName || '', Validators.required],
      email: [this.currentUser?.email || '', [Validators.required, Validators.email]],
      theme: [this.themeService.getCurrentTheme(), Validators.required]
    });

    this.passwordForm = this.fb.group({
      currentPassword: ['', Validators.required],
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required]
    });
  }

  onThemeChange(theme: Theme): void {
    this.themeService.setTheme(theme);
  }

  saveProfile(): void {
    if (this.profileForm.invalid) return;
    
    this.isLoading = true;
    // TODO: Implementar actualización de perfil en backend
    setTimeout(() => {
      this.isLoading = false;
      this.snackBar.open('Perfil actualizado', 'Cerrar', { duration: 3000 });
    }, 1000);
  }

  changePassword(): void {
    if (this.passwordForm.invalid) return;
    
    const { newPassword, confirmPassword } = this.passwordForm.value;
    if (newPassword !== confirmPassword) {
      this.snackBar.open('Las contraseñas no coinciden', 'Cerrar', { duration: 3000 });
      return;
    }

    this.isLoading = true;
    // TODO: Implementar cambio de contraseña en backend
    setTimeout(() => {
      this.isLoading = false;
      this.passwordForm.reset();
      this.snackBar.open('Contraseña actualizada', 'Cerrar', { duration: 3000 });
    }, 1000);
  }
}
