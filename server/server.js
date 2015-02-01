var app 	= require('express')();
var http 	= require('http').Server(app);
var io 		= require('socket.io')(http);
var path 	= require('path'); 
var fs 		= require('fs');
// STATS
var activeUsers = 0;
// CONFIG
var port ;
// MODULES
var database	= require('./lib/database');
var sockets = require('./lib/sockets');

// ============= 		PUBLIC ACCESS	 	============= //
app.get('/example/',function(req,res){
	console.log("GET received");
	res.sendFile('view/index.html', {root: __dirname} );
});
app.get('/example/:var',function(req,res){
	res.sendFile('view/'+req.param('var'), {root: __dirname} );
});
app.get('/example/js/:var',function(req,res){
	res.sendFile('view/js/'+req.param('var'), {root: __dirname} );
});
app.get('/example/images/:var',function(req,res){
	res.sendFile('view/images/'+req.param('var'), {root: __dirname} );
});
// ============= 	SPYING/VIEWING MODE	 	============= //
app.get('/display',function(req,res){
	res.sendFile('view/viewer.html', {root: __dirname} )
});

// ============= 	PULLING THE PUNCHES	 	============= //
app.post('/',function(req,res){
	// parse data --> JSON
	var data = '';
	req.on('data',function(chunk){
		data += chunk;
	});
	req.on('end',function(){
		console.log("POST:"+data);
		try{
			data = JSON.parse(data);
			// RESPOND TO PUNCH
			var src		 = req.ip;
			sockets.send(src,data,'punch');
			
			// LOG PUNCH
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
	//STATS, also book-keeping, adding and removing active stats.
	activeUsers++;
	console.log('active users:' + activeUsers);
	socket.on('disconnect', function(){
		activeUsers--;
    	console.log('active users:' + activeUsers);
    	sockets.remove(sockets.extractSessionId(socket))
  	});
  	sockets.save(socket);
	// DEBUGGING
  	socket.emit("identify",sockets.extractSessionId(socket));
  	
  	// COUPLE sockets
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