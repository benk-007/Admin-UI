import {commonProperties} from './environment.common';

// export const BASE_URL = 'https://api.qa.smsmode.fr/';


export const environment = {
    ...commonProperties,
    production: true,
    apiBaseUrl: (window as any).env?.BASE_URL || 'https://api.qa.smsmode.fr/',
};
