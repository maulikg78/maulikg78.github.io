import React from 'react';
import * as XLSX from 'xlsx';
import Card from './Card';
import './Card.css';
// import zip from 'jszip';

let stock=undefined;
let priceList=undefined;

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
    if (precisenpv == 0) { 
      break; 
    } else if (precisenpv < 0 ) {
      rate -= increment;
    } else if (precisenpv > 0) {
      rate += increment; 
    }
    if (precisenpv == prepreviousnpv) {
      break;
    }
  }
  
  return precisionRound(rate, precision);
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
    
    if (tx[TXTYPE] == "Buy") {
      value = -(tx_val + charges);
    } else if (tx[TXTYPE] == "Sell") {
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

      stockTx.txns[i] = stockTx.stkcnt[i] = 0;
      stockTx.dates[i] = undefined;
      stockTx.r_txns[i] = txns[i];
      stockTx.r_dates[i] = dates[i];
      stockTx.r_stkcnt[i] = stk_tx_cnt[i];
    
      
    } else if (stk_tx_cnt[i] > 0) {

      stockTx.r_txns[i] = stockTx.r_stkcnt[i] = 0;
      stockTx.r_dates[i] = undefined;
      stockTx.txns[i] = txns[i];
      stockTx.dates[i] = dates[i];
      stockTx.stkcnt[i] = stk_tx_cnt[i];
      
    }
  }
  
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
      alert("stock count for a transaction cannot be zero");
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
    let stocks = 0;
    //table reader
    const STKSYMB=2;
    const STKNAME=1;
    const TXDATE=12;
    const TXTYPE=3;
    const STKQTY=4;
    const STKPRICE=15;

    for(let itr=0;index<table.length;index++, itr++) {
     
      let symb = table[index][STKSYMB];
      let stock_tx_count = [];
      let txns = [];
      let dates = [];
      let stkcnt = 0; 
      let stockObj = { 
                       id: 0,
                       symbol: "Adani",
                       stockname: "Adani Ports",
                       stockcount: 0,
                       xirr_overall : 0,
                       xirr_realized : 0,
                       xirr_unrealized : 0
                     };
      let stockTransactions = {
                                txns: [],
                                dates: [],
                                stkcnt: [],
                                txns2: [],
                                dates2: [],
                                stkcnt2: []
                              };

      // PENDING : merge transactions if on same date and same type of tx
      // PENDING : create a stock tx object and use that instead of seprate arrays
      
      stockObj.stockname = table[index][STKNAME];
      for (let itr2=0;index<table.length;itr2++,index++) {
        
        if (symb == table[index][STKSYMB]) {
          txns[itr2] = GetTransactionValue(table[index]);
          dates[itr2] = TranslateExcelDate(table[index][TXDATE]); // need to be translated
          stock_tx_count[itr2] = (table[index][TXTYPE]=="Buy"?table[index][STKQTY]:-table[index][STKQTY]);
          stkcnt += stock_tx_count[itr2];
          
          if (index == table.length-1) {
            let NSEStockCode = table[index][STKSYMB];
            if(NSEStockCode == undefined) {
              console.log("Error: "+table[index][STKSYMB]+" NSE code is not available");
              txns[itr2+1] = 0;
            } else {
              if(priceList !== undefined) {
                // if (symb === "INE412U01017") { console.log("the end : PriceList is defined"); }
                var code = table[index][STKSYMB];
                txns[itr2+1] = findYestPrice(code)*stkcnt;
              } else {
                // console.log("shouldn't come here");
                txns[itr2+1] = table[index][STKPRICE]*stkcnt;
              }
            }
            dates[itr2+1] = myDate; 
            stock_tx_count[itr2+1] = -stkcnt;
          }
        } else {
          index--;
          let NSEStockCode = table[index][STKSYMB];
          if(NSEStockCode == undefined) {
            console.log("Error: "+table[index][STKSYMB]+" NSE code is not available");
            txns[itr2] = 0;
          } else {
            if(priceList !== undefined) {
                var code = table[index][STKSYMB];
                txns[itr2] = findYestPrice(code)*stkcnt;
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

     // console.log("stock"+symb+"transactions"+txns+"dates"+dates);
      
      stockObj.symbol = symb;
      stocks++;
      stockObj.id = stocks;
      stockObj.stockcount = stkcnt;
      
      // console.log("Stock details" + stockObj.stockname+" "+symb+" "+stocks+" "+stkcnt);
      
      if (stkcnt > 0) {
        stockObj.xirr_overall = GetXIRR(symb,txns,dates);
      }
      stockObj.xirr_unrealized = GetXIRR(symb,stockTransactions.txns,stockTransactions.dates);
      stockObj.xirr_realized = GetXIRR(symb,stockTransactions.r_txns,stockTransactions.r_dates);
      
      if (stkcnt !== 0 && stockObj.xirr_overall !== 0) {
        portfolio[itr] = stockObj;
      } else {
        itr--;
      }
    }
    return portfolio;
  }

  // merge sort implementation
  function mergeSort(arr)
  {
      if (arr.length < 2)
          return arr;
  
      var middle = parseInt(arr.length / 2);
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
  
export class FileInput extends React.Component {
  constructor(props) {
    super(props);
    this.state = {stockavailable : false};
    this.handleSubmit = this.handleSubmit.bind(this);
    this.stateUpdate = this.stateUpdate.bind(this);
  }
  
  stateUpdate() {
    // console.log("state is changing");
    this.setState({stockavailable: true});
  }
  
  readFile(file1) {
    
      const PRICEKEY="bhav";
      const PORTFOLIOKEY="PortFolio";
      const MOVIEKEY="movies";
      
      
      
      if (file1) {
      
      const FILENAME=file1.name;
      
      console.log("Type of file name "+FILENAME+" file type "+file1.type);
      
      if (file1.type == 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' || 
      file1.type == 'application/vnd.ms-excel') {
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
  
          if (FILENAME.search(MOVIEKEY) !== -1) {
              for(let itr=0;itr<3;itr++) {
                /* GetMovieImage(itr,table[itr+1][0]);*/
              }  

            } else if (FILENAME.search(PORTFOLIOKEY) !== -1) {
  
                stock = ReadICICIDirectTransactionFile(table);
                
                stock = mergeSort(stock);
                
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
            } else if (FILENAME.search(PRICEKEY) !== -1) {
              
              priceList = table;
              // console.log("price loaded");
  
            } else {
              // console.log(table);
              alert("Sheet Name is not Portfolio/Transactions/Stocks/Movies");
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
      }
      else {
        alert("Invalid file type");
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
    //console.log("yo ho component did update");
    if(this.timerID !== undefined) { clearInterval(this.timerID); }
  }

  handleSubmit(event) {
    event.preventDefault();
    this.readFile(this.fileInput.files[0]);
    if(this.timerID !== undefined) { clearInterval(this.timerID); }
    this.timerID = setInterval(() => this.stateUpdate(), 5000);
   }

  render() {
    var a=undefined;
    if (stock === undefined) { 
      //console.log("stocks missing");
      a = 0;
    } else {
     // console.log("stocks found");
      a = stock;
    }
    
    return (
      <div className="cardcontainerstyle">
        <form onSubmit={this.handleSubmit}>
          <label>
            Upload file:
            <input
              type="file"
              ref={input => {
                this.fileInput = input;
              }}
            />
          </label>
          <br />
          <button type="submit">Submit</button>
        </form>
        <Card color="#FF6663" stock={a}/>
      </div>
    )
  }
}

export default FileInput;