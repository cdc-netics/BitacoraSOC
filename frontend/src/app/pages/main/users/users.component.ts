/**
 * Componente de Gestión de Usuarios (Admin)
 * 
 * Funcionalidad:
 *   - Listar todos los usuarios (tabla Material)
 *   - Crear usuarios (admin/user/guest)
 *   - Editar usuarios (fullName, email, phone, role)
 *   - Activar/Desactivar usuarios (isActive)
 *   - Eliminar usuarios (con confirmación)
 * 
 * Campos formulario:
 *   - username: min 3 chars, único (no editable)
 *   - password: min 6 chars, hasheado en backend (solo en creación)
 *   - fullName: nombre completo
 *   - email: validación email
 *   - phone: opcional
 *   - role: admin | user | guest (default user)
 * 
 * Reglas SOC:
 *   - Solo admin accede (protegido por AdminGuard)
 *   - Guests: expiresAt calculado según AppConfig.guestMaxDurationDays
 *   - No se puede eliminar el propio usuario (evitar lockout)
 *   - Desactivar usuario en lugar de eliminar (soft delete)
 * 
 * Tabla:
 *   - Columnas: username, fullName, email, phone, role, isActive, actions
 *   - Actions: editar, activar/desactivar, eliminar
 */
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { UserService } from '../../../services/user.service';
import { User, CreateUserRequest } from '../../../models/user.model';
import { MatCard, MatCardHeader, MatCardTitle, MatCardContent } from '@angular/material/card';
import { MatFormField, MatLabel, MatHint } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { NgIf } from '@angular/common';
import { MatSelect } from '@angular/material/select';
import { MatOption } from '@angular/material/core';
import { MatButton, MatIconButton } from '@angular/material/button';
import { MatTable, MatColumnDef, MatHeaderCellDef, MatHeaderCell, MatCellDef, MatCell, MatHeaderRowDef, MatHeaderRow, MatRowDef, MatRow } from '@angular/material/table';
import { MatTooltip } from '@angular/material/tooltip';
import { MatIcon } from '@angular/material/icon';

@Component({
    selector: 'app-users',
    templateUrl: './users.component.html',
    styleUrls: ['./users.component.scss'],
    standalone: true,
    imports: [MatCard, MatCardHeader, MatCardTitle, MatCardContent, ReactiveFormsModule, MatFormField, MatLabel, MatInput, NgIf, MatHint, MatSelect, MatOption, MatButton, MatTable, MatColumnDef, MatHeaderCellDef, MatHeaderCell, MatCellDef, MatCell, MatIconButton, MatTooltip, MatIcon, MatHeaderRowDef, MatHeaderRow, MatRowDef, MatRow]
})
export class UsersComponent implements OnInit {
  users: User[] = [];
  userForm: FormGroup;
  displayedColumns: string[] = ['username', 'fullName', 'email', 'phone', 'role', 'isActive', 'actions'];
  editingUserId: string | null = null;

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private snackBar: MatSnackBar
  ) {
    this.userForm = this.fb.group({
      username: ['', Validators.required],
      password: ['', [Validators.required, Validators.minLength(6)]],
      fullName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: [''],
      role: ['user', Validators.required]
    });
  }

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.userService.getUsers().subscribe({
      next: (users) => this.users = users,
      error: (err) => this.snackBar.open('Error cargando usuarios', 'Cerrar', { duration: 3000 })
    });
  }

  onSubmit(): void {
    if (this.userForm.valid) {
      if (this.editingUserId) {
        // Modo edición
        const data: any = {
          fullName: this.userForm.value.fullName,
          email: this.userForm.value.email,
          phone: this.userForm.value.phone || undefined,
          role: this.userForm.value.role
        };
        this.userService.updateUser(this.editingUserId, data).subscribe({
          next: () => {
            this.snackBar.open('Usuario actualizado', 'Cerrar', { duration: 2000 });
            this.cancelEdit();
            this.loadUsers();
          },
          error: (err) => {
            console.error('Error actualizando usuario:', err);
            this.snackBar.open(err.error?.message || 'Error actualizando usuario', 'Cerrar', { duration: 3000 });
          }
        });
      } else {
        // Modo creación
        const data: CreateUserRequest = this.userForm.value;
        if (data.phone === '') {
          delete data.phone;
        }
        this.userService.createUser(data).subscribe({
          next: () => {
            this.snackBar.open('Usuario creado', 'Cerrar', { duration: 2000 });
            this.userForm.reset({ role: 'user' });
            this.loadUsers();
          },
          error: (err) => {
            console.error('Error creando usuario:', err);
            this.snackBar.open(err.error?.message || 'Error creando usuario', 'Cerrar', { duration: 3000 });
          }
        });
      }
    }
  }

  editUser(user: User): void {
    this.editingUserId = user._id;
    this.userForm.patchValue({
      username: user.username,
      fullName: user.fullName,
      email: user.email,
      phone: user.phone || '',
      role: user.role
    });
    // Deshabilitar username y password en modo edición
    this.userForm.get('username')?.disable();
    this.userForm.get('password')?.clearValidators();
    this.userForm.get('password')?.updateValueAndValidity();
  }

  cancelEdit(): void {
    this.editingUserId = null;
    this.userForm.reset({ role: 'user' });
    this.userForm.get('username')?.enable();
    this.userForm.get('password')?.setValidators([Validators.required, Validators.minLength(6)]);
    this.userForm.get('password')?.updateValueAndValidity();
  }

  toggleActive(user: User): void {
    const action = user.isActive ? 'desactivar' : 'activar';
    if (confirm(`¿Estás seguro de ${action} a ${user.username}?`)) {
      this.userService.updateUser(user._id, { isActive: !user.isActive }).subscribe({
        next: () => {
          this.snackBar.open(`Usuario ${action}do`, 'Cerrar', { duration: 2000 });
          this.loadUsers();
        },
        error: (err) => this.snackBar.open(`Error al ${action} usuario`, 'Cerrar', { duration: 3000 })
      });
    }
  }

  deleteUser(id: string): void {
    if (confirm('¿Eliminar este usuario? Esta acción no se puede deshacer.')) {
      this.userService.deleteUser(id).subscribe({
        next: () => {
          this.snackBar.open('Usuario eliminado', 'Cerrar', { duration: 2000 });
          this.loadUsers();
        },
        error: (err) => this.snackBar.open('Error eliminando usuario', 'Cerrar', { duration: 3000 })
      });
    }
  }
}
