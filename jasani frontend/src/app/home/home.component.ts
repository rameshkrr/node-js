import { Component, OnInit, ViewChild } from '@angular/core';
import { PlantDataService } from '../services/plantData/plant-data.service';
import * as XLSX from 'xlsx';
import * as jsontoxml from 'jsontoxml';
type AOA = any[][];

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {


  showSpinner = false;

  constructor(private plantDataService: PlantDataService) { }

  ngOnInit() {
  }


  dataPostedCount = 0
  dataPostedpercentage = 0
  totalDataPosts = 0
  showDownloads = false;
  resultData = []

  getAndSubmit() {
    this.showSpinner = true;

    this.plantDataService.getData().subscribe((getdata) => {

    
      this.dataPostedCount = 0;
      this.totalDataPosts = getdata.length;
      this.showDownloads = true
      getdata.forEach((data, data_index) => {
        let idsArray = []
        data['extension_attributes']['website_ids'].forEach((ids, ids_index) => {
          if(ids.includes(',')) {
            ids.split(',').forEach(id => {
              if(id.includes('[')) {
                if(id.replace(']', '').replace('[', '') !== '6') {
                  idsArray.push([+id.replace(']', '').replace('[', '')])
                }
              } else {
                idsArray.push(+id)
              }
            });
          } else {
            idsArray.push(+ids)
          }
          if((ids_index === data['extension_attributes']['website_ids'].length - 1)) {
            data['extension_attributes']['website_ids'] = idsArray;
            let submitJson = {
              product: data
            };
            console.log(JSON.stringify(submitJson))
            this.PostTheData(submitJson);
          }
        });
      })
    })
  }

  PostTheData(submitJson) {
    this.plantDataService.postData(submitJson).subscribe(posted => {
      this.showSpinner = false;
      this.resultData.push(posted)
      console.log(this.resultData)
      this.dataPostedCount++;
      this.dataPostedpercentage = +parseFloat(((this.dataPostedCount / this.totalDataPosts) * 100).toString()).toFixed(2);
      if(this.totalDataPosts === this.resultData.length - 1) {
        console.log(this.resultData)
      }
    })
  }
  

  postArrayofProducts() {
    this.showSpinner = true;
    this.resultData = []

    this.plantDataService.getData().subscribe(getdata => {

      this.dataPostedCount = 0;
      this.totalDataPosts = getdata.length;
      this.showDownloads = true;

      getdata.forEach((data, data_index) => {
        let submitJsonArray = {
          sourceItems: [{
            sku: data.sku,
            source_code: 'dubai',
            quantity: data.quantity,
            status: data.status
          },
          {
            sku: data.sku,
            source_code: 'KSA',
            quantity: data.quantity,
            status: data.status
          }
          ]
        }
        this.PostTheData2(submitJsonArray);
      })
    })
  }

  PostTheData2(submitJsonArray) {
    this.plantDataService.postArrayofProducts(submitJsonArray).subscribe(posted => {
      this.showSpinner = false;
      this.resultData.push(posted)
      this.dataPostedCount++;
      this.dataPostedpercentage = +parseFloat(((this.dataPostedCount / this.totalDataPosts) * 100).toString()).toFixed(2);
      if(this.dataPostedCount === this.totalDataPosts) {
        console.log(this.resultData)
      }
    })
  }

  ResultErrors = []
  errorsModal = false;
  showerrors(errors) {
    this.ResultErrors = errors['return']['errorMessages'];
    this.errorsModal = true;
  }

  dataModal = false;
  submittedData = '';
  showdata(data) {
    // var jsonxml = require('jsontoxml');
    this.submittedData = jsontoxml(data);
    this.dataModal = true;
  }

}