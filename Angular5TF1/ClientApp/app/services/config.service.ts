import { Injectable } from '@angular/core';

@Injectable()
export class ConfigService {
    constructor() { }

    public get getAdalConfig(): any {
        return {
            tenant: 'NETORG465099.onmicrosoft.com',
            clientId: '2671d95e-5755-460b-8967-abe4747751b2',
            redirectUri: window.location.origin + '/',
            postLogoutRedirectUri: window.location.origin + '/'
        };
    }
} 