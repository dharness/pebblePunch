var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var sockets = require('./lib/sockets');
var fs = require('fs');
var port = 6113;


// ============= 		PUBLIC ACCESS	 	============= //
app.get('/',function(req,res){
	console.log("GET received");
	res.sendFile('public/index.html', {root: __dirname} );
});

app.post('/',function(req,res){
	console.log('POST');
	var data = '';
	req.on('data',function(chunk){
		data += chunk;
	});
	req.on('end',function(err){
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
		port = 6113;
	}
	http.listen(port, function(){
		console.log('starting on port:'+port);
	})
});