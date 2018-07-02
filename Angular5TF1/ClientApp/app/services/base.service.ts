import { throwError as observableThrowError, Observable, Observer, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { Http, Response, Headers } from '@angular/http';
import { Inject, Injectable } from '@angular/core';
import 'rxjs/Rx';

import { AdalService } from './adal.service';
import { BaseEndpoint } from './../app.constants';

@Injectable()
export class BaseService<T> {
    headers: Headers;

    constructor(private http: Http, @Inject(BaseEndpoint) private baseApiEndpoint, private adalService: AdalService) {

        this.headers = new Headers({ 'Content-Type': 'application/json' });
        let jwt = this.adalService.accessToken;
        this.headers.append('Authorization', 'Bearer ' + jwt);
    }

    getAll(): Observable<any> {
        return this.http.get(this.baseApiEndpoint, { headers: this.headers }).pipe(map(
            (res: Response) => {
                return res.json() as any[];
            }), catchError(err => of('error found')));
    }

    get(id: number): Observable<any> {
        return this.http.get(this.baseApiEndpoint + '/' + id).pipe(map((value, i) => {
            return <T>value.json()
        }), catchError(err => of('error found')));
    }

    private handleError(error: any) {
        console.error('server error:', error);
        if (error instanceof Response) {
            let errMessage = '';
            try {
                errMessage = error.json().error;
            } catch (err) {
                var errorStatus = error.statusText;
                errMessage = '';
            }
            return observableThrowError(errMessage);
        }
        return observableThrowError(error || 'server error');
    }
}