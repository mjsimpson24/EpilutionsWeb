import { Component } from '@angular/core';

import { Routes } from '@angular/router';

import { CarrierTenderComponent } from './components/carrier-tender/carrier-tender.component';
import { CarrierTenderListComponent } from './components/carrier-tender-list/carrier-tender-list.component';
import { NavMenuComponent } from './components/navmenu/navmenu.component';
import { FetchDataComponent } from './components/fetchdata/fetchdata.component';
import { HomeComponent } from './components/home/home.component';
import { CounterComponent } from './components/counter/counter.component';
import { LoginComponent } from './login/login.component';
import { OAuthCallbackHandler } from './login-callback/oauth-callback.guard';
import { OAuthCallbackComponent } from './login-callback/oauth-callback.component';
import { AuthenticationGuard } from "./services/authenticated.guard";

export const rootRouterConfig: Routes = [
    { path: '', redirectTo: 'login', pathMatch: 'full' },
    { path: 'home', component: HomeComponent, canActivate: [AuthenticationGuard] },
    { path: 'login', component: LoginComponent },
    { path: 'id_token', component: OAuthCallbackComponent, canActivate: [OAuthCallbackHandler] },
    { path: 'counter', component: CounterComponent, canActivate: [AuthenticationGuard] },
    { path: 'fetch-data', component: FetchDataComponent },
    { path: 'carrier-tender/:orderNumber', component: CarrierTenderComponent },
    { path: 'carrier-tender-list/:carrierCode', component: CarrierTenderListComponent }
];
