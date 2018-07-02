import { Component, ViewEncapsulation } from '@angular/core';

@Component({
    selector: 'app',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.css'],
    encapsulation: ViewEncapsulation.None
})
export class AppComponent {
    viewerContainerStyle = {
        position: 'relative',
        width: '1000px',
        height: '800px',
        ['font-family']: 'ms sans serif'
    };
}
