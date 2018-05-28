//var React = require('react');
//var ReactDOM = require('react-dom');
var http = require('http');
var dt = require('./myfirstmodule');
var url = require('url');
var fs = require('fs');

http.createServer(function (request, response) {
    
    if(request.url === "/index"){
		sendFileContent(response, "./index.html", "text/html");
	}
	else if(request.url === "/"){
		response.writeHead(200, {'Content-Type': 'text/html'});
		response.write('<b>Hey there!</b><br /><br />This is the default response. Requested URL is: ' + request.url);
	}
	else if(/^\/[a-zA-Z0-9\/]*.js$/.test(request.url.toString())){
		sendFileContent(response, request.url.toString().substring(1), "text/javascript");
	}
	else if(/^\/[a-zA-Z0-9\/]*.css$/.test(request.url.toString())){
		sendFileContent(response, request.url.toString().substring(1), "text/css");
	}
	else if(/^\/[a-zA-Z0-9\/]*.png$/.test(request.url.toString())){
		sendFileContent(response, request.url.toString().substring(1), "image/png");
	}
    else if(/^\/[a-zA-Z0-9\/]*.jpg$/.test(request.url.toString())){
		sendFileContent(response, request.url.toString().substring(1), "image/jpeg");
	}
	else{
		console.log("Requested URL is: " + request.url);
		response.end();
	}
 }).listen(8080);

 //    response.writeHead(200, {'Content-Type': 'text/html'});
 //  response.write("The date and time are currently: " + dt.myDateTime());
 //   response.write(request.url);
 //   var q = url.parse(request.url, true).query;
 //  var txt = q.year + " " + q.month;
 //   response.end(txt);
//}).listen(8080);


function sendFileContent(response, fileName, contentType){

	fs.readFile(fileName, function(err, data){
		if(err){
			response.writeHead(404);
			response.write("Not Found!");
		}
		else{
			console.log(data);
			var top3 = [];
			var tag = "myStock";

            top3[0] = {stockname:'A', xirr:1.5};
            top3[1] = {stockname:'B', xirr:0.5};
            top3[2] = {stockname:'C', xirr:0.1};
            for(var itr=0;itr<3;itr++) {
                var newtag = tag + itr; 
              //  document.getElementById(newtag).innerHTML = (itr+1) + ". " + top3[itr].stockname + " XIRR: " + top3[itr].xirr;
            }
              
			response.writeHead(200, {'Content-Type': contentType});
			response.write(data);
		}
		response.end();
	});
}