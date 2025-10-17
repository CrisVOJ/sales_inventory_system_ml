import { Routes } from '@angular/router';
import { authGuard } from './shared/auth/auth.guard';
import { UsersPage } from './features/users/users.page';

export const routes: Routes = [
    { path: 'login', loadComponent: () => import('./features/auth/login.page').then(m => m.LoginPage) },
    { path: '', canActivate: [authGuard], loadComponent: () => import('./features/users/users.page').then(m => m.UsersPage) },
    { path: '**', redirectTo: '' },
];
