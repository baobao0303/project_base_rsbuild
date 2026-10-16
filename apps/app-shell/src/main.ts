import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppShellComponent } from './app/app.component';

bootstrapApplication(AppShellComponent, appConfig).catch((err) =>
  console.error(err)
);
