import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { CdpRootComponent } from './app/app.component';

bootstrapApplication(CdpRootComponent, appConfig).catch((err) =>
  console.error(err)
);
