import React from 'react';
import ReactDOM from 'react-dom';
import * as XLSX from 'xlsx';
import Card from './Card';
import Row from './Row';
import './Card.css';
import './Carousel.css';
import {JSZip} from 'jszip';

let stock=undefined;
let priceList=undefined;
let overallPortfolio = undefined;
let movie_images=[];
const PRICEKEY="bhav";
const PORTFOLIOKEY="PortFolio";
const MOVIEKEY="Ratings";

function GetTodayBhavCopy() {
 // try { 
   let url = "https://nseindia.com/content/historical/EQUITIES/";
   var months_short = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV","DEC"];
   let today = new Date();
   let year = today.getFullYear();
   let day = today.getDay();
   let month_short = months_short[today.getMonth()];
   let date = undefined;
   let time = today.getHours();
   
   // manage for sat, sunday and monday's to get the bhav copy before 6pm
   if (day === 0) {
     date = -2;
   } else if (day === 1) {
     date = -3;
   } else {
     date = -1;     
   }
   
   // after 6pm bhav copy for today should be available
   if (time > 18) {
     date = 0;
   }
   
   date += today.getDate();

   let dateString = date.toString(); 
   if (date < 10) { dateString = "0"+dateString }
   
   let url_next = year+"/"+month_short+"/cm"+dateString+month_short+year+"bhav.csv.zip";
   url += url_next;
   
    //"use strict";
/*
    var request = require('request');

    request({
      method : "GET",
      url : url,
      gzip : true,
      encoding: null // <- this one is important !
    }, function (error, response, body) {
      console.log("response code : "+response);
      if(error) {
        console.log("Oh God!! An Error!! : "+error);
        return;
      }
      JSZip.loadAsync(body).then(function (zip) {
        console.log("made it");
        return zip.file("content.txt").async("string");
      }).then(function (text) {
        console.log(text);
      });
    });
   */
   
   //console.log("URL ="+url);
   /*
   let response = await fetch(url);
   
   if(response.ok) {
     console.log("Price Fetched");
     let jsonResponse = await response.json();
     return jsonResponse;
   }
   throw new Error('Request failed');
  } catch(error) {
    console.log(error);
  } 
  */
  return url;
}

async function GetMovieImage(id, movie_key) {
    
  const api_key='e16685610255dd6967f3421eef7ea3bc';
  const url_start = 'https://api.themoviedb.org/3/find/';
  const url_end = '?api_key=' + api_key + '&language=en-US&external_source=imdb_id';
  const url2 = 'http://image.tmdb.org/t/p/original';
  const imdb_ref = 'http://www.imdb.com/title/';

  var posterpath = "";
  let movie_image = { 
                      id: 0,
                      url: 'http://www.imdb.com/',
                      href: 'http://www.imdb.com/'
                    }

  try {
   let url = url_start + movie_key + url_end;
   let response = await fetch(url);
   
   if(response.ok) {
     let jsonResponse = await response.json();
    // let imageMap = "myImage" + id;
    // let imageLink = "imageLink" + id;
     posterpath = await jsonResponse.movie_results[0].poster_path;

     movie_image.id = id;
     movie_image.url = url2 + posterpath;
     movie_image.href = imdb_ref + movie_key;
     movie_images[id] = movie_image;
     
     return jsonResponse;
   }
   throw new Error('Request failed');
  } catch(error) {
    console.log(error);
  }
}

function precisionRound(number, precision) {
    let factor = Math.pow(10, precision);
    return Math.round(number * factor) / factor;
  }

function GetNPV(symbol, values, dates, rate) {
  let npv=0;
  let date1 = new Date(dates[0]);
  let date2 = undefined;
  let datediff = undefined;
  let value = 0;
  
  rate = precisionRound(rate,3);
  for(let itr=0;itr<values.length;itr++) {
     date2 = new Date(dates[itr]);
     datediff = (date2 - date1)/(1000*60*60*24);
     value = (values[itr] / Math.pow((1+rate),(datediff/365)) );
     npv += value;
  }
  return npv;
}

function GetXIRR(symbol, values, dates) {
  let rate = 0;
  let precisenpv = 0;
  let itr=0;
  let previousnpv = 0;
  let prepreviousnpv = 0;
  const increment = 0.001;
  const precision = 2;
  
  /* debug
  if (symbol === "INE412U01017") {
    console.log("check XIRR"+values+"\n"+ dates);
  }
  */
  if (values.length !== 0 && values.length === dates.length) {
    for (; itr < (10/increment); itr++) {
      let npv = GetNPV(symbol, values, dates, rate);
      /* debug
      if (symbol === "INE412U01017") {
        console.log("npv : "+npv+"rate : "+rate);
      }
      */
      prepreviousnpv = previousnpv;
      previousnpv = precisenpv;
      precisenpv = precisionRound(npv, precision);
      if (precisenpv === 0) { 
        break; 
      } else if (precisenpv < 0 ) {
        rate -= increment;
      } else if (precisenpv > 0) {
        rate += increment; 
      }
      if (precisenpv === prepreviousnpv) {
        break;
      }
    }
  }
  return precisionRound(rate*100, precision);
}

function  GetTransactionValue(tx) {
    let value = 0;
    //table reader
    const TXTYPE = 3;
    const STKQTY = 4;
    const STKCOST = 5;
    const BRKG = 6;
    const TXCHG = 7;
    const STPDTY = 8;
    
    let tx_val = tx[STKQTY]*tx[STKCOST];
    let charges = tx[BRKG] + tx[TXCHG] + tx[STPDTY];
    
    if (tx[TXTYPE] === "Buy") {
      value = -(tx_val + charges);
    } else if (tx[TXTYPE] === "Sell") {
      value = tx_val - charges; 
    } else {
      console.log("Invalid Transaction Type Error");
    }
    return value;
  }

function TranslateExcelDate(date) {
    return new Date((date - (25567+2))*86400*1000);
  }

function findYestPrice(stkcode) {
    
    const STKCODE = 12;
    const DAYLASTPRICE = 6;
    
    for(let itr=0; itr<priceList.length; itr++) {
      /*
      if(stkcode === "INE412U01017") {
        console.log("PriceList scroll"+ priceList[itr][STKCODE]);
      }
      */
      if (priceList[itr][STKCODE] === stkcode) {
        /*
        if (stkcode === "INE412U01017") {
          console.log("price "+priceList[itr][DAYLASTPRICE]+ " counter "+itr);
        }
        */
        return priceList[itr][DAYLASTPRICE];
      } 
    }
    return 0;
}
  
function    GetDate_YYYYMMDD_withDash() {
     let myDate = new Date();
     let date = myDate.getDate();
     if (date < 10) {date = "0" + date;}
     let month = myDate.getMonth();
     if (month+1 < 10) {month = "0" + (month+1);} else {month++;}
     let year = myDate.getFullYear();
     let date_key = year + "-" + month + "-" + date;   
     return date_key;
  }

function SeperateRealizedTransactions(symb, txns, dates, stk_tx_cnt) {
  let stockTx = {
                  txns: [],
                  dates: [],
                  stkcnt: [],
                  r_txns: [],
                  r_dates: [],
                  r_stkcnt: []
                };
                
  let stockFinalTx = {
                        txns: [],
                        dates: [],
                        stkcnt: [],
                        r_txns: [],
                        r_dates: [],
                        r_stkcnt: []
                      };
  
  let i=0;              
  for(;i<stk_tx_cnt.length-1;i++) {
    
    if (stk_tx_cnt[i] < 0) {
      // Sell Transaction only in realized array for now
      stockTx.txns[i] = stockTx.stkcnt[i] = 0;
      stockTx.dates[i] = undefined;
      stockTx.r_txns[i] = txns[i];
      stockTx.r_dates[i] = dates[i];
      stockTx.r_stkcnt[i] = stk_tx_cnt[i];
    
      
    } else if (stk_tx_cnt[i] > 0) {
      // Buy transactions only in unrealized array for now
      stockTx.r_txns[i] = stockTx.r_stkcnt[i] = 0;
      stockTx.r_dates[i] = undefined;
      stockTx.txns[i] = txns[i];
      stockTx.dates[i] = dates[i];
      stockTx.stkcnt[i] = stk_tx_cnt[i];
      
    }
  }
  
  // add the last transaction (sell at today's market rate) to unrealized array
  stockTx.r_txns[i] = stockTx.r_stkcnt[i] = 0;
  stockTx.r_dates[i] = undefined;
  stockTx.txns[i] = txns[i];
  stockTx.dates[i] = dates[i];
  stockTx.stkcnt[i] = stk_tx_cnt[i];
  

  for(let itr=0; itr<stk_tx_cnt.length-1;itr++) {
    
    let stkctr = stk_tx_cnt[itr];

    if(stk_tx_cnt[itr] < 0) {
      
        // sell transaction 
        for (let itr2=0; itr2 < stockTx.stkcnt.length && itr2 < itr; itr2++) {
        
          let average_value_per_share = stockTx.txns[itr2]/stockTx.stkcnt[itr2];
         
          if (stockTx.stkcnt[itr2] === 0) {

            continue;
 
          } else if (stockTx.stkcnt[itr2] >= Math.abs(stkctr)) {
            
            // add realized tx to 2nd array
            stockTx.r_stkcnt[itr2] += (-stkctr);
            stockTx.r_txns[itr2] += (average_value_per_share*(-stkctr));
            stockTx.r_dates[itr2] = stockTx.dates[itr2];
            
           // update unrealized buy transaction
           stockTx.stkcnt[itr2] += stkctr;
           
           if (stockTx.stkcnt[itr2] === 0) {
             stockTx.txns[itr2] = 0;
             stockTx.dates[itr2] = undefined;
           } else {
             stockTx.txns[itr2] = average_value_per_share*stockTx.stkcnt[itr2];
           }
           stkctr = 0;
           break;
           
         } else {
           // add the matched buy tx to 2nd array of realized tx & continue
           stockTx.r_stkcnt[itr2] += stockTx.stkcnt[itr2];
           stockTx.r_dates[itr2] = stockTx.dates[itr2];
           stockTx.r_txns[itr2] += stockTx.txns[itr2];
           
  
           stkctr += stockTx.stkcnt[itr2];

           if (stkctr === 0) {
             // ideally shouldn't be
             console.log("don't come here");
             break;
           }
           
           // clear buy tx as it is moved to realized array
           stockTx.stkcnt[itr2]=0;
           stockTx.txns[itr2]=0;
           stockTx.dates[itr2]=undefined;
         }
       }
       
    } else if (stk_tx_cnt[itr] > 0) {
      // buy transaction 
      continue;
      
    } else {
      // 
      alert("stock count for a transaction cannot be zero" + symb);
      break;
    }

   // if(itr===6) { break; }
  }
  
  //cleanTheArrays
  let j = 0;
  let k = 0;
  for (i=0;i<stk_tx_cnt.length;i++) {
    
    if(stockTx.stkcnt[i] !== 0) {
     stockFinalTx.stkcnt[j] = stockTx.stkcnt[i];
     stockFinalTx.dates[j] = stockTx.dates[i];
     stockFinalTx.txns[j] = stockTx.txns[i];
     j++;
    }
    
    if(stockTx.r_stkcnt[i] !== 0) {
     stockFinalTx.r_stkcnt[k] = stockTx.r_stkcnt[i];
     stockFinalTx.r_dates[k] = stockTx.r_dates[i];
     stockFinalTx.r_txns[k] = stockTx.r_txns[i];
     k++;
    }
    
  }
  
  return stockFinalTx;
}




function   ReadICICIDirectTransactionFile(table) {

    let index = 1;
    let portfolio = [];
    let myDate = new Date();
    let stockID = 0;
    //table reader
    const STKSYMB=2;
    const STKNAME=1;
    const TXDATE=12;
    const TXTYPE=3;
    const STKQTY=4;
    const STKPRICE=15;
    let stockYestPrice = undefined;
    let pT = {
               txns: [],
               dates: [], 
               ur_txns : [],
               ur_dates : [],
               ur_stkcnt : [],
               r_txns : [],
               r_dates : [],
               r_stkcnt : []
              };
    let ptitrol = 0;
    let ptitrur = 0;
    let ptitrr = 0;
    
    for(let itr=0;index<table.length;index++, itr++) {
     
      let symb = table[index][STKSYMB];
 //     let date_store = undefined;
      let stock_tx_count = [];
      let txns = [];
      let dates = [];
      let stkcnt = 0; 
      let stockObj = { 
                       id: 0,
                       symbol: "Adani",
                       stockname: "Adani Ports",
                       stockcount: 0,
                       avgcostprice : 0,
                       currentmarketprice : 0,
                       unrealizedprofit : 0,
                       xirr_unrealized : 0,
                       period: 0,
                       absolutereturn: 0,
                       xirr_overall : 0,
                       xirr_realized : 0
                     };
      let stockTransactions = undefined;


      // PENDING : merge transactions if on same date and same type of tx
      // PENDING : create a stock tx object and use that instead of seprate arrays
      
      stockObj.stockname = table[index][STKNAME];
      
      for (let itr2=0;index<table.length;itr2++,index++) {
        
        let new_date = table[index][TXDATE]; // need to be translated
        let tx_stk_count = (table[index][TXTYPE]==="Buy"?table[index][STKQTY]:-table[index][STKQTY]);
        let tx_value = GetTransactionValue(table[index]);

        
        if (symb === table[index][STKSYMB]) {
          
          // combine transactions done on same date
          /* -- not combining tx 
          if (date_store !== undefined && itr2 !== 0 && date_store === new_date) {
            itr2--;
            txns[itr2] += tx_value;
            stock_tx_count[itr2] += tx_stk_count;
          } else {
          */
            txns[itr2] = tx_value;
            dates[itr2] = TranslateExcelDate(new_date);
            stock_tx_count[itr2] = tx_stk_count;
        //  date_store = new_date;
         // }
          
          // count the available stocks of a particular company
          stkcnt += tx_stk_count;
          
          // if end of table reached, so add the tx for current stock price and close the tx list
          if (index === table.length-1) {
            let NSEStockCode = table[index][STKSYMB];
            if(NSEStockCode === undefined) {
              console.log("Error: "+table[index][STKSYMB]+" NSE code is not available");
              txns[itr2+1] = 0;
            } else {
              if(priceList !== undefined) {
                // if (symb === "INE412U01017") { console.log("the end : PriceList is defined"); }
                stockYestPrice = findYestPrice(table[index][STKSYMB]);
                txns[itr2+1] = stockYestPrice*stkcnt;
              } else {
                // console.log("shouldn't come here");
                txns[itr2+1] = table[index][STKPRICE]*stkcnt;
              }
            }
            dates[itr2+1] = myDate; 
            stock_tx_count[itr2+1] = -stkcnt;
          }
        } else {
          // stock of different company found, so add the tx for current stock price and close the tx list
          index--;
          let NSEStockCode = table[index][STKSYMB];
          if(NSEStockCode === undefined) {
            console.log("Error: "+table[index][STKSYMB]+" NSE code is not available");
            txns[itr2] = 0;
          } else {
            if(priceList !== undefined) {
                stockYestPrice = findYestPrice(table[index][STKSYMB]);
                txns[itr2] = stockYestPrice*stkcnt;
                //if (symb === "INE412U01017") { console.log("next stock : PriceList is defined : code= "+code+" count: "+stkcnt); }
              } else {
                //console.log("shouldn't come here");
                txns[itr2] = table[index][STKPRICE]*stkcnt;
              }
          }
          dates[itr2] = myDate;
          stock_tx_count[itr2] = -stkcnt;
          break;
        }
      }
     
     
     // bifurcate realized and unrealized transactions
     stockTransactions = SeperateRealizedTransactions(symb, txns, dates, stock_tx_count);

     // copy all portfolio transaction values
     for(let i=0;i<stock_tx_count.length;ptitrol++,i++) {
       pT.txns[ptitrol] = txns[i];
       pT.dates[ptitrol] = dates[i];
     }
     for(let i=0;i<stockTransactions.stkcnt.length;i++,ptitrur++) {
       pT.ur_txns[ptitrur] = stockTransactions.txns[i];
       pT.ur_dates[ptitrur] = stockTransactions.dates[i];
       pT.ur_stkcnt[ptitrur] = stockTransactions.stkcnt[i];
     }
     for(let i=0;i<stockTransactions.r_stkcnt.length;i++,ptitrr++) {
       pT.r_txns[ptitrr] = stockTransactions.r_txns[i];
       pT.r_dates[ptitrr] = stockTransactions.r_dates[i];
       pT.r_stkcnt[ptitrr] = stockTransactions.r_stkcnt[i];
     }

/*
     if (symb === "INE528G01027") {
       console.log("txns : "+txns+"\n dates: "+dates+"\n stock tx count "+stock_tx_count);
       console.log("Unrealized stockTransactions : "+stockTransactions.txns+stockTransactions.dates+stockTransactions.stkcnt);
       console.log("Realized stockTransactions : "+stockTransactions.r_txns+stockTransactions.r_dates+stockTransactions.r_stkcnt);
     }
*/

      stockObj.symbol = symb;
      stockID++;
      stockObj.id = stockID;
      stockObj.stockcount = stkcnt;
      stockObj.xirr_overall = GetXIRR(symb,txns,dates);
      
      //Get the period for unrealized transactions
      let stock_cost=0;
      if (stockTransactions.dates.length !== 0) {
        let lastDateIndex = stockTransactions.dates.length - 1;
        stockObj.period = precisionRound((stockTransactions.dates[lastDateIndex] - stockTransactions.dates[0])/(1000*60*60*24*365), 2);
        for(let i=0; i< stockTransactions.stkcnt.length - 1; i++) {
          stock_cost += stockTransactions.txns[i];
        }
        if (stkcnt !== 0) {
          stockObj.avgcostprice = precisionRound(-stock_cost/stkcnt,2);
        } 
      } 
      
      let profit = (stockYestPrice*stkcnt) + stock_cost
      stockObj.unrealizedprofit = precisionRound(profit, 0);
      
      if (stock_cost !== 0 && stkcnt !== 0) {
        stockObj.absolutereturn = precisionRound((stockObj.unrealizedprofit*100/ (-stock_cost)),2);
        stockObj.xirr_unrealized = GetXIRR(symb,stockTransactions.txns,stockTransactions.dates);     
      } else if (stkcnt !== 0) {
        stockObj.absolutereturn = "1000";
        stockObj.xirr_unrealized = "1000";
      }
 
      stockObj.currentmarketprice = stockYestPrice;
      
      if (stkcnt === 0) {
        stockObj.xirr_realized = stockObj.xirr_overall;
      } else if (stockTransactions.r_stkcnt.length !== 0) {
        stockObj.xirr_realized = GetXIRR(symb,stockTransactions.r_txns,stockTransactions.r_dates);
      } else {
        // if realized xirr = 0 then unrealized xirr = overall xirr
      }
      
      /*
      if (symb === 'INE018I01017') {
        console.log(stockObj);
      }
      */ 
      
      /*
      if (stkcnt !== 0 && stockObj.xirr_overall !== 0 && stockObj.xirr_unrealized !== 1000) {
        portfolio[itr] = stockObj;
      } else {
        itr--;
      } */
      
      portfolio[itr] = stockObj;
    }
    overallPortfolio = pT;
    
    return portfolio;
  }
  
  function AddPortfolioXIRR(portfolio) {
    let symb = "OVERALL";
    let stockObj = { 
                 id: 1000,
                 symbol: symb,
                 stockname: symb,
                 stockcount: "-",
                 avgcostprice: "-",
                 currentmarketprice : "-",
                 unrealizedprofit : 0,
                 xirr_unrealized : 0,
                 period: "-",
                 absolutereturn: 0,
                 xirr_overall : 0,
                 xirr_realized : 0
               };
               
       
      //Get the period for unrealized transactions
      /* incorrect logic as the transactions are not sorted
      let lastDateIndex = overallPortfolio.ur_dates.length - 1;
      let period = (overallPortfolio.ur_dates[lastDateIndex] - overallPortfolio.ur_dates[0])/(1000*60*60*24*365);
      console.log(overallPortfolio.ur_dates);
      stockObj.period = precisionRound(period, 2);
      */

      let stock_cost = 0;
      for(let i=0; i< overallPortfolio.ur_stkcnt.length; i++) {
        stock_cost += (overallPortfolio.ur_txns[i]>=0?0:overallPortfolio.ur_txns[i]);
      }
      
      let profit = 0;
      for(let i=0; i < portfolio.length; i++) {
        profit += portfolio[i].unrealizedprofit;
      }
      
      stockObj.xirr_overall = GetXIRR(symb,overallPortfolio.txns,overallPortfolio.dates);
      stockObj.unrealizedprofit = precisionRound(profit, 0);
      stockObj.absolutereturn = precisionRound((profit*100/ (-stock_cost)),2);


      stockObj.xirr_unrealized = GetXIRR(symb,overallPortfolio.ur_txns,overallPortfolio.ur_dates);
      stockObj.xirr_realized = GetXIRR(symb,overallPortfolio.r_txns,overallPortfolio.r_dates);

      portfolio.unshift(stockObj);

      return portfolio;
  }

  // merge sort implementation
  function mergeSort(arr)
  {
      if (arr.length < 2)
          return arr;
  
      var middle = parseInt(arr.length / 2, 10);
      var left   = arr.slice(0, middle);
      var right  = arr.slice(middle, arr.length);
  
      return merge(mergeSort(left), mergeSort(right));
  }
  
  function merge(left, right)
  {
      var result = [];
  
      while (left.length && right.length) {
          if (left[0].xirr_unrealized >= right[0].xirr_unrealized) {
              result.push(left.shift());
          } else {
              result.push(right.shift());
          }
      }
  
      while (left.length)
          result.push(left.shift());
  
      while (right.length)
          result.push(right.shift());
  
      return result;
  }
  
class Save extends React.Component {
  constructor(props) {
    super(props);
    this.handleSave = this.handleSave.bind(this);
  }
  
  handleSave(event) {
    console.log("Saving the file");
    event.preventDefault();
    
    /* make the worksheet */
    var ws = XLSX.utils.json_to_sheet(this.props.portfolio);
  
    /* add to workbook */
    var wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "XIRR");
  
    /* generate an XLSX file */
    XLSX.writeFile(wb, "myPortfolio.xlsx");
  }

  render() {
    return (<form onSubmit={this.handleSave}>
              <button type="submit">Save</button>
            </form>);
  }
}

export class FileInput extends React.Component {
  constructor(props) {
    super(props);
    this.state = {fileLoad: 0};
    this.handleSubmit = this.handleSubmit.bind(this);
    this.fileUpload = this.fileUpload.bind(this);
    this.readFile = this.readFile.bind(this);
  }
  
  fileUpload(state) {
    this.setState({fileLoad: state});
  }
  
  readFile(file1, filetype) {
    
      if (file1) {
      
      if (file1.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' || 
      file1.type === 'application/vnd.ms-excel' || file1.type === 'text/comma-separated-values') {
        // alert("EXCEL FILE");
        
        let reader = new FileReader();
       
        reader.onload = function(myFile) {
          let data = myFile.target.result;
          let workbook = XLSX.read(data, {type: 'binary'});
          let sheetName = workbook.SheetNames[0];
          //console.log("Sheet Name "+sheetName);
          
          let ws = workbook.Sheets[sheetName];
            
          // read XL file into 2-D array
          let table = XLSX.utils.sheet_to_json(ws, {header:1,raw:true}); 
          
          //console.log("Table "+table);
  
          if (filetype === 3) {
              for(let itr=0;itr<10;itr++) {
                GetMovieImage(itr,table[itr+1][0]);
              }
              console.log(movie_images);

            } else if (filetype === 2) {
               
                stock = ReadICICIDirectTransactionFile(table);
                
                stock = mergeSort(stock);
                
                stock = AddPortfolioXIRR(stock);
                
                //console.log(stock);
                
                // console.log(stock);
                
                //this.fileUpload(2);
                
                //console.log("stock loaded");

                /* let StockList = stock.map( element => element.id+", "+element.symbol+","+element.stockcount+","+element.xirr+" | ");
                document.getElementById("StockList").innerHTML = StockList; */
                /*
                let elements = stock.map((element) => {
                    return (<li key={element.id}>{element.stockname}</li>);
                });
                
                let StockList = <ul>{elements}</ul>;
                
                document.getElementById("StockList").innerHTML = StockList;
                */
                /*
                let top3 = FindTop3Stocks(stock);
                let tag = "myStock";
                
                for(let itr=0;itr<3;itr++) {
                  let newtag = tag + itr; 
                  document.getElementById(newtag).innerHTML = (itr+1) + ". " + top3[itr].stockname + " XIRR: " + top3[itr].xirr;
                }
                */
            } else if (filetype === 1) {
              
              priceList = table;
              // console.log("price loaded");
  
            } else {
              // console.log(table);
              alert("Invalid File Type passed");
            }
  
  /*
            let data = myFile.target.result;
            let workbook = XLSX.read(data, {type: 'binary'});
            let sheetName = workbook.SheetNames[0];
            let ws = workbook.Sheets[sheetName];
            
            // read XL file into 2-D array
            let table = XLSX.utils.sheet_to_json(ws, {header:1,raw:true});
  */
  
         
            // for passing value to XIRR calculator
         // let values = [];
  
          //  for(let ir=0;ir<table.length;ir++) {
          //    let obj = {};
           //   obj.Date = table[ir][0];
           //   obj.Flow = table[ir][1];
           //   values[ir] = obj;
           // }
            
  
            
            
              
          //  for(let R = 0; R <= 4; ++R) {
            //  let row = [];
          //    for(let C = 0; C <= 4; ++C) {
          //      let cell_address = {c:C, r:R};
           //      if an A1-style address is needed, encode the address
          //      let cell_ref = XLSX.utils.encode_cell(cell_address);
          //      console.log(workbook.Sheets[sheetName][cell_ref]);
          //    }
        //    }
            
          // for(let i=0;i<workbook.)
          //  console.log(workbook.Sheets[workbook.SheetNames[0]].A1);
          //  console.log(workbook.Strings);
          
          //  workbook.SheetNames.forEach(function(sheetName) {
              // Here is your object
          //    let XL_row_object = XLSX.utils.sheet_to_row_object_array(workbook.Sheets[sheetName],2);
         //     console.log(XL_row_object);
         //   });
          };
    
          reader.onerror = function(error) {
            console.log(error);
          };
    
        reader.readAsBinaryString(file1);
      
        
      } else if (file1.type === "application/x-zip-compressed" || file1.type === "application/zip") {
        
        // reading a zip file --- Yaaay!! 
        //console.log("Zip file submitted");
          
        let zipper = require("jszip");
        
        zipper.loadAsync(file1).then(function(zip) {
          
          zip.forEach(function (relativePath, zipEntry) {  // 2) print entries
             //console.log("zipEntry : "+zipEntry.name);
             // Read the contents of the 'Hello.txt' file
             zip.file(zipEntry.name).async("binarystring").then(function (data) {
             // data is "Hello World!"
             //console.log(data);
             let workbook = XLSX.read(data, {type: 'binary'});
             let sheetName = workbook.SheetNames[0];
             let ws = workbook.Sheets[sheetName];
    
             // read XL file into 2-D array
             priceList = XLSX.utils.sheet_to_json(ws, {header:1,raw:true}); 
             //console.log(priceList);
            });
          });
          
        }, function() {alert("Not a valid zip file")}); 
      } else {
        alert("invalid file type : neither excel nor zip : "+file1.type);
      }
   
    } else { 
        alert("Invalid file");
    }
    
  }
  /*
  readSingleFile(filelist1) {
    // let file1 = document.getElementById('fileinput').files[0];
    //Retrieve the first (and only!) File from the FileList object
    let file1 = filelist1.target.files[0]; 
    readFile(file1);
  }
    */ 


  componentDidUpdate(prevProps, prevState, snapshot) {
    if(this.timerID !== undefined) { clearInterval(this.timerID); }
  }


  handleSubmit(event) {
    event.preventDefault();
    
    let file1 = this.fileInput.files[0];
    let FILENAME = file1.name;
    if (FILENAME.search(PRICEKEY) !== -1) {
       this.fileUpload(1);
       this.readFile(file1,1);
    } else if (FILENAME.search(PORTFOLIOKEY) !== -1) {
       if(this.state.fileLoad >= 1 && this.state.fileLoad < 10) {
         this.readFile(file1,2);
         this.timerID = setInterval(() => {this.fileUpload(this.state.fileLoad + 1);}, 1000); 
       }
       else {
         alert("Load Price File first!!");
       }
    } else if (FILENAME.search(MOVIEKEY) !== -1) {
        // needed to be managed differently!! 
        console.log("movies_file_loading");
        this.readFile(file1,3);
        this.timerID = setInterval(() => {this.fileUpload(10);}, 5000); 
    } else {
      alert("Invalid file type");
    }
  }
  
  render() {
    
  const header_row = { id: 0,
                       symbol: "Stock Symbol",
                       stockname: "Stock Name",
                       stockcount: "Qty",
                       avgcostprice: "Avg Cost Price",
                       currentmarketprice: "Current Mkt Price",
                       unrealizedprofit: "Unrealized Profit",
                       xirr_unrealized: "XIRR(%)",
                       period: "Holding Period(Yrs)",
                       absolutereturn: "Absolute Return(%)",
                       xirr_overall: "XIRR Overall(%)",
                       xirr_realized: "XIRR Realized(%)"
                     };
    
    let a = (stock===undefined)?0:stock;
    let showSaveStyle="showSaveStyle_hide";
    if (a !== 0 && this.state.fileLoad !== 10) {
      showSaveStyle="showSaveStyle";
    }
    
    let b = this.state.fileLoad;
    let msg = "Upload Movie Ratings File"; 
    let nse_feed_url = "";
    let showlinkClass = "urlstyle_hide";

    
    let cards_stack = <br/>;
    if (this.props.type === "stock") {
      if (b === 0) {
        nse_feed_url = GetTodayBhavCopy();
        msg = "Upload Price List. Get Latest Price List ";
        showlinkClass = "urlstyle";
      } else if (b === 1) {
        msg = "Price file loaded. Upload your Portfolio ";
        showlinkClass = "urlstyle_hide";
      } else if (b > 1 && b < 10) {
        msg = "Portfolio file "+b+" Loaded. Do you want to upload another Portfolio? ";
        showlinkClass = "urlstyle_hide";
      } else {
        console.log(b);
        msg = "Error";
      }
      cards_stack = <div>
                      <br/>
                      <ol className="cards">
                        <Row stockObj={header_row}/>
                      </ol>
                      <div className="cardcontainerstyle">
                        <Card stock={a}/>
                      </div>
                    </div>;
    } else if (this.props.type === "movie" && this.state.fileLoad === 10) {
      if (movie_images[0] !== undefined) {
        console.log("movies loading");
        let images = movie_images.map((movie_image) => <a href={movie_image.href} key ={movie_image.id}>
                                                        <img src={movie_image.url} alt="Movie" className="noborder" frameBorder="0" allowFullScreen />
                                                      </a>);
        cards_stack = <div className="movie_box movie_cards">
                       {images}
                      </div>;
      }
    }
    
    return (
      <div>
        <form className="fileinputstyle" onSubmit={this.handleSubmit}>
          <label>
            {msg}
            <a className={showlinkClass} href={nse_feed_url}>
              here
            </a>
            <br/>
            <br/>
            <input
              type="file"
              ref={input => {
                this.fileInput = input;
              }}
            />
          </label>
          <button type="submit">Submit</button>
        </form>
        {cards_stack}
        <div className={showSaveStyle}>
          <Save portfolio={a}/>
        </div>
      </div>
    )
  }
}



export default FileInput;