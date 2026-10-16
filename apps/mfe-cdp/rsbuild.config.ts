import { createFederatedConfig } from '../../module-federation.shared';

export default async () => {
  return await createFederatedConfig({
    appName: 'mfe-cdp',
    isHost: false,
    port: 4205,
    exposes: {
      './Routes': './apps/mfe-cdp/src/app/remote-entry/entry.routes.ts',
    },
  });
};
