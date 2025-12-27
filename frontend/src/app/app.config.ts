import { ApplicationConfig, provideAppInitializer } from '@angular/core';
import { provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';

import { routes } from './routes/app.routes';
import { restoreSession } from './session-initializer';
import { provideCharts, withDefaultRegisterables } from 'ng2-charts';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideHttpClient(),
    provideRouter(routes),
    provideCharts(withDefaultRegisterables()),
    provideAppInitializer(() => restoreSession()), provideCharts(withDefaultRegisterables())
  ]
};
