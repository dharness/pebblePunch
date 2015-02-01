var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var sockets = require('./lib/sockets');
var fs = require('fs');
var port;

var IpIdMap = {};

// meta filter
var activeItems;
// ============= 		PUBLIC ACCESS	 	============= //
app.get('/',function(req,res){
	console.log("GET received");
	res.sendFile('public/index.html', {root: __dirname} );
});

app.get('/key/:var',function(req,res){
	var watchKey = req.param('var');
	database.retrieve(watchKey,function(databaseData){
		res.render('./public/view.ejs',databaseData)
		activeItems = databaseData;	
	});
}

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
			database.save(req.ip,IpIdMap[req.ip],data,data.moveName)
			res.sendStatus(200);
			//redirect them to '/key/'+IpIdMap[req.ip]
		} else {
			res.send('Please buy a Pebble to use this service.');
		}
	});
});

// ============= 		ANALYSIS	 	============= //

//
var lastItem;
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
		for(var i=0; i< activeItems.length; i++){
			var destinationIp = activeItems[i].ip;
			var name = activeItems[i].activity;
			var pass = false;
			for(var j =0; j< activeItems[i].boxes.length; j++){
				if()
			}
			sockets.send(destinationIp,'LOGGED: 1 -'+name, name);
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