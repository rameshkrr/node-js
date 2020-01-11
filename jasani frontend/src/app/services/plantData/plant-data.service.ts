import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Http, Response } from '@angular/http';
import { map } from 'rxjs/operators';
import * as json2csv from 'json2csv'; // convert json file to csv
import { saveAs } from 'file-saver';  // save the file

@Injectable({
  providedIn: 'root'
})
export class PlantDataService {

  constructor(private http: Http) { }

  nodeUrl: string = "http://192.168.1.249:8099"

  getData() {

    return new Observable<any>((observer) => {

      return this.http.get('http://3.18.184.242/Jasani/api/ProductStock/GetPresentStock')
        .pipe(map(response => <any>response.json()))
        .subscribe(data => {

          observer.next(data['sourceitems']);

        },
          error => {
            // console.log(error)
          });
    });
  }

  postData(body) {

    return new Observable<any>((observer) => {

      return this.http.post(this.nodeUrl + '/postData', (body))
        .pipe(map(response => <any>response.json()))
        .subscribe(data => {

          observer.next(data);

        },
          error => {
            // console.log(error)
          });
    });
  }

  postArrayofProducts(body) {

    return new Observable<any>((observer) => {

      return this.http.post(this.nodeUrl + '/postArrayofProducts', (body))
        .pipe(map(response => <any>response.json()))
        .subscribe(data => {

          observer.next(data);

        },
          error => {
            // console.log(error)
            observer.next(error);
          });
    });
  }

}
