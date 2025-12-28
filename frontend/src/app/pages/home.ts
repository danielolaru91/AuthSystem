import { Component, inject, computed } from '@angular/core';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration } from 'chart.js';
import { DashboardDataService } from '../services/dashboard-data.service';
import { GlobalStateService } from '../services/global-state.service';

@Component({
  selector: 'app-dashboard-home',
  imports: [BaseChartDirective],
  template: `
    <h2>Dashboard</h2>
    <p>Dashboard Page, available to logged in users only</p>

    <div style="display: flex; gap: 40px; flex-wrap: wrap;">

      <!-- Users by Roles -->
      <div style="width: 300px; height: 300px;">
        <canvas baseChart [data]="rolesData()" [options]="donutOptions" [type]="'doughnut'"></canvas>
      </div>

      <!-- Confirmed vs Unconfirmed -->
      <div style="width: 300px; height: 300px;">
        <canvas baseChart [data]="confirmationData()" [options]="donutOptions" [type]="'doughnut'"></canvas>
      </div>

      <!-- Companies -->
      <div style="width: 300px; height: 300px;">
        <canvas baseChart [data]="companiesData()" [options]="donutOptions" [type]="'doughnut'"></canvas>
      </div>

    </div>
  `
})
export class Home {

  private _dashboardData = inject(DashboardDataService);
  private _globalstate = inject(GlobalStateService);

  constructor() {
    this._dashboardData.ensureLoaded();
  }

  // --- CHART DATA BUILT FROM SIGNALS ---

  rolesData = computed<ChartConfiguration<'doughnut'>['data']>(() => {
    const roleCounts = this._globalstate.usersByRole();
    const labels = Object.keys(roleCounts);
    const values = Object.values(roleCounts);

    return {
      labels,
      datasets: [
        {
          data: values,
          backgroundColor: ['#3f51b5', '#ff9800', '#9c27b0', '#4caf50', '#e91e63'],
          hoverBackgroundColor: ['#5c6bc0', '#ffb74d', '#ba68c8', '#66bb6a', '#f06292']
        }
      ]
    };
  });

  confirmationData = computed<ChartConfiguration<'doughnut'>['data']>(() => ({
    labels: ['Confirmed', 'Unconfirmed'],
    datasets: [
      {
        data: [this._globalstate.confirmedUsers(), this._globalstate.unconfirmedUsers()],
        backgroundColor: ['#4caf50', '#f44336'],
        hoverBackgroundColor: ['#66bb6a', '#e57373']
      }
    ]
  }));

  companiesData = computed<ChartConfiguration<'doughnut'>['data']>(() => ({
    labels: ['Companies'],
    datasets: [
      {
        data: [this._globalstate.totalCompanies()],
        backgroundColor: ['#009688'],
        hoverBackgroundColor: ['#26a69a']
      }
    ]
  }));

  // --- SHARED OPTIONS ---
  donutOptions: ChartConfiguration<'doughnut'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '60%',
    plugins: {
      tooltip: {
        callbacks: {
          label: (ctx) => {
            const dataset = ctx.dataset.data as number[];
            const total = dataset.reduce((a, b) => a + b, 0);
            const value = ctx.parsed;
            const percentage = ((value / total) * 100).toFixed(1);
            return `${ctx.label}: ${value} (${percentage}%)`;
          }
        }
      },
      legend: {
        labels: {
          generateLabels: (chart) => {
            const data = chart.data;
            const dataset = data.datasets[0].data as number[];
            const total = dataset.reduce((a, b) => a + b, 0);

            return data.labels!.map((label, i) => {
              const value = dataset[i];
              const percentage = ((value / total) * 100).toFixed(1);

              return {
                text: `${label}: ${value} (${percentage}%)`,
                fillStyle: (data.datasets[0].backgroundColor as string[])[i],
                strokeStyle: '#fff',
                hidden: false,
                index: i
              };
            });
          }
        }
      }
    }
  };
}
