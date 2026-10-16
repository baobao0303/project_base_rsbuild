import { createFederatedConfig } from '../../module-federation.shared';

export default async () => {
  const env = (process.env['APP_ENV'] || 'development') as string;
  const isDev = env === 'development';
  const crmHost = process.env['CRM_REMOTE_URL'] || (isDev ? 'http://localhost:4204' : '/crm');
  const cdpHost = process.env['CDP_REMOTE_URL'] || (isDev ? 'http://localhost:4205' : '/cdp');

  return await createFederatedConfig({
    appName: 'app-shell',
    isHost: true,
    port: 4200,
    remotes: {
      'mfe_crm': `mfe_crm@${crmHost.replace(/\/$/, '')}/mf-manifest.json`,
      'mfe_cdp': `mfe_cdp@${cdpHost.replace(/\/$/, '')}/mf-manifest.json`,
    },
  });
};
