import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { CrmRootComponent } from './app/app.component';

bootstrapApplication(CrmRootComponent, appConfig).catch((err) =>
  console.error(err)
);
