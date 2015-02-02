var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var sockets = require('./lib/sockets');
var fs = require('fs');
var port;

var ejs = require('ejs');
var database = require('./lib/database');

var IpIdMap = {};

// meta filter
var activeItems = [];
// ============= 		PUBLIC ACCESS	 	============= //
app.get('/',function(req,res){
	console.log("GET received");
	res.sendFile('public/index.html', {root: __dirname} );
});

app.get('/key/:var',function(req,res){
	var watchKey = req.param('var');
	database.retrieve(watchKey,function(databaseData){
		//res.render('./public/view.ejs',databaseData)
		activeItems = databaseData;	
	});
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
			console.log("JSON ERROR:" + err);
		}
		if(typeof data.smartId !== 'undefined'){
			database.save(req.ip,data.smartId,data,data.mode,data.motion)
			res.sendStatus(200);
			//redirect them to '/key/'+IpIdMap[req.ip]
		} else {
			res.send('Please buy a Pebble to use this service.');
		}
	});
});

// ============= 		ANALYSIS	 	============= //

//
var lastAccel;
var currentAccel ={x:0,y:0};
var currentJerk	 ={};
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
		lastAccel = currentAccel;
		currentAccel.x = data.x;
		currentAccel.y = data.y;
		currentJerk.x = data.x - lastAccel.x;
		currentJerk.y = data.y - lastAccel.y;
		for(var i=0; i< activeItems.length; i++){
			var destinationIp = activeItems[i].ip;
			var name = activeItems[i].activity;
			var type = activeItems[i].mode;
			var pass = {};
			for(var j =0; j< activeItems[i].boxArray.length; j++){
				if( type == 'jerk'){
					if(activeItems[i].boxArray[j].tl.x < currentJerk.x){
						if(activeItems[i].boxArray[j].tl.y > currentJerk.y){
							if(activeItems[i].boxArray[j].br.x > currentJerk.x){
								if(activeItems[i].boxArray[j].br.y < currentJerk.y){
									pass = true;
								}
							}
						}
					}
				} else {
					if(activeItems[i].boxArray[j].tl.x < currentJerk.x){
						if(activeItems[i].boxArray[j].tl.y > currentJerk.y){
							if(activeItems[i].boxArray[j].br.x > currentJerk.x){
								if(activeItems[i].boxArray[j].br.y < currentJerk.y){
									pass = true;
								}
							}
						}
					}
				}
			}
			if(pass){
				for(var j =0; j< activeItems[i].circleArray.length; j++){
					var squaredX, squaredY;
					if( type == 'jerk'){
						squaredX = (currentJerk.x-activeItems[i].circleArray[i].center.x)*(currentJerk.x-activeItems[i].circleArray[i].center.x);
						squaredY = (currentJerk.y-activeItems[i].circleArray[i].center.y)*(currentJerk.y-activeItems[i].circleArray[i].center.y);
					} else {
						squaredX = (currentAccel.x-activeItems[i].circleArray[i].center.x)*(currentAccel.x-activeItems[i].circleArray[i].center.x);
						squaredY = (currentAccel.y-activeItems[i].circleArray[i].center.y)*(currentAccel.y-activeItems[i].circleArray[i].center.y);
					}
					if(activeItems[i].circleArray[j].radius * activeItems[i].circleArray[j].radius > (squaredY + squaredX)){
						pass = false;
					}
				}
			}
			if(pass){
				console.log(name);
				sockets.send(destinationIp,'LOGGED: 1 -'+name, name);
			}
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