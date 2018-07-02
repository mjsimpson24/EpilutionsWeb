export interface City {
    cityId: number;
    cityStateZip: string;
    stAbbr: string;
}

export interface Contact {
    firstName: string;
    lastName: string;
    title: string;
    phone: string;
    phoneExt: string;
    fax: string;
    cell: string;
    email: string;
}

export interface Customer {
    name: string;
    address1: string;
    city: City;
}

export interface OrderData {
    orderNumber: string;
    originCity: City;
    destinationCity: City;
    shipper: Customer;
    consignee: Customer;
    tenderData: TenderData;
    loadType: string;
    pickupDate: Date;
    driver1: Contact;
}

export interface OrderStop {
    orderNumber: string;
    eventCode: string;
    stopType: string;
    arrivalDate: Date;
    departDate: Date;
    earliestDate: Date;
    lastestDate: Date;
    pieces: number;
    piecesUnit: string;
    weight: number;
    weightUnit: string;
    stopNumber: number;
    stopSequence: number;
    cityStateZip: string;
    address: string;
    comment: string;
    stopCustomer: string;
}

export interface StopData {
    bmtCity: City;
    bmtStopDate: Date;
    estimatedArrivalDate: Date;
    stops: OrderStop[];
}

export interface TenderData {
    quoteOrderLineId: number;
    carrierName: string;
    orderNumber: string;
    driver1Cell: string;
    driver1Name: string;
    driver2Cell: string;
    driver2Name: string;
    contactName: string;
    contactPhone: string;
    contactEmail: string;
    truckNumber: string;
    trailerNumber: string;
    miles: number;
    linehaulCharge: number;
    otherCharge: number;
    comment: string;
    trailerType: string;
    carrierRepName: string;
    carrierRepPhone: string;
    carrierRepCell: string;
    carrierRepFax: string;
    accepted: boolean;
    disclaimer: string;
}

export interface PrintPageData {
    url: string;
    html: string;
}