import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import Carousel from './Carousel';
import registerServiceWorker from './registerServiceWorker';
//import parseXlsx from 'excel';
import * as XLSX from 'xlsx';
import zip from 'jszip';

ReactDOM.render(<Carousel />, document.getElementById('carouselactions'));
registerServiceWorker();
GetTodayBhavCopy();




async function GetTodayBhavCopy() {
 /* try { */
   let url = "https://nseindia.com/content/historical/EQUITIES/"
   var months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
   var months_short = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV","DEC"]
   let today = new Date();
   let year = today.getFullYear();
   let month = months[today.getMonth()].toUpperCase();
   let month_short = months_short[today.getMonth()];
   let date = today.getDate() - 2;
   let dateString = date.toString(); 
   if (date < 10) { dateString = "0"+dateString }
   
   let url_next = year+"/"+month_short+"/cm"+dateString+month_short+year+"bhav.csv.zip";
   url += url_next;
   
   var myHeaders = new Headers();
   var myInit = { method: 'GET',
               headers: myHeaders,
               mode: 'no-cors',
               cache: 'default' };
   
   console.log("URL ="+url);
   
   /*
   let response = await fetch(url, myInit);
   
   if(response.ok) {
     let jsonResponse = await response.json();
     return jsonResponse;
   }
   throw new Error('Request failed');
  } catch(error) {
    console.log(error);
  } 
  */
}



function GetDate_YYYYMMDD_withDash2(myDate) {

   let date = myDate.getDate();
   if (date < 10) {date = "0" + date;}
   let month = myDate.getMonth();
   if (month+1 < 10) {month = "0" + (month+1);} else {month++;}
   let year = myDate.getFullYear();
   let date_key = year + "-" + month + "-" + date;   
   return date_key;
  }



async function GetStockQuotes(id, stockcode) {
   try {
   let av_api_key = "2O5D20VZB8TTSDJR";
 //  https://www.alphavantage.co/query?function=TIME_SERIES_INTRADAY&symbol=MSFT&interval=1min&apikey=demo
   let av_url_start = "https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=";
   let av_url_end = "&interval=1min&apikey="+av_api_key;
   
   let url = av_url_start+stockcode+av_url_end;
   
 /*  let date_key = GetDate_YYYYMMDD_withDash(); */
   let keyOne = "Time Series (Daily)";
   let keyTwo = "4. close";
   let docKey = "myStock"+id;
   
   console.log(url);
   
   let response = await fetch(url);
   
   if(response.ok) {
     let jsonResponse = await response.json();
     console.log(jsonResponse);
   //  console.log(jsonResponse[keyOne][date_key][keyTwo]);
  //   document.getElementById(docKey).innerHTML = jsonResponse[keyOne][date_key][keyTwo];
     
     // console.log(jsonResponse["Time Series (Daily)"][date_key]["1. open"]);
     return jsonResponse;
   }
   throw new Error('Request failed');
  } catch(error) {
    console.log(error);
  }
}




/* async function GetEODStockPrice(symbol,myDate) {
  let quandl_apikey = "SLHTVNT26xmwH3av_f-5";
  let date = GetDate_YYYYMMDD_withDash2(myDate);
  let url = "https://www.quandl.com/api/v3/datasets/NSE/"+symbol+"?start_date="+date+"&end_date="+date+"&api_key="+quandl_apikey;
  
  try {
    let response = await fetch(url, { mode: 'cors' });
    
    if(response.ok) {
      let jsonResponse = await response.json();
      console.log(jsonResponse.dataset.data["0"]["5"]);
      return 0;
    }
    throw new Error('Request failed');
  } catch(error) {
    console.log(error);
  }
  return 0;
}
*/



function FindTop3Stocks(stock) {
  let obj,obj1,obj2,obj3 = undefined;
  let object = [];
  let itr=0;
  
  obj1=obj2=obj3=stock[0];
  obj1.xirr = obj2.xirr = obj3.xirr = 0;
  
  console.log(stock);

  for(;itr<stock.length;itr++) {
    
    
    if (stock[itr].stockcount <= 1) { continue; }
    
    obj = stock[itr];
    
    if (obj.xirr > obj3.xirr) {
      if (obj.xirr > obj2.xirr) {
        if (obj.xirr > obj1.xirr) {
          obj3 = obj2;
          obj2 = obj1;
          obj1 = obj;
        } else {
          obj3 = obj2;
          obj2 = obj;
        }
      } else {
        obj3 = obj;
      }
    }
  }
  object[0] = obj1;
  object[1] = obj2;
  object[2] = obj3;
//  console.log(object);
  return object;
}



