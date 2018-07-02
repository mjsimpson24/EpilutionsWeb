import { Component, Inject, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { OrderData, TenderData, StopData, City } from '../../models/models';
import { Observable } from 'rxjs';
import { forEach } from '@angular/router/src/utils/collection';

@Component({
    selector: 'carrier-tender-list',
    templateUrl: './carrier-tender-list.component.html',
    styleUrls: ['./carrier-tender-list.component.css']
})

export class CarrierTenderListComponent implements OnInit {
    public allOrders: OrderData[] = new Array();
    public openOrders: OrderData[] = new Array();
    public cities: Observable<City> = new Observable<City>();
    public states: string[] = new Array();
    public encryptedCarrierCode: string = '';
    public originFilter: string = '';
    public destinationFilter: string = '';
    public filterDate: Date = new Date();

    constructor(http: HttpClient, @Inject('BASE_URL') baseUrl: string, route: ActivatedRoute, private titleService: Title,
        private router: Router) {
        route.params.subscribe(params => { this.encryptedCarrierCode = params.carrierCode });
        this.titleService.setTitle('Carrier Tender Orders');        

        http.get<OrderData[]>(baseUrl + 'api/CarrierTender/GetOrdersByCarrierCode/?id=' + encodeURIComponent(this.encryptedCarrierCode)).subscribe(result => {
            this.allOrders = result;
            this.openOrders = result;
            for(let order of this.openOrders)
            {
                
                if (this.states.indexOf(order.originCity.stAbbr) < 0) this.states.push(order.originCity.stAbbr);
                if (this.states.indexOf(order.destinationCity.stAbbr) < 0) this.states.push(order.destinationCity.stAbbr);
            }
            this.states = this.states.sort((n1, n2) => {
                if (n1 > n2) return 1;
                if (n1 < n2) return -1;
                return 0;
            });
        }, error => console.error(error));
    }

    openTenderPage(encryptedId: string) {
        this.router.navigate(['carrier-tender', encryptedId]);
    }

    originStateChange(stateValue) {
        if (stateValue == null) return;
        this.openOrders = this.allOrders.filter(o => o.originCity.stAbbr == stateValue);
    }

    destinationStateChange(stateValue) {
        if (stateValue == null) return;
        this.openOrders = this.allOrders.filter(o => o.destinationCity.stAbbr == stateValue);
    }

    filterDateChange(dateValue) {
        if (dateValue == null) return;
        this.openOrders = this.allOrders.filter(o => new Date(o.pickupDate).setHours(0,0,0,0) == dateValue.setHours(0,0,0,0));
    }

    clearFilters() {
        this.originFilter = '';
        this.destinationFilter = '';
        this.filterDate = new Date();
        this.openOrders = this.allOrders;
    }

    ngOnInit() {
    }
}