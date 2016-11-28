//import express 
var express = require('express');
//create express object named app
var app = express();

//instantiate a server on port 3000
var server = app.listen(3000);
var io = require('socket.io')(server);

//expose the local public folder for inluding files js, css etc..
app.use(express.static('.'));

//on a request to / serve index.html
app.get('/', function(req, res) {
    res.sendFile(__dirname + '/index.html');
});


var dims = ['x', 'y', 'z'];
var types = ['rotation, translation'];

setInterval(function() {
      var index = Math.floor(Math.random() * 3);
      var type = Math.floor(Math.random() * 3);
      var r = Math.random() * 3.1415;
      //emit data on a websocket called mysocket

      io.sockets.emit("data", [types[type] + dims[index], r]);
      console.log(keys[index], r);
}, 10000);




// var osc = require('node-osc');

// var oscServer = new osc.Server(8000, '192.168.8.140'); // set this to the lemur IP in the app
// oscServer.on("message", function(msg, rinfo) {
//     console.log("TUIO message:");
//     console.log(msg);
// });
