import { Injectable, Inject } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';

const httpOptions = {
    headers: new HttpHeaders({
        'Content-Type': 'application/json'
    })
};

@Injectable()
export class CarrierTenderService {
    public saved: boolean = false;
    constructor(private http: HttpClient, @Inject('BASE_URL') private baseUrl: string) {
        this.saved = false;
    }

    public saveCarrierTender(tenderData: PostTenderData) {
        this.http.post<boolean>(this.baseUrl + 'api/CarrierTender/SaveTenderData', tenderData, httpOptions).subscribe(result => {
            this.saved = true;
            return result;
        }, error => {
            this.handleError(error);
            return false;
        });
    }

    private handleError(error: HttpErrorResponse) {
        if (error.error instanceof ErrorEvent) {
            // A client-side or network error occurred. Handle it accordingly.
            console.error('An error occurred:', error.error.message);
        } else {
            // The backend returned an unsuccessful response code.
            // The response body may contain clues as to what went wrong,
            console.error(
                `Backend returned code ${error.status}, ` +
                `body was: ${error.error}`);
        }
        // return an observable with a user-facing error message
        return throwError(
            'Something bad happened; please try again later.');
    };
}

export interface PostTenderData {
    encryptedId: string;
    bmtCity: City;
    bmtArrivalDate: Date;
    bmtArrivalHours: number;
    bmtArrivalMinutes: number;
    driver1Cell: string;
    driver1Name: string;    
    driver2Cell: string;
    driver2Name: string;
    truckNumber: string;
    trailerNumber: string;
    accepted: boolean;
}

interface City {
    cityId: number;
    cityStateZip: string;
}