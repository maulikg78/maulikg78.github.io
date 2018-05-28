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
  
  for (; itr < (10/increment); itr++) {
    let npv = GetNPV(symbol, values, dates, rate);
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
    let tx_val = tx[4]*tx[5];
    let charges = tx[6] + tx[7] + tx[8];
    
    if (tx[3] == "Buy") {
      value = -(tx_val + charges);
    } else if (tx[3] == "Sell") {
      value = tx_val - charges; 
    } else {
      console.log("Error");
    }
    return value;
  }

function TranslateExcelDate(date) {
    return new Date((date - (25567+2))*86400*1000);
  }

function findYestPrice(stkcode) {

    for(let itr=0; itr<priceList.length; itr++) {
      if (priceList[itr][0] === stkcode) {
        return priceList[itr][6];
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

function   ReadICICIDirectTransactionFile(table) {

    let index = 1;
    let portfolio = [];
    let myDate = new Date();
    let stocks = 0;
    const stksymb=14;

    
    for(let itr=0;index<table.length;index++, itr++) {
     
      let symb = table[index][stksymb];
      let txns = [];
      let dates = [];
      let stkcnt = 0; 
      let stockObj = { 
                       id: 0,
                       symbol: "Adani",
                       stockname: "Adani Ports",
                       stockcount: 0,
                       xirr: 0
                     };

      
      stockObj.stockname = table[index][1];
      for (let itr2=0;index<table.length;itr2++,index++) {
        
        if (symb == table[index][stksymb]) {
          txns[itr2] = GetTransactionValue(table[index]);
          dates[itr2] = TranslateExcelDate(table[index][12]); // need to be translated
          stkcnt += (table[index][3]=="Buy"?table[index][4]:-table[index][4]);
          if (index == table.length-1) {
            let NSEStockCode = table[index][stksymb];
            if(NSEStockCode == undefined) {
              console.log("Error: "+table[index][stksymb]+" NSE code is not available");
              txns[itr2+1] = 0;
            } else {
              if(priceList !== undefined) {
                var code = table[index][stksymb];
                txns[itr2+1] = findYestPrice(code)*stkcnt;
              } else {
                txns[itr2+1] = table[index][15]*stkcnt;
              }
            }
            dates[itr2+1] = myDate; 
          }
        } else {
          index--;
          let NSEStockCode = table[index][14];
          if(NSEStockCode == undefined) {
            console.log("Error: "+table[index][stksymb]+" NSE code is not available");
            txns[itr2] = 0;
          } else {
            if(priceList !== undefined) {
                var code = table[index][stksymb];
                txns[itr2] = findYestPrice(code)*stkcnt;
              } else {
                txns[itr2] = table[index][15]*stkcnt;
              }
          }
          dates[itr2] = myDate; 
          break;
        }
      }
     
     // console.log("stock"+symb+"transactions"+txns+"dates"+dates);
      
      stockObj.symbol = symb;
      stocks++;
      stockObj.id = stocks;
      stockObj.stockcount = stkcnt;
      if (stkcnt > 0) {
        stockObj.xirr = GetXIRR(symb,txns,dates);
      }
      
      if (stkcnt !== 0 && stockObj.xirr !== 0) {
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
          if (left[0].xirr >= right[0].xirr) {
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
    console.log("state is changing");
    this.setState({stockavailable: true});
  }
  
  readFile(file1) {
      if (file1) {
        
      console.log(file1.type);
      
      if(file1.type == 'text/plain') {
        // alert("TEXT FILE");
        let reader = new FileReader();
        reader.onload = function(myFile) { 
         
         let contents = myFile.target.result;
  	     
         let str = [];
         for (let i=0,j=0;j<2;j++) {
             str[j] = contents.substring(i, contents.indexOf(";",i));
             i += str[j].length + 2;
          }
         
         document.getElementById("demo").innerHTML = str[0] + str[1];
        
        };
        
        reader.readAsText(file1);
        
      } else if (file1.type == 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') {
        // alert("EXCEL FILE");
        
        let reader = new FileReader();
        reader.onload = function(myFile) {
          let data = myFile.target.result;
          let workbook = XLSX.read(data, {type: 'binary'});
          let sheetName = workbook.SheetNames[0];
          let ws = workbook.Sheets[sheetName];
            
          // read XL file into 2-D array
          let table = XLSX.utils.sheet_to_json(ws, {header:1,raw:true});     
  
          if (sheetName == "Movies") {
              for(let itr=0;itr<3;itr++) {
                /* GetMovieImage(itr,table[itr+1][0]);*/
              }  
            } else if (sheetName == "Stocks") {
              for(let itr=0;itr<3;itr++) {
                let stockCode = "NSE:"+table[itr+1][0];
                console.log(stockCode);
               /* GetStockQuotes(itr, stockCode); */
              }  
            } else if (sheetName == "Portfolio") {
                let values=[];
                let dates=[];
                for(let itr1 = 0; itr1<table.length; itr1++) {
                    values[itr1] = table[itr1][0];
                    dates[itr1] = table[itr1][1];
                }
                console.log(values);
                console.log(dates);
                let rate = GetXIRR("abc",values,dates);
                console.log(rate*100 + "%");
            } else if (sheetName == "Transactions") {
  
                stock = ReadICICIDirectTransactionFile(table);
                
                stock = mergeSort(stock);
                
                console.log("stock loaded");

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
            } else if (sheetName == "BhavCopy") {
              
              priceList = table;
              console.log("price loaded");
  
            } else {
              console.log(table);
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
    console.log("yo ho component did update");
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
      console.log("stocks missing");
      a = 0;
    } else {
      console.log("stocks found");
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