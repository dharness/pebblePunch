var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var sockets = require('./lib/sockets');
var fs = require('fs');
var port;

var IpIdMap = {};

// ============= 		PUBLIC ACCESS	 	============= //
app.get('/',function(req,res){
	console.log("GET received");
	res.sendFile('public/index.html', {root: __dirname} );
});

app.post('/data',function(req,res){
	var data = '';
	req.on('data',function(chunk){
		data += chunk;
	});
	req.on('end',function(err){
		console.log(data);
		try {
			data = JSON.parse(data);
		} catch(err){
			console("JSON ERROR:" + err);
		}
		if(typeof IpIdMap[req.ip] !== 'undefined'){
			for (var i =0; i< data.length; i++){
				if(data[i].type == "Circle"){
					// handle CIRCLE
				} 
					else //if(type  == "Box")
				{
					// handle BOX;
				}
			}
			res.sendStatus(200);
		} else {
			res.send('Please buy a Pebble to use this service.');
		}
	});
});

// ============= 		PUBLIC ACCESS	 	============= //
app.post('/',function(req,res){
	console.log('POST');
	var data = '';
	req.on('data',function(chunk){
		data += chunk;
	});
	req.on('end',function(err){
		if(typeof IpIdMap[req.ip] == 'undefined'){
			IpIdMap[req.ip] = data.id;
			IpIdMap[data.id] = req.ip;
		}
		console.log(req.ip + ' '+data +'point')
		sockets.send(req.ip,data,'point');
		res.send(200)
	});
});

// ============= 		SOCKET SETUP	 	============= //
io.on('connection',function(socket){
	socket.on('disconnect', function(){
    	sockets.remove(sockets.extractSessionId(socket))
  	});
  	socket.emit("identify",sockets.extractSessionId(socket));
  	sockets.save(socket);
  	socket.on('couple',function(destIp){
  		sockets.addViewer(sockets.extractSessionId(this),destIp);
  	});
});


// ============= 	LOAD CONFIG AND LAUNCH	 ============= //
fs.exists('config/config.js',function(exists){
	if(exists){
		port = require('./config/config').port;
	} else {
		//dev
		port = 6113;
	}
	http.listen(port, function(){
		console.log('starting on port:'+port);
	})
});