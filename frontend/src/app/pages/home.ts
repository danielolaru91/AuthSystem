import { Component, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-dashboard-home',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <h2>Dashboard</h2>
    <p>Dashboard Page, available to logged in users only</p>
  `
})
export class Home {}
