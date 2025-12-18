import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { AuthGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  {
    path: 'main',
    canActivate: [AuthGuard],
    loadChildren: () => import('./pages/main/main.module').then(m => m.MainModule)
  },
  { path: '**', redirectTo: '/login' }
];
