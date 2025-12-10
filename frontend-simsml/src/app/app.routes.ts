import { Routes } from '@angular/router';
import { authGuard } from './shared/auth/auth.guard';
import { AppShellComponent } from './core/layout/app-shell/app-shell.component';

export const routes: Routes = [
    { 
        path: 'auth', 
        children: [
            {
                path: 'login',
                loadComponent: () => import('./features/auth/login.page').then(m => m.LoginPage)
            },
            {
                path: 'reset-password/:token',
                loadComponent: () => import('./features/auth/reset-password.page').then(m => m.ResetPasswordPage)
            },
            { path: '', pathMatch: 'full', redirectTo: 'login' }
        ]
    },
    { 
        path: '',
        component: AppShellComponent,
        canActivateChild: [authGuard],
        children: [
            {   path: '', 
                loadComponent: () => import('./features/dashboard/dashboard.page').then(m => m.DashboardPage)
            },
            { 
                path: 'customers',
                loadComponent: () => import('./features/customers/customers.page').then(m => m.CustomersPage) 
            },
            { 
                path: 'categories',
                loadComponent: () => import('./features/categories/category.page').then(m => m.CategoriesPage) 
            },
            { 
                path: 'products', 
                loadComponent: () => import('./features/products/product.page').then(m => m.ProductsPage) 
            },
            { 
                path: 'locations', 
                loadComponent: () => import('./features/locations/location.page').then(m => m.LocationsPage) 
            },
            { 
                path: 'inventories',
                loadComponent: () => import('./features/inventories/inventory.page').then(m => m.InventoriesPage) 
            },
            { 
                path: 'sales',
                loadComponent: () => import('./features/sales/sale.page').then(m => m.SalesPage) 
            },
            { 
                path: 'predictions',
                loadComponent: () => import('./features/predictions/predictions.page').then(m => m.PredictionPage) 
            },
            { 
                path: 'users', 
                loadComponent: () => import('./features/users/users.page').then(m => m.UsersPage) 
            },
            { 
                path: 'profile',
                loadComponent: () => import('./features/profile/profile.page').then(m => m.ProfilePage) 
            },
        ]
    },

    { path: '**', redirectTo: 'auth/login' }
];
