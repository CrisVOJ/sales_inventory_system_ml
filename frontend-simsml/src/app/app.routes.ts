import { Routes } from '@angular/router';
import { AppShellComponent } from './core/layout/app-shell/app-shell.component';
import { UsersPage } from './features/users/users.page';

export const routes: Routes = [
    {
        path: '',
        component: UsersPage,
    },
    {
        path: 'users',
        component: UsersPage
    },
];
