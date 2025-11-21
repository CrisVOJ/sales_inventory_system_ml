import { Routes } from '@angular/router';
import { authGuard } from './shared/auth/auth.guard';

export const routes: Routes = [
    { path: 'login', loadComponent: () => import('./features/auth/login.page').then(m => m.LoginPage) },
    { path: '', redirectTo: '/customers', pathMatch: 'full' },
    { path: 'customers', canActivate: [authGuard], loadComponent: () => import('./features/customers/customers.page').then(m => m.CustomersPage) },
    { path: 'categories', canActivate: [authGuard], loadComponent: () => import('./features/categories/category.page').then(m => m.CategoriesPage) },
    { path: 'products', canActivate: [authGuard], loadComponent: () => import('./features/products/product.page').then(m => m.ProductsPage) },
    { path: 'locations', canActivate: [authGuard], loadComponent: () => import('./features/locations/location.page').then(m => m.LocationsPage) },
    { path: 'inventories', canActivate: [authGuard], loadComponent: () => import('./features/inventories/inventory.page').then(m => m.InventoriesPage) },
    { path: 'sales', canActivate: [authGuard], loadComponent: () => import('./features/sales/sale.page').then(m => m.SalesPage) },
    { path: 'users', canActivate: [authGuard], loadComponent: () => import('./features/users/users.page').then(m => m.UsersPage) },
    { path: '**', redirectTo: '' },
];
