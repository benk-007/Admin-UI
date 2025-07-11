import {commonProperties} from './environment.common';

export const environment = {
    ...commonProperties,
    production: false,
  apiBaseUrl: (window as any).env?.BASE_URL || 'https://api.qa.xstay.com/',
};
