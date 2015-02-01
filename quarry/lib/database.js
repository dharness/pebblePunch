var mongoose  	= require('mongoose');
var DeveloperAccount 	= require('../models/DeveloperAccount');
var configDB = require('../config/database');
var database = {};

ongoose.connect(configDB.url);

database.save = function(ipAddr,smartId,jsonData, name){
	var circles = [];
	var boxes = [];
	for (var i =0; i< data.length; i++){
		if(data[i].type == "Circle"){
			// handle CIRCLE
			var circle = {};
			circle['center'] = {};
			circle['center'].x = data[i].center.x;
			circle['center'].y = data[i].center.y;
			circle['radius'] = data[i].radius;
			//circle['center'].z = data[i].center.z;
			circles.push(circle);
		} 
			else //if(type  == "Box")
		{
			// handle BOX;
			var box = {};
			box['tl'] = {};
			box['tl'].x = data[i].tl.x;
			box['tl'].y = data[i].tl.y;
			box['br'] = {};
			box['br'].x = data[i].br.x;
			box['br'].y = data[i].br.y;
			boxes.push(box);
		}
	}
	devAccount = new DeveloperAccount({
		watchId:smartId,
		ip:ipAddr,
		mode:"XY",
		holdoff:"500",
		activity:name,
		circleArray:circles,
		boxArray:boxes
	});
}

database.retrieve = function(smartId, callback){
	DeveloperAccount.find({watchId:smartId}, function(err,docs){
		if(err) console.log(err);
		console.log(docs);
		callback(docs);
	});
}