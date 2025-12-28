import { Routes } from '@angular/router';
import { authGuard } from '../guards/auth.guard';
import { loggedGuard } from '../guards/logged.guard';

export const routes: Routes = [
    { path: '', redirectTo: 'login', pathMatch: 'full' },
    { path: 'login', loadComponent: () => import('../pages/login').then((m) => m.Login), canActivate: [loggedGuard] },
    { path: 'register', loadComponent: () => import('../pages/register').then((m) => m.Register), canActivate: [loggedGuard] },
    { path: 'confirm-email', loadComponent: () => import('../pages/confirm-email').then(m => m.ConfirmEmail), canActivate: [loggedGuard] },
    { path: 'forgot-password', loadComponent: () => import('../pages/forgot-password').then((m) => m.ForgotPassword), canActivate: [loggedGuard] },
    { path: 'reset-password', loadComponent: () => import('../pages/reset-password').then((m) => m.ResetPasswordComponent), canActivate: [loggedGuard] },
    { 
        path: 'dashboard',
        loadChildren: () => import('./dashboard.routes')
        .then(m => m.dashboardRoutes),
        canActivate: [authGuard]
    },
    {path: '**', loadComponent: () => import('../pages/page-not-found').then((m) => m.PageNotFound) }
];
