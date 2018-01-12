// Check for the various File API support.
  if (window.File && window.FileReader && window.FileList && window.Blob) {
      // Great success! All the File APIs are supported.
  } else {
    alert('The File APIs are not fully supported in this browser.');
  }

  function readSingleFile(filelist1) {
     
     // let file1 = document.getElementById('fileinput').files[0];
      //Retrieve the first (and only!) File from the FileList object
      let file1 = filelist1.target.files[0]; 
      console.log(file1);
  
      if (file1) {
        
        if(file1.type == 'text/plain') {
          alert("TEXT FILE");
          // read ; and newline seperated text file 
          let reader = new FileReader();
          reader.onload = function(myFile) { 
           
           let contents = myFile.target.result;
    	     
           
           for (let i=0,j=0;j<2;j++) {
               table[j] = contents.substring(i, contents.indexOf(";",i));
               i += table[j].length + 2;
            }
            console.log("read text file");
           
          
           document.getElementById("demo").innerHTML = table[0] + table[1];
             return table;
          };
          
          reader.readAsText(file1);
          
        } else if (file1.type == 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') {
          alert("EXCEL FILE");
          
          let reader = new FileReader();
          reader.onload = function(myFile) {

            let data = myFile.target.result;
            let workbook = XLSX.read(data, {type: 'binary'});
            let sheetName = workbook.SheetNames[0];
            let ws = workbook.Sheets[sheetName];
            
            // read XL file into 2-D array
            table = XLSX.utils.sheet_to_json(ws, {header:1,raw:true});
            console.log("read excel file");
            return table;
            
            // for passing value to XIRR calculator
            /* let values = [];

            for(let ir=0;ir<table.length;ir++) {
              let obj = {};
              obj.Date = table[ir][0];
              obj.Flow = table[ir][1];
              values[ir] = obj;
            }
               */        

           //console.log(table);
           //document.getElementById("demo").innerHTML = xirr;

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
    } else { 
        alert("Failed to load file");
    }
  }
