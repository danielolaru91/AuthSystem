import { Routes } from '@angular/router';
import { Dashboard } from '../pages/dashboard';
import { Home } from '../pages/home';
import { Users } from '../pages/users';
import { Companies } from '../pages/companies';
import { roleGuard } from '../guards/role.guard';

export const dashboardRoutes: Routes = [
  {
    path: '',
    component: Dashboard,
    children: [
      { path: '', component: Home },
      { path: 'users', component: Users },
      { path: 'companies', component: Companies, canActivate: [roleGuard('SuperAdmin')], }
    ]
  }
];
