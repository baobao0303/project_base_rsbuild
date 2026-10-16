import { createFederatedConfig } from '../../module-federation.shared';

export default async () => {
  return await createFederatedConfig({
    appName: 'mfe-crm',
    isHost: false,
    port: 4204,
    exposes: {
      './Routes': './apps/mfe-crm/src/app/remote-entry/entry.routes.ts',
    },
  });
};
