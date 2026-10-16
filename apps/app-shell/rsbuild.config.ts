import { createFederatedConfig } from '../../module-federation.shared';

export default async () => {
  return await createFederatedConfig({
    appName: 'app-shell',
    isHost: true,
    port: 4200,
    remotes: {
      'mfe_crm': 'mfe_crm@http://localhost:4204/mf-manifest.json',
      'mfe_cdp': 'mfe_cdp@http://localhost:4205/mf-manifest.json',
    },
  });
};
