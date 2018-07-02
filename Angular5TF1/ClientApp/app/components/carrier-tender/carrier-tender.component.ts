import { Component, Inject, OnInit, ViewChild, ViewEncapsulation, AfterViewInit } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { FormGroup, FormBuilder, FormControl } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { startWith ,  map } from 'rxjs/operators';
import { CarrierTenderService } from '../../services/carrier-tender.service';
import { PostTenderData } from '../../services/carrier-tender.service';
import { Title } from '@angular/platform-browser';
import '../../models/models';
import { TenderData, StopData, City, PrintPageData } from '../../models/models';
import * as $ from 'jquery';
import { TelerikReportViewerComponent } from '@progress/telerik-angular-report-viewer';

const httpOptions = {
    headers: new HttpHeaders({
        'Content-Type': 'application/json'
    })
};

@Component({
    selector: 'carrier-tender',
    templateUrl: './carrier-tender.component.html',
    styleUrls: ['./carrier-tender.component.css'],
    encapsulation: ViewEncapsulation.None
})
export class CarrierTenderComponent implements OnInit {
    @ViewChild(TelerikReportViewerComponent) viewer1: TelerikReportViewerComponent | undefined;
    public encryptedOrder: string = '';
    public tenderData: TenderData;
    public stopData: StopData;
    public picker: Date = new Date();
    public filteredCities: Observable<City[]> = new Observable<City[]>();
    public cityControl = new FormControl();
    public cityList: City[] = new Array();
    public bmtCityId: number = 0;
    public bmtIsDisabled: boolean = true;
    public bmtArrivalHour: number = 0;
    public bmtArrivalMinute: number = 0;
    public hasBmt: boolean = false;
    public isSaving: boolean = false;
    public saveMessage: string = '';
    private http: HttpClient;
    private baseUrl: string = '';
    public reportUrl: string = '';
    public printVisible: boolean = true;
    viewerContainerStyle = {
        position: 'relative',
        width: '1000px',
        height: '800px',
        ['font-family']: 'ms sans serif'
    };

    constructor(private fb: FormBuilder, http: HttpClient, @Inject('BASE_URL') baseUrl: string, route: ActivatedRoute,
        private tenderService: CarrierTenderService, private titleService: Title, public dialog: MatDialog) {
        this.titleService.setTitle('Carrier Tender');
        this.tenderData = {} as TenderData;
        this.stopData = {} as StopData;
        this.http = http;
        this.baseUrl = baseUrl;
        this.reportUrl = baseUrl + 'api/Reports/';
        route.params.subscribe(params => { this.encryptedOrder = params.orderNumber });

        http.get<TenderData>(baseUrl + 'api/CarrierTender/GetTenderData/?id=' + encodeURIComponent(this.encryptedOrder)).subscribe(result => {
            var context = this;
            this.tenderData = result;
            this.titleService.setTitle('Carrier Tender #' + this.tenderData.orderNumber);
            this.printVisible = true;
            this.printVisible = false;
        }, error => console.error(error));

        http.get<StopData>(baseUrl + 'api/CarrierTender/GetStopData/?id=' + encodeURIComponent(this.encryptedOrder)).subscribe(result => {
            this.stopData = result;
            this.setArrivalTime();
            this.hasBmt = this.stopData.bmtCity != null;
            this.cityControl.setValue(this.stopData.bmtCity as City);
        }, error => console.error(error));

        http.get<City[]>(baseUrl + 'api/City/GetBMTCitiesByLineId?id=' + encodeURIComponent(this.encryptedOrder)).subscribe(result => {
            this.cityList = result;

            if (this.hasBmt) {
                this.cityControl.setValue(this.stopData.bmtCity as City);
            } else {
                this.cityControl.enable();
            }
        }, error => console.error(error));

        http.get<City[]>(baseUrl + 'api/City/GetCitiesDropdown').subscribe(result => {
            this.cityList = result;

            if (this.hasBmt) {
                this.cityControl.setValue(this.stopData.bmtCity as City);
            } else {
                this.cityControl.enable();
            }
        }, error => console.error(error));
    }

    ngOnInit() {
        this.cityControl = new FormControl();
        this.cityControl.disable();
        this.filteredCities = this.cityControl.valueChanges
            .pipe(
                startWith(''),
                map(city => city ? this.filterCities(city) : new Array())
        );
    }

    ngAfterViewInit() {
        console.log('Values on ngAfterViewInit():');
    }

    filterCities(cityName: string) {
        if (typeof cityName !== 'string') return new Array();
        const filterValue = cityName.toLowerCase();
        if (filterValue.length < 2) return new Array();
        return this.cityList.filter(city => city.cityStateZip.toLowerCase().startsWith(filterValue));
    }

    displayFn(city?: City): string | undefined {
        return city ? city.cityStateZip : undefined;
    }

    setArrivalTime() {
        if (this.stopData.bmtStopDate) {
            var bmtDate = new Date(this.stopData.bmtStopDate);
            this.bmtArrivalHour = bmtDate.getHours();
            this.bmtArrivalMinute = bmtDate.getMinutes();
        }
    }

    acceptOffer() {
        this.tenderData.accepted = true;
        this.saveTenderData(true);        
    }

    declineOffer() {
        this.openDeclineDialog();
    }

    openDeclineDialog() {
        let dialogRef = this.dialog.open(DeclineDialog, {
            width: '250px',
            data: {}
        });

        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                this.tenderData.accepted = false;
                this.saveTenderData(false);
            }
        });
    }

    saveData() {
        this.saveTenderData(this.tenderData.accepted);
    }

    saveTenderData(accepted: boolean) {
        this.isSaving = true;
        var data = {
            encryptedId: encodeURIComponent(this.encryptedOrder),
            bmtCity: this.cityControl.value ? this.cityControl.value as City : 0,
            bmtArrivalDate: this.stopData.estimatedArrivalDate,
            bmtArrivalHours: this.bmtArrivalHour,
            bmtArrivalMinutes: this.bmtArrivalMinute,
            driver1Cell: this.tenderData.driver1Cell,
            driver1Name: this.tenderData.driver1Name,
            driver2Cell: this.tenderData.driver2Cell,
            driver2Name: this.tenderData.driver2Name,
            truckNumber: this.tenderData.truckNumber,
            trailerNumber: this.tenderData.trailerNumber,
            accepted: accepted
        } as PostTenderData;

        this.http.post<string>(this.baseUrl + 'api/CarrierTender/SaveTenderData', data, httpOptions).subscribe(result => {
            this.isSaving = false;
            this.saveMessage = this.tenderData.accepted ? 'Offer has been accepted' : 'Offer has been declined';
            this.clearMessage(this);
            return result;
        }, error => {
            this.isSaving = false;
            this.saveMessage = 'Failed to save';
            this.clearMessage(this);
            return false;
        });
    }

    clearMessage(context: CarrierTenderComponent) {
        setTimeout(function () {
            context.saveMessage = '';
        }, 5000);
    }

    print(reportViewer: any): void {
        this.printVisible = true;
        var reportSource = this.viewer1!.getReportSource();
        let params = reportSource.parameters;
        params.QuoteOrderLineId = this.tenderData.quoteOrderLineId;
        reportSource.parameters = params;
        this.viewer1!.setReportSource(reportSource);
    }

    hidePrint(): void {
        this.printVisible = false;
    }

    refreshRateCon(test: any) {
        var ok = 'lol';
    }

    printError(e, args) {
        var ok = 'lol';
    }
}


@Component({
    selector: 'decline-dialog',
    templateUrl: './decline-dialog.component.html',
    styleUrls: ['./carrier-tender.component.css']
})
export class DeclineDialog {

    constructor(
        public dialogRef: MatDialogRef<DeclineDialog>,
        @Inject(MAT_DIALOG_DATA) public data: any) { }

    confirmDecline(): void {
        this.dialogRef.close(true);
    }

    cancelDecline(): void {
        this.dialogRef.close();
    }
}