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
var types = ['rotation', 'translation'];

function switchItUp() {
      var i = Math.floor(Math.random() * 3);
      var t  = Math.floor(Math.random() * 2);
      var r = Math.random();

      if (t == 0)
      	r *= 3.1415 * 2.0;

      if (t == 1)
      	r *= 50;

      //emit data on a websocket called mysocket
      var data = [types[t] + dims[i], r];
      io.sockets.emit("data", data);

      console.log(data);
}

var modifyTranslation    = false;
var modifyRotation       = false;


var osc = require('node-osc');

//gyrosc is pretty sweet for orientation. I wish I could customize the interface. 
//Maybe I will have to build my own app
// var oscTouchServer = new osc.Server(9000, '192.168.0.101'); // gray area
var oscTouchServer = new osc.Server(9000, '192.168.1.66'); //

oscTouchServer.on("message", function(msg, rinfo) {
    
    // console.log(msg);

    // handle state changes
    if ( msg[0] == '/1/toggle4' ) //rotation
        modifyRotation = msg[1]

    if ( msg[0] == '/1/toggle2' ) //translation
        modifyTranslation = msg[1]


    if ( msg[0] == '/1/fader1' ) //iterations
        io.sockets.emit("data", ["iterCount", msg[1] * 8]);                


    if ( msg[0] == '/1/fader2' ) //mirrors
        io.sockets.emit("data", ["absMirror", msg[1]]);                


    if (msg[2] && msg[2][0])
    switch (msg[2][0]) {
    	case "/gyrosc/gyro" :
            if (modifyRotation)
            {
                io.sockets.emit("data", ["rotationx", msg[2][1] * 2.0]);
                io.sockets.emit("data", ["rotationy", msg[2][2] * 2.0]);
                io.sockets.emit("data", ["rotationz", msg[2][3] * 2.0]);                
            }
            if (modifyTranslation)
            {
                io.sockets.emit("data", ["translationx", 50.0 * Math.abs(msg[2][1]) / 3.14]);
                io.sockets.emit("data", ["translationy", 50.0 * Math.abs(msg[2][2]) / 3.14]);
                io.sockets.emit("data", ["translationz", 50.0 * Math.abs(msg[2][3]) / 3.14]);                
            }


			break;
	}

});



// // this is for DataRacket, which I haven't figured out how to use well except for the "Attack" part
// var oscDataRacketServer = new osc.Server(9000, '127.0.0.1');

// oscDataRacketServer.on("message", function(msg, rinfo) {
//     console.log("TUIO message:");
//     console.log(msg);

//     switch (msg[0]) {
//     	case '/audio/attack' :
// 			switchItUp();
// 			break;

//     	case '/audio/noise' :
//       		io.sockets.emit("data", ["dimy", msg[1] * 50]);
// 			break;

// 		default:
// 			break;
//     }
// });


