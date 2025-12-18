/**
 * Componente de Gestión de Usuarios (Admin)
 * 
 * Funcionalidad:
 *   - Listar todos los usuarios (tabla Material)
 *   - Crear usuarios (admin/user/guest)
 *   - Eliminar usuarios (con confirmación)
 * 
 * Campos formulario:
 *   - username: min 3 chars, único
 *   - password: min 6 chars, hasheado en backend
 *   - fullName: nombre completo
 *   - email: validación email
 *   - role: admin | user | guest (default user)
 * 
 * Reglas SOC:
 *   - Solo admin accede (protegido por AdminGuard)
 *   - Guests: expiresAt calculado según AppConfig.guestMaxDurationDays
 *   - No se puede eliminar el propio usuario (evitar lockout)
 * 
 * Tabla:
 *   - Columnas: username, fullName, email, role, actions
 *   - Actions: eliminar (con confirm dialog)
 */
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { UserService } from '../../../services/user.service';
import { User, CreateUserRequest } from '../../../models/user.model';

@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.scss']
})
export class UsersComponent implements OnInit {
  users: User[] = [];
  userForm: FormGroup;
  displayedColumns: string[] = ['username', 'fullName', 'email', 'role', 'actions'];

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
      const data: CreateUserRequest = this.userForm.value;
      this.userService.createUser(data).subscribe({
        next: () => {
          this.snackBar.open('Usuario creado', 'Cerrar', { duration: 2000 });
          this.userForm.reset({ role: 'user' });
          this.loadUsers();
        },
        error: (err) => this.snackBar.open('Error creando usuario', 'Cerrar', { duration: 3000 })
      });
    }
  }

  deleteUser(id: string): void {
    if (confirm('¿Eliminar este usuario?')) {
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
