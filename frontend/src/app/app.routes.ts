import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
    { path: '', redirectTo: 'login', pathMatch: 'full' },
    { path: 'login', loadComponent: () => import('./pages/login').then((m) => m.Login) },
    { path: 'register', loadComponent: () => import('./pages/register').then((m) => m.Register) },
    { path: 'confirm-email', loadComponent: () => import('./pages/confirm-email').then(m => m.ConfirmEmail) },
    { path: 'forgot-password', loadComponent: () => import('./pages/forgot-password').then((m) => m.ForgotPassword) },
    { path: 'reset-password', loadComponent: () => import('./pages/reset-password').then((m) => m.ResetPasswordComponent) },
    { path: 'dashboard', loadComponent: () => import('./pages/dashboard').then(m => m.Dashboard), canActivate: [authGuard]},
];
