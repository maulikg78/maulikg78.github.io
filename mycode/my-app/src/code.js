let api_key='e16685610255dd6967f3421eef7ea3bc';
let url_start = 'https://api.themoviedb.org/3/find/';
let url_end = '?api_key=' + api_key + '&language=en-US&external_source=imdb_id';
let posterpath = "";
let url2 = 'http://image.tmdb.org/t/p/original';
let imdb_ref = 'http://www.imdb.com/title/';


async function GetMovieImage(id, movie_key) {
  try {
   let url = url_start + movie_key + url_end;
   console.log(url);
   let response = await fetch(url);
   
   if(response.ok) {
     let jsonResponse = await response.json();
     let imageMap = "myImage" + id;
     let imageLink = "imageLink" + id;
     console.log(imageMap);
     posterpath = await jsonResponse.movie_results[0].poster_path;
     let url3 = url2 + posterpath;
     console.log(url3);
     document.getElementById(imageMap).src = url3;
     document.getElementById(imageLink).href = imdb_ref + movie_key;
     return jsonResponse;
   }
   throw new Error('Request failed');
  } catch(error) {
    console.log(error);
  }
}


function GetNPV(values, dates, rate) {
  let npv=0;
  let date1 = new Date(dates[0]);
  for(let itr=0;itr<values.length;itr++) {
     let date2 = new Date(dates[itr]);
     let datediff = (date2 - date1)/(1000*60*60*24);
     let value = ( values[itr] / Math.pow(1+rate,datediff/365) );
     npv += value;
  }
  return npv;
}

function precisionRound(number, precision) {
  let factor = Math.pow(10, precision);
  return Math.round(number * factor) / factor;
}

function GetXIRR(values, dates) {
  let rate = 0;
  let precisenpv = undefined;
  let previousnpv = undefined;
  let ctr = 0;
  let itr=0;
  for (; itr < 10000; itr++) {
    let npv = GetNPV(values, dates, rate);
    precisenpv = precisionRound(npv,2);
    
    if (precisenpv == 0) { 
      break; 
    } else if (precisenpv < 0 ) {
      if (Math.abs(ctr) > 5 && ctr > 0 ) {
        rate -= 0.01;
        break;
      } else { ctr--; rate -= 0.01;} 
    } else if (precisenpv > 0) {
      if (Math.abs(ctr) > 5 && ctr < 0) {
        rate += 0.01;
        break;
      } else { ctr++; rate += 0.01;}
    }
  }
  return precisionRound(rate,2);
}

function GetDate_YYYYMMDD_withDash() {
   let myDate = new Date();
   let date = myDate.getDate();
   if (date < 10) {date = "0" + date;}
   let month = myDate.getMonth();
   if (month+1 < 10) {month = "0" + (month+1);} else {month++;}
   let year = myDate.getFullYear();
   let date_key = year + "-" + month + "-" + date;   
   return date_key;
}
/*
async function GetStockQuotes(id, stockcode) {
   try {
   let av_api_key = "2O5D20VZB8TTSDJR";
 //  https://www.alphavantage.co/query?function=TIME_SERIES_INTRADAY&symbol=MSFT&interval=1min&apikey=demo
   let av_url_start = "https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=";
   let av_url_end = "&interval=1min&apikey="+av_api_key;
   
   let url = av_url_start+stockcode+av_url_end;
   
   let date_key = GetDate_YYYYMMDD_withDash();
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
*/

function GetTransactionValue(tx) {
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

function GetDate_YYYYMMDD_withDash2(myDate) {

   let date = myDate.getDate();
   if (date < 10) {date = "0" + date;}
   let month = myDate.getMonth();
   if (month+1 < 10) {month = "0" + (month+1);} else {month++;}
   let year = myDate.getFullYear();
   let date_key = year + "-" + month + "-" + date;   
   return date_key;
}

async function GetEODStockPrice(symbol,myDate) {
  let quandl_apikey = "SLHTVNT26xmwH3av_f-5";
  let date = GetDate_YYYYMMDD_withDash2(myDate);
  let url = "https://www.quandl.com/api/v3/datasets/NSE/"+symbol+"?start_date="+date+"&end_date="+date+"&api_key="+quandl_apikey;
  
  try {
    let response = await fetch(url);
    
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

function ReadICICIDirectTransactionFile(table) {
    let index = 1;
    let portfolio = [];
    let myDate = new Date();
    let tempDate = myDate; 
    let myHour = myDate.getHours();   
      
    if (myHour <= 16) { myDate.setDate(tempDate.getDate() - 1); }
    
    for(let itr=0;index<table.length;index++, itr++) {
     
      let symb = table[index][0];
      let txns = [];
      let dates = [];
      let stkcnt = 0; 
      let stockObj = { symbol: "Adani",
                       stockname: "Adani Ports",
                       stockcount: 0,
                       xirr: 1.5
                     };
       
      
      stockObj.stockname = table[index][1];
      for (let itr2=0;index<table.length;itr2++,index++) {
        
        if (symb == table[index][0]) {
          txns[itr2] = GetTransactionValue(table[index]);
          dates[itr2] = TranslateExcelDate(table[index][12]); // need to be translated
          stkcnt += (table[index][3]=="Buy"?table[index][4]:-table[index][4]);
          if (index == table.length-1) {
            let NSEStockCode = table[index][14];
            if(NSEStockCode == undefined) {
              console.log("Error: "+table[index][1]+" NSE code is not available");
              txns[itr2+1] = 0;
              dates[itr2+1] = myDate;
            } else {
              txns[itr2+1] = setTimeout(GetEODStockPrice(NSEStockCode,myDate), 50); 
              dates[itr2+1] = myDate; 
            }
          }
        } else {
          index--;
          let NSEStockCode = table[index][14];
          if(NSEStockCode == undefined) {
            console.log("Error: "+table[index][1]+" NSE code is not available");
            txns[itr2] = 0;
            dates[itr2] = myDate;
          } else {
            txns[itr2] = setTimeout(GetEODStockPrice(NSEStockCode,myDate), 50); 
            dates[itr2] = myDate; 
          }
          break;
        }
      }
      
      stockObj.symbol = symb;
      stockObj.stockcount = stkcnt;
      stockObj.xirr = GetXIRR(txns,dates);
      portfolio[itr] = stockObj; 
    }
    return portfolio;
}

function FindTop3Stocks(stock) {
  let obj,obj1,obj2,obj3 = undefined;
  let object = [];
  let itr=0;
  
  obj1=obj2=obj3=stock[0];
  obj1.xirr = obj2.xirr = obj3.xirr = 0;
  
  console.log(itr);

  for(;itr<stock.length;itr++) {
    
    
    if (stock[itr].stockcount <= 0) { continue; }
    
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
  console.log(object);
  return object;
}


// Check for the various File API support.
if (window.File && window.FileReader && window.FileList && window.Blob) {
    // Great success! All the File APIs are supported.
} else {
  alert('The File APIs are not fully supported in this browser.');
}

function readFile(file1) {
      if (file1) {
      
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
          
          // for passing value to XIRR calculator
          /* let values = [];

          for(let ir=0;ir<table.length;ir++) {
            let obj = {};
            obj.Date = table[ir][0];
            obj.Flow = table[ir][1];
            values[ir] = obj;
          }
             */  
          
          if (sheetName == "Movies") {
            for(let itr=0;itr<3;itr++) {
              GetMovieImage(itr,table[itr+1][0]);
            }  
          } else if (sheetName == "Stocks") {
            for(let itr=0;itr<3;itr++) {
              let stockCode = "NSE:"+table[itr+1][0];
              console.log(stockCode);
              GetStockQuotes(itr, stockCode);
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
              let rate = GetXIRR(values,dates);
              console.log(rate*100 + "%");
          } else if (sheetName == "Transactions") {

              let stock = ReadICICIDirectTransactionFile(table);
              let top3 = FindTop3Stocks(stock);
              let tag = "myStock";
              
              for(let itr=0;itr<3;itr++) {
                let newtag = tag + itr; 
                document.getElementById(newtag).innerHTML = (itr+1) + ". " + top3[itr].stockname + " XIRR: " + top3[itr].xirr;
              }
              
          } else {
            console.log(table);
            alert("Sheet Name is not Portfolio/Transactions/Stocks/Movies")
          }
          
          /*
            
          for(let R = 0; R <= 4; ++R) {
          //  let row = [];
            for(let C = 0; C <= 4; ++C) {
              let cell_address = {c:C, r:R};
               if an A1-style address is needed, encode the address
              let cell_ref = XLSX.utils.encode_cell(cell_address);
              console.log(workbook.Sheets[sheetName][cell_ref]);
            }
          }
          
        // for(let i=0;i<workbook.)
        //  console.log(workbook.Sheets[workbook.SheetNames[0]].A1);
        //  console.log(workbook.Strings);
        
        /*  workbook.SheetNames.forEach(function(sheetName) {
            // Here is your object
            let XL_row_object = XLSX.utils.sheet_to_row_object_array(workbook.Sheets[sheetName],2);
            console.log(XL_row_object);
          }); */
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

function readSingleFile(filelist1) {
    // let file1 = document.getElementById('fileinput').files[0];
    //Retrieve the first (and only!) File from the FileList object
    let file1 = filelist1.target.files[0]; 
    readFile(file1);
}


document.getElementById('fileinput').addEventListener('change', readSingleFile, false);



/* For carousel */
var slideIndex = 1;
showSlides(slideIndex);

// Next/previous controls
function plusSlides(n) {
  showSlides(slideIndex += n);
}

// Thumbnail image controls
function currentSlide(n) {
  showSlides(slideIndex = n);
}

function showSlides(n) {
  var i;
  var slides = document.getElementsByClassName("mySlides");
  var dots = document.getElementsByClassName("dot");
  if (n > slides.length) {slideIndex = 1} 
  if (n < 1) {slideIndex = slides.length}
  for (i = 0; i < slides.length; i++) {
      slides[i].style.display = "none"; 
  }
  for (i = 0; i < dots.length; i++) {
      dots[i].className = dots[i].className.replace(" active", "");
  }
  slides[slideIndex-1].style.display = "block"; 
  dots[slideIndex-1].className += " active";
}
