import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from '../../../services/auth.service';
import { ThemeService } from '../../../services/theme.service';
import { Theme } from '../../../models/user.model';
import { UserService } from '../../../services/user.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {
  profileForm!: FormGroup;
  passwordForm!: FormGroup;
  currentUser: any;
  isSavingProfile = false;
  isChangingPassword = false;
  themes: Theme[] = ['light', 'dark', 'sepia', 'pastel'];

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private themeService: ThemeService,
    private userService: UserService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    this.initForms();
    this.loadProfile();
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

  private loadProfile(): void {
    this.userService.getProfile().subscribe({
      next: (user) => {
        this.currentUser = user;
        this.profileForm.patchValue({
          fullName: user.fullName,
          email: user.email,
          theme: user.theme || this.themeService.getCurrentTheme()
        });
        if (user.theme) {
          this.themeService.setTheme(user.theme);
        }
        this.authService.updateCurrentUser(user);
      },
      error: (err) => {
        console.error('Error loading profile:', err);
        this.snackBar.open(err.error?.message || 'No se pudo cargar el perfil', 'Cerrar', { duration: 3000 });
      }
    });
  }

  saveProfile(): void {
    if (this.profileForm.invalid) return;

    this.isSavingProfile = true;
    this.userService.updateProfile(this.profileForm.value).subscribe({
      next: (response) => {
        const updatedUser = response.user;
        this.currentUser = updatedUser;
        this.authService.updateCurrentUser(updatedUser);
        this.themeService.setTheme(updatedUser.theme || this.profileForm.value.theme);
        this.snackBar.open('Perfil actualizado', 'Cerrar', { duration: 3000 });
      },
      error: (err) => {
        console.error('Error saving profile:', err);
        this.snackBar.open(err.error?.message || 'No se pudo actualizar el perfil', 'Cerrar', { duration: 3000 });
      },
      complete: () => {
        this.isSavingProfile = false;
      }
    });
  }

  changePassword(): void {
    if (this.passwordForm.invalid) return;

    const { currentPassword, newPassword, confirmPassword } = this.passwordForm.value;
    if (newPassword !== confirmPassword) {
      this.snackBar.open('Las contraseñas no coinciden', 'Cerrar', { duration: 3000 });
      return;
    }

    this.isChangingPassword = true;
    this.userService.updateProfile({ currentPassword, newPassword }).subscribe({
      next: () => {
        this.passwordForm.reset();
        this.snackBar.open('Contraseña actualizada', 'Cerrar', { duration: 3000 });
      },
      error: (err) => {
        console.error('Error changing password:', err);
        this.snackBar.open(err.error?.message || 'No se pudo cambiar la contraseña', 'Cerrar', { duration: 3000 });
      },
      complete: () => {
        this.isChangingPassword = false;
      }
    });
  }
}

