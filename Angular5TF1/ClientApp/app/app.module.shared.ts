import { NgModule } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms'
import { HttpClientModule } from '@angular/common/http';
import { RouterModule } from '@angular/router';
import {
    MatAutocompleteModule,
    MatButtonModule,
    MatButtonToggleModule,
    MatCardModule,
    MatCheckboxModule,
    MatChipsModule,
    MatDatepickerModule,
    MatDialogModule,
    MatExpansionModule,
    MatGridListModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatListModule,
    MatMenuModule,
    MatNativeDateModule,
    MatPaginatorModule,
    MatProgressBarModule,
    MatRadioModule,
    MatRippleModule,
    MatSelectModule,
    MatSidenavModule,
    MatSliderModule,
    MatSlideToggleModule,
    MatSnackBarModule,
    MatSortModule,
    MatTableModule,
    MatTabsModule,
    MatToolbarModule,
    MatTooltipModule,
    MatStepperModule,
    MatAutocomplete,
    MatDialog,
} from '@angular/material';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { rootRouterConfig } from './app.routes';

import { AppComponent } from './components/app/app.component';
import { DatepickerExample } from './components/datepicker/datepicker.component';
import { NavMenuComponent } from './components/navmenu/navmenu.component';
import { HomeComponent } from './components/home/home.component';
import { FetchDataComponent } from './components/fetchdata/fetchdata.component';
import { CounterComponent } from './components/counter/counter.component';
import { LoginComponent } from './login/login.component';
import { CarrierTenderComponent, DeclineDialog } from './components/carrier-tender/carrier-tender.component';
import { CarrierTenderListComponent } from './components/carrier-tender-list/carrier-tender-list.component';
import { BaseEndpoint } from './app.constants';
import { OAuthCallbackHandler } from './login-callback/oauth-callback.guard';
import { OAuthCallbackComponent } from './login-callback/oauth-callback.component';
import { OAuthHandshakeModule } from './login-callback/oauth-callback.module';
import { SharedServicesModule } from './services/shared.services.module';
import { ValueService } from './services/value.service';
import { CarrierTenderService } from './services/carrier-tender.service';
import { TelerikReportingModule } from '@progress/telerik-angular-report-viewer';

@NgModule({
    declarations: [
        AppComponent,
        NavMenuComponent,
        CounterComponent,
        DeclineDialog,
        FetchDataComponent,
        HomeComponent,
        LoginComponent,
        CarrierTenderComponent,
        CarrierTenderListComponent,
        DatepickerExample
    ],
    imports: [
        BrowserAnimationsModule,
        CommonModule,
        HttpClientModule,
        FormsModule,
        OAuthHandshakeModule,
        SharedServicesModule,
        MatAutocompleteModule,
        MatDatepickerModule,
        MatDialogModule,
        MatFormFieldModule,
        MatInputModule,        
        MatNativeDateModule,
        MatProgressSpinnerModule,
        MatSelectModule,
        ReactiveFormsModule,
        TelerikReportingModule,
        RouterModule.forRoot(rootRouterConfig, { useHash: true })
    ],
    providers: [
        { provide: BaseEndpoint, useValue: 'http://localhost:52337' },
        ValueService,
        CarrierTenderService
    ],
    bootstrap: [AppComponent, DatepickerExample],
    entryComponents: [DeclineDialog]
})
export class AppModuleShared {
}
