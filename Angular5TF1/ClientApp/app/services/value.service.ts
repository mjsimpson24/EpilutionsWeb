import { Http } from '@angular/http';
import { BaseEndpoint } from './../app.constants';
import { AdalService } from './adal.service';
import { BaseService } from './base.service';
import { Injectable, Inject } from '@angular/core';

@Injectable()
export class ValueService extends BaseService<string>{
    constructor(http: Http, @Inject(BaseEndpoint) baseApiEndpoint, adalService: AdalService) {
        super(http, baseApiEndpoint + '/api/values', adalService);
    }
}