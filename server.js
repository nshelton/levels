var http = require('http');
var fs = require('fs');
var path = require('path');

http.createServer(function (request, response) {
    console.log('request starting...');

    var filePath = '.' + request.url;
    var extname = path.extname(filePath);
    var contentType = 'text/html';
    switch (extname) {
        case '.js':     contentType = 'text/javascript';    break;
        case '.css':    contentType = 'text/css';           break;
        case '.json':   contentType = 'application/json';   break;
        case '.png':    contentType = 'image/png';          break;      
        case '.jpg':    contentType = 'image/jpg';          break;
        case '.wav':    contentType = 'audio/wav';          break;
    }

    fs.readFile(filePath, function(error, content) {
            response.writeHead(200, { 'Content-Type': contentType });
            response.end(content, 'utf-8');
    });

}).listen(8125);
console.log('Server running at http://127.0.0.1:8125/');




// var osc = require('node-osc');

// var oscServer = new osc.Server(8000, '192.168.8.140'); // set this to the lemur IP in the app
// oscServer.on("message", function(msg, rinfo) {
//     console.log("TUIO message:");
//     console.log(msg);
// });
