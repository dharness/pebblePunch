var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var path = require('path'); 
var fs = require('fs');
var activeUsers = 0;
var ejs = require('ejs');
var port = 6113;

var codeId = 1;
var database	= require('./lib/database');
var sockets = require('./lib/sockets');


app.get('/',function(req,res){
	console.log("GET received");
	res.sendFile('view/index.html', {root: __dirname} );
});
app.get('/js/:var',function(req,res){
	res.sendFile('view/js/'+req.param('var'), {root: __dirname} );
});
app.get('/images/:var',function(req,res){
	res.sendFile('view/images/'+req.param('var'), {root: __dirname} );
});

// ============= 	PULLING THE PUNCHES	 	============= //
app.post('/',function(req,res){
	var data = '';
	console.log("POST received");
	req.on('data',function(chunk){
		data += chunk;
	});
	req.on('end',function(){
		console.log(data);
		try{
			// RESPOND TO PUNCH
			var src		 = req.ip;
			sockets.punch(src);
			// LOG PUNCH
			var jsonData = JSON.parse(data);
			database.log(jsonData,function(response){
				res.send(response);
			});
		} catch(err){
			console.log(err);
			res.send(err);
		}
	});
});

// ============= 		SOCKET SETUP	 	============= //
io.on('connection',function(socket){
	activeUsers++;
	console.log('active users:' + activeUsers);
	socket.on('disconnect', function(){
		activeUsers--;
    	console.log('active users:' + activeUsers);
    	sockets.remove(sockets.extractSessionId(socket))
  	});
  	socket.emit("identify",sockets.extractSessionId(socket));
  	sockets.save(socket);
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