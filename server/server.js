var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var path = require('path'); 
var fs = require('fs');
var activeUsers = 0;
var ejs = require('ejs');
var port = 6113;
var mongoose  = require('mongoose');

var codeId = 1;


app.get('/',function(req,res){
	console.log("GET received");
	var data = '';
	req.on('data',function(chunk){
		data += chunk;
	});
	req.on('end',function(chunk){
		console.log(data);
	});
	res.send('hello world.');
});
app.post('/',function(req,res){
	var data = '';
	console.log("POST received");
	req.on('data',function(chunk){
		data += chunk;
	});
	req.on('end',function(chunk){
		console.log(data);
	});
	res.send('hello world');
});


// ========= LOAD CONFIG AND LAUNCH ============= //
var configDB = require('./config/database');
mongoose.connect(configDB.url);
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
